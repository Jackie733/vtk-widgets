import { computed, MaybeRef, unref } from 'vue';
import type { Vector2 } from '@kitware/vtk.js/types';
import { Maybe } from '../types';
import useWindowingStore from '../store/view-configs/windowing';

export function useWindowingConfig(
  viewID: MaybeRef<string>,
  imageID: MaybeRef<Maybe<string>>
) {
  const store = useWindowingStore();
  const config = computed(() => store.getConfig(unref(viewID), unref(imageID)));

  const generateComputed = (prop: 'width' | 'level') => {
    return computed({
      get: () => config.value?.[prop] ?? 0,
      set: (val) => {
        const imageIdVal = unref(imageID);
        if (!imageIdVal || val == null) return;
        store.updateConfig(unref(viewID), imageIdVal, { [prop]: val });
      },
    });
  };

  const range = computed((): Vector2 => {
    const { min, max } = config.value ?? {};
    if (min == null || max == null) return [0, 1];
    return [min, max];
  });

  return {
    config,
    width: generateComputed('width'),
    level: generateComputed('level'),
    range,
  };
}
