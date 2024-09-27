import Pipeline, { PipelineContext } from '@/src/core/pipeline';
import { ensureError } from '@/src/utils';
import * as path from '@/src/utils/path';
import { Awaitable } from '@vueuse/core';
import {
  ArchiveContents,
  ImportContext,
  ImportHandler,
  ImportResult,
} from '../common';
import downloadUrl from './downloadUrl';
import updateFileMimeType from './updateFileMimeType';
import doneWithDataSource from './doneWithDataSource';
import extractArchiveTarget from './extractArchiveTarget';
import { Dataset, Manifest } from '../../state-file/schema';
import { FileEntry } from '../../types';
import { DataSource, fileToDataSource } from '../dataSource';

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
}
