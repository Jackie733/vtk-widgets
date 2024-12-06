import Pipeline, {
  PipelineResult,
  PipelineResultSuccess,
} from '@/src/core/pipeline';
import { useDICOMStore } from '@/src/store/dicom';
import {
  ImportHandler,
  ImportResult,
  isConfigResult,
  isLoadableResult,
  VolumeResult,
} from './common';
import { DataSource, DataSourceWithFile } from './dataSource';
import updateFileMimeType from './processors/updateFileMimeType';
import downloadUrl from './processors/downloadUrl';
import extractArchiveTarget from './processors/extractArchiveTarget';
import extractArchive from './processors/extractArchive';
import handleDicomFile from './processors/handleDicomFile';
import restoreStateFile from './processors/restoreStateFile';
import importSingleFile from './processors/importSingleFile';
import handleConfig from './processors/handleConfig';
import { applyConfig } from './configJson';

/**
 * Tries to turn a thrown object into a meaningful error string.
 * @param error
 * @returns
 */
function toMeaningfulErrorString(thrown: unknown) {
  const strThrown = String(thrown);
  if (!strThrown || strThrown === '[object Object]') {
    return 'Unknown error. More details in the dev console.';
  }
  return strThrown;
}

const unhandledResource: ImportHandler = () => {
  throw new Error('Failed to handle resource');
};

function isSelectable(
  result: PipelineResult<DataSource, ImportResult>
): result is PipelineResultSuccess<VolumeResult> {
  if (!result.ok) return false;
  if (result.data.length === 0) return false;

  const importResult = result.data[0];
  if (!isLoadableResult(importResult)) return false;
  if (importResult.dataType === 'model') return false;

  return true;
}

const importConfigs = async (
  results: Array<PipelineResult<DataSource, ImportResult>>
) => {
  try {
    results
      .flatMap((pipelineResult) =>
        pipelineResult.ok ? pipelineResult.data : []
      )
      .filter(isConfigResult)
      .map(({ config }) => config)
      .forEach(applyConfig);

    return {
      ok: true as const,
      data: [],
    };
  } catch (err) {
    return {
      ok: false as const,
      errors: [
        {
          message: toMeaningfulErrorString(err),
          cause: err,
          inputDataStackTrace: [],
        },
      ],
    };
  }
};

const importDicomFiles = async (
  dicomDataSources: Array<DataSourceWithFile>
) => {
  const resultSources: DataSource = {
    dicomSrc: {
      sources: dicomDataSources,
    },
  };
  try {
    if (!dicomDataSources.length) {
      return {
        ok: true as const,
        data: [],
      };
    }
    const volumeKeys = await useDICOMStore().importFiles(dicomDataSources);
    return {
      ok: true as const,
      data: volumeKeys.map((key) => ({
        dataID: key,
        dataType: 'dicom' as const,
        dataSource: resultSources,
      })),
    };
  } catch (err) {
    return {
      ok: false as const,
      errors: [
        {
          message: toMeaningfulErrorString(err),
          cause: err,
          inputDataStackTrace: [resultSources],
        },
      ],
    };
  }
};

export async function importDataSources(dataSources: DataSource[]) {
  const importContext = {
    fetchFileCache: new Map<string, File>(),
    dicomDataSources: [] as DataSourceWithFile[],
  };

  const middleware = [
    // updating the file type should be first in the pipeline
    updateFileMimeType,
    restoreStateFile,
    downloadUrl,
    extractArchiveTarget,
    extractArchive,
    handleConfig, // collect config files to apply later
    // should be before importSingleFile, since DICOM is more specific
    handleDicomFile,
    importSingleFile,
    unhandledResource,
  ];
  const loader = new Pipeline(middleware);

  const results = await Promise.all(
    dataSources.map((r) => loader.execute(r, importContext))
  );

  const configResult = await importConfigs(results);
  const dicomResult = await importDicomFiles(importContext.dicomDataSources);
  console.log('DATA: ', configResult, dicomResult, results);

  return [...results, dicomResult, configResult].filter(
    (result) => !result.ok || isSelectable(result)
  );
}

export type ImportDataSourcesResult = Awaited<
  ReturnType<typeof importDataSources>
>[number];

export function toDataSelection(loadable: VolumeResult) {
  const { dataID } = loadable;
  return dataID;
}

export function convertSuccessResultToDataSelection(
  result: ImportDataSourcesResult
) {
  if (!isSelectable(result)) return null;
  const importResult = result.data[0];
  return toDataSelection(importResult);
}
