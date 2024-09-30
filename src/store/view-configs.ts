import { defineStore } from 'pinia';
import { useViewSliceStore } from './view-configs/slicing';
import useWindowingStore from './view-configs/windowing';
import { useImageStore } from './images';

export const useViewConfigStore = defineStore('viewConfig', () => {
  const viewSliceStore = useViewSliceStore();
  const windowingStore = useWindowingStore();

  const removeView = (viewID: string) => {
    viewSliceStore.removeView(viewID);
    windowingStore.removeView(viewID);
  };

  const removeData = (dataID: string, viewID?: string) => {
    viewSliceStore.removeData(dataID, viewID);
    windowingStore.removeData(dataID, viewID);
  };

  // delete hook
  const imageStore = useImageStore();
  imageStore.$onAction(({ name, args }) => {
    if (name === 'deleteData') {
      const [id] = args;
      removeData(id);
    }
  });

  return {
    removeView,
    removeData,
  };
});
