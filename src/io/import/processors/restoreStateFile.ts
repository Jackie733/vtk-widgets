import Pipeline from '@/src/core/pipeline';
import { ensureError } from '@/src/utils';
import { argv0 } from 'process';
import { ImportHandler } from '../common';
import downloadUrl from './downloadUrl';
import updateFileMimeType from './updateFileMimeType';
import doneWithDataSource from './doneWithDataSource';
import extractArchiveTarget from './extractArchiveTarget';
import { Dataset } from '../../state-file/schema';

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

function getDataSourcesForDataset(dataset: Dataset, manifest: string) {}
