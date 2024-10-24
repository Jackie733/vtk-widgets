import { computed, MaybeRef, unref } from 'vue';
import { Vector2 } from '@kitware/vtk.js/types';
import { Maybe } from '../types';
import {
  defaultSliceConfig,
  useViewSliceStore,
} from '../store/view-configs/slicing';

export function useSliceConfig(
  viewID: MaybeRef<string>,
  imageID: MaybeRef<Maybe<string>>
) {
  const store = useViewSliceStore();
  const configDefaults = defaultSliceConfig();
  const config = computed(() => store.getConfig(unref(viewID), unref(imageID)));

  const slice = computed({
    get: () => config.value?.slice ?? configDefaults.slice,
    set: (val) => {
      const imageIdVal = unref(imageID);
      if (!imageIdVal || val == null) return;
      store.updateConfig(unref(viewID), imageIdVal, { slice: val });

      // Update other synchronized views if any
      if (config.value?.syncState) {
        store.updateSyncConfigs();
      }
    },
  });

  const range = computed((): Vector2 => {
    const { min, max } = config.value ?? {};
    if (min == null || max == null) {
      return [configDefaults.min, configDefaults.max];
    }
    return [min, max];
  });

  return { config, slice, range };
}
