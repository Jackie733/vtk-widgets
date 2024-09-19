import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import vtkImageData from '@kitware/vtk.js/Common/DataModel/ImageData';
import { useImageStore } from './images';
import { useDICOMStore } from './dicom';
import { useFileStore } from './files';
import {
  DataSelection,
  isDicomImage,
  isRegularImage,
} from '../utils/dataSelection';

export const DataType = {
  Image: 'Image',
  Model: 'Model',
};

export const useDatasetStore = defineStore('dataset', () => {
  const imageStore = useImageStore();
  const dicomStore = useDICOMStore();
  const fileStore = useFileStore();

  const primarySelection = ref<DataSelection | null>(null);

  const primaryImageID = primarySelection;

  const primaryDataset = computed<vtkImageData | null>(() => {
    const { dataIndex } = imageStore;
    return (primaryImageID.value && dataIndex[primaryImageID.value]) || null;
  });

  const idsAsSelections = computed(() => {
    const volumeKeys = Object.keys(dicomStore.volumeInfo);
    const images = imageStore.idList.filter((id) => isRegularImage(id));
    return [...volumeKeys, ...images];
  });

  function setPrimarySelection(sel: DataSelection | null) {
    primarySelection.value = sel;
    if (!sel) return;

    // if selection is dicom, call buildVolume
    if (isDicomImage(sel)) {
      dicomStore.buildVolume(sel);
    }
  }

  const remove = (id: string) => {
    if (id === primarySelection.value) {
      primarySelection.value = null;
    }

    if (isDicomImage(id)) {
      dicomStore.deleteVolume(id);
    }
    imageStore.deleteData(id);

    fileStore.remove(id);
  };

  return {
    primaryImageID,
    primarySelection,
    primaryDataset,
    idsAsSelections,
    setPrimarySelection,
    remove,
  };
});
