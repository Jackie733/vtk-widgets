import { computed, MaybeRef, unref } from 'vue';
import { watchImmediate } from '@vueuse/core';
import { Maybe } from '../types';
import { useVolumeColoringStore } from '../store/view-configs/volume-coloring';
import { useImage } from './useCurrentImage';

export function useVolumeColoringInitializer(
  viewId: MaybeRef<string>,
  imageId: MaybeRef<Maybe<string>>
) {
  const store = useVolumeColoringStore();
  const coloringConfig = computed(() =>
    store.getConfig(unref(viewId), unref(imageId))
  );

  const { imageData, isLoading } = useImage(imageId);

  watchImmediate([coloringConfig, viewId, imageId, isLoading], () => {
    if (coloringConfig.value || isLoading.value) return;

    const viewIdVal = unref(viewId);
    const imageIdVal = unref(imageId);
    if (!imageIdVal || !imageData.value) return;

    store.resetToDefaultColoring(viewIdVal, imageIdVal, imageData.value);
  });
}
