import { ensureError } from '@/src/utils';
import { ImportHandler } from '../common';
import { readConfigFile } from '../configJson';

const handleConfig: ImportHandler = async (dataSource, { done }) => {
  const { fileSrc } = dataSource;
  if (fileSrc?.fileType === 'application/json') {
    try {
      const manifest = await readConfigFile(fileSrc.file);
      // Dont't consume JSON if it has no known key
      if (Object.keys(manifest).length === 0) {
        return dataSource;
      }
      return done({ dataSource, config: manifest });
    } catch (err) {
      throw new Error('Failed to parse config file', {
        cause: ensureError(err),
      });
    }
  }
  return dataSource;
};

export default handleConfig;