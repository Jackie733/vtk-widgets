import {
  computed,
  hasInjectionContext,
  inject,
  InjectionKey,
  MaybeRef,
  Ref,
  unref,
} from 'vue';
import { storeToRefs } from 'pinia';
import { Maybe } from '../types';
import { defaultImageMetadata, useImageStore } from '../store/images';
import { createLPSBounds, getAxisBounds } from '../utils/lps';
import { useDatasetStore } from '../store/datasets';

export interface CurrentImageContext {
  imageID: Ref<Maybe<string>>;
}

export const CurrentImageInjectionKey = Symbol(
  'CurrentImage'
) as InjectionKey<CurrentImageContext>;

// Returns a spatially inflated image extent
export function getImageSpatialExtent(imageID: Maybe<string>) {
  const imageStore = useImageStore();

  if (imageID && imageID in imageStore.metadata) {
    const { lpsOrientation } = imageStore.metadata[imageID];
    const image = imageStore.dataIndex[imageID];
    if (image) {
      const extent = image.getSpatialExtent();
      return {
        Sagittal: getAxisBounds(extent, 'Sagittal', lpsOrientation),
        Coronal: getAxisBounds(extent, 'Coronal', lpsOrientation),
        Axial: getAxisBounds(extent, 'Axial', lpsOrientation),
      };
    }
  }
  return createLPSBounds();
}

export function getImageMetadata(imageID: Maybe<string>) {
  const { metadata } = useImageStore();
  if (!imageID) return defaultImageMetadata();
  return metadata[imageID] ?? defaultImageMetadata();
}

export function getImageData(imageID: Maybe<string>) {
  const { dataIndex } = useImageStore();
  return imageID ? dataIndex[imageID] ?? null : null;
}

export function getIsImageLoading(imageID: Maybe<string>) {
  if (!imageID) return false;
  const imageStore = useImageStore();
  return !imageStore.dataIndex[imageID];
}

export function useImage(imageID: MaybeRef<Maybe<string>>) {
  return {
    id: computed(() => unref(imageID)),
    imageData: computed(() => getImageData(unref(imageID))),
    metadata: computed(() => getImageMetadata(unref(imageID))),
    extent: computed(() => getImageSpatialExtent(unref(imageID))),
    isLoading: computed(() => getIsImageLoading(unref(imageID))),
    // layers: computed(() => getImageLayers(unref(imageID))),
  };
}

export function useCurrentImage() {
  const { primaryImageID } = storeToRefs(useDatasetStore());
  const defaultContext = { imageID: primaryImageID };
  const { imageID } = hasInjectionContext()
    ? inject(CurrentImageInjectionKey, defaultContext)
    : defaultContext;

  const { id, imageData, metadata, extent, isLoading } = useImage(imageID);
  return {
    currentImageID: id,
    currentImageMetadata: metadata,
    currentImageData: imageData,
    currentImageExtent: extent,
    isImageLoading: isLoading,
  };
}
