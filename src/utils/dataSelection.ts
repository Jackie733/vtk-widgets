import { useErrorMessage } from '../composables/useErrorMessage';
import { getDisplayName, useDICOMStore } from '../store/dicom';
import { useImageStore } from '../store/images';
import { Maybe } from '../types';

export type DataSelection = string;

export const selectionEquals = (a: DataSelection, b: DataSelection) => a === b;

export const isDicomImage = (imageID: Maybe<string>) => {
  if (!imageID) return false;
  const store = useDICOMStore();
  return imageID in store.volumeInfo;
};

export const isRegularImage = (imageID: Maybe<string>) => {
  if (!imageID) return false;
  return !isDicomImage(imageID);
};

export const getImage = async (imageID: string) => {
  const images = useImageStore();
  const dicoms = useDICOMStore();
  if (isDicomImage(imageID)) {
    // ensure image data exists
    await useErrorMessage('Failed to build volume', () =>
      dicoms.buildVolume(imageID)
    );
  }
  return images.dataIndex[imageID];
};

const getImageName = (imageID: string) => {
  return useImageStore().metadata[imageID].name;
};

export const getSelectionName = (selection: string) => {
  if (isDicomImage(selection)) {
    return getDisplayName(useDICOMStore().volumeInfo[selection]);
  }
  return getImageName(selection);
};
