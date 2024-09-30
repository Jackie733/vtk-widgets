import Pipeline, { PipelineContext } from '@/src/core/pipeline';
import { ensureError, partition } from '@/src/utils';
import * as path from '@/src/utils/path';
import { Awaitable } from '@vueuse/core';
import { useDICOMStore } from '@/src/store/dicom';
import { useViewStore } from '@/src/store/views';
import { useDatasetStore } from '@/src/store/datasets';
import {
  ArchiveContents,
  ImportContext,
  ImportHandler,
  ImportResult,
  isLoadableResult,
} from '../common';
import downloadUrl from './downloadUrl';
import updateFileMimeType from './updateFileMimeType';
import doneWithDataSource from './doneWithDataSource';
import extractArchiveTarget from './extractArchiveTarget';
import { Dataset, Manifest, ManifestSchema } from '../../state-file/schema';
import { FileEntry } from '../../types';
import {
  DataSource,
  DataSourceWithFile,
  fileToDataSource,
} from '../dataSource';
import { extractFilesFromZip } from '../../zip';
import { MANIFEST, isStateFile } from '../../state-file';

const resolveUriSource: ImportHandler = async (dataSource, { extra, done }) => {
  const { uriSrc } = dataSource;

  if (uriSrc) {
    const result = await new Pipeline([
      downloadUrl,
      updateFileMimeType,
      doneWithDataSource,
    ]).execute(dataSource, extra);
    if (!result.ok) {
      throw result.errors[0].cause;
    }

    return done({
      dataSource: result.data[0].dataSource,
    });
  }

  return dataSource;
};

const processParentIfNotFile: ImportHandler = async (
  dataSource,
  { execute }
) => {
  const { fileSrc, parent } = dataSource;
  if (!fileSrc && parent) {
    const result = await execute(parent);
    if (!result.ok) {
      throw new Error('Could not process parent', {
        cause: ensureError(result.errors[0].cause),
      });
    }
    // update the parent
    return {
      ...dataSource,
      parent: result.data[0].dataSource,
    };
  }
  return dataSource;
};

const resolveArchiveMember: ImportHandler = async (
  dataSource,
  { extra, done }
) => {
  if (dataSource.archiveSrc) {
    const pipeline = new Pipeline([
      extractArchiveTarget,
      updateFileMimeType,
      doneWithDataSource,
    ]);
    const result = await pipeline.execute(dataSource, extra);
    if (!result.ok) {
      throw result.errors[0].cause;
    }
    return done({
      dataSource: result.data[0].dataSource,
    });
  }
  return dataSource;
};

function getDataSourcesForDataset(
  dataset: Dataset,
  manifest: Manifest,
  stateFileContents: FileEntry[]
) {
  const isStateFile = stateFileContents
    .filter(
      (entry) =>
        path.normalize(entry.archivePath) === path.normalize(dataset.path)
    )
    .map((entry) => fileToDataSource(entry.file));
  return [...isStateFile];
}

async function restoreDatasets(
  manifest: Manifest,
  datasetFiles: FileEntry[],
  { extra, execute }: PipelineContext<DataSource, ImportResult, ImportContext>
) {
  const archiveCache = new Map<File, Awaitable<ArchiveContents>>();

  const stateDatasetFiles = datasetFiles.map((datasetFile) => {
    return {
      ...datasetFile,
      archivePath: path.normalize(datasetFile.archivePath),
    };
  });

  const { datasets } = manifest;
  // Mapping of the state file ID => new store ID
  const stateIDToStoreID: Record<string, string> = {};

  const resolvePipeline = new Pipeline([
    updateFileMimeType,
    resolveUriSource,
    // process parent after resolving the uri source, so we don't
    // unnecessarily download ancestor UriSources.
    processParentIfNotFile,
    resolveArchiveMember,
    doneWithDataSource,
  ]);

  await Promise.all(
    datasets.map(async (dataset) => {
      let datasetDataSources = getDataSourcesForDataset(
        dataset,
        manifest,
        stateDatasetFiles
      );

      datasetDataSources = await Promise.all(
        datasetDataSources.map(async (source) => {
          const result = await resolvePipeline.execute(source, {
            ...extra,
            archiveCache,
          });
          if (!result.ok) {
            throw result.errors[0].cause;
          }
          return result.data[0].dataSource;
        })
      );

      const dicomSources: DataSourceWithFile[] = [];
      const importResults = await Promise.all(
        datasetDataSources.map((source) =>
          execute(source, {
            ...extra,
            archiveCache,
            dicomDataSources: dicomSources,
          })
        )
      );

      if (dicomSources.length) {
        const dicomStore = useDICOMStore();
        const volumeKeys = await dicomStore.importFiles(dicomSources);
        if (volumeKeys.length !== 1) {
          throw new Error('Obtained more than one volume from DICOM import');
        }

        const [key] = volumeKeys;
        await dicomStore.buildVolume(key);
        stateIDToStoreID[dataset.id] = key;
      } else if (importResults.length === 1) {
        if (!importResults[0].ok) {
          throw importResults[0].errors[0].cause;
        }

        const [result] = importResults;
        if (result.data.length !== 1) {
          throw new Error(
            'Import encountered multiple volumes for a single dataset'
          );
        }

        const importResult = result.data[0];
        if (!isLoadableResult(importResult)) {
          throw new Error('Failed to import dataset');
        }

        stateIDToStoreID[dataset.id] = importResult.dataID;
      } else {
        throw new Error('Could not load any data from the session');
      }
    })
  );

  return stateIDToStoreID;
}

const restoreStateFile: ImportHandler = async (dataSource, pipelineContext) => {
  const { fileSrc } = dataSource;
  if (fileSrc && (await isStateFile(fileSrc.file))) {
    const stateFileContents = await extractFilesFromZip(fileSrc.file);

    const [manifests, restOfStateFile] = partition(
      (dataFile) => dataFile.file.name === MANIFEST,
      stateFileContents
    );

    if (manifests.length !== 1) {
      throw new Error('State file does not have exactly 1 manifest');
    }

    const manifestString = await manifests[0].file.text();
    const manifest = ManifestSchema.parse(manifestString);

    useViewStore().setLayout(manifest.layout);

    const stateIDToStoreID = await restoreDatasets(
      manifest,
      restOfStateFile,
      pipelineContext
    );

    // Restore the primary selection
    if (manifest.primarySelection !== undefined) {
      const selectedID = stateIDToStoreID[manifest.primarySelection];

      useDatasetStore().setPrimarySelection(selectedID);
    }

    // Restore the views
    // useViewStore()
  }
};
