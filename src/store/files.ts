import { DataSourceWithFile } from '@/src/io/import/dataSource';
import { defineStore } from 'pinia';

interface State {
  byDataID: Record<string, DataSourceWithFile[]>;
}

export const useFileStore = defineStore('files', {
  state: (): State => ({
    byDataID: {},
  }),
  getters: {
    getDataSources: (state) => (dataID: string) => state.byDataID[dataID] ?? [],
    getFiles: (state) => (dataID: string) =>
      (state.byDataID[dataID] ?? []).map((ds) => ds.fileSrc.file),
  },
  actions: {
    remove(dataID: string) {
      if (dataID in this.byDataID) {
        delete this.byDataID[dataID];
      }
    },
    add(dataID: string, files: DataSourceWithFile[]) {
      this.byDataID[dataID] = files;
    },
  },
});
