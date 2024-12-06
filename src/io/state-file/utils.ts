import { useFileStore } from '@/src/store/files';
import { DatasetType, StateFile } from './schema';

export async function serializeData(
  stateFile: StateFile,
  dataIDs: string[],
  dataType: DatasetType
) {
  const fileStore = useFileStore();
  const { zip } = stateFile;
  const {
    manifest: { datasets },
  } = stateFile;

  dataIDs.forEach((id) => {
    const sources = fileStore.getDataSources(id);
    if (!sources.length) {
      throw new Error(`No files for dataID: ${id}`);
    }

    // TODO
  });
}
