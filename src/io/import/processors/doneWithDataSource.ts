import { ImportHandler } from '../common';

const doneWithDataSource: ImportHandler = (dataSource, { done }) => {
  return done({ dataSource });
};

export default doneWithDataSource;
