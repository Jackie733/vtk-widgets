import { MaybeRef, computed, toRef, unref } from 'vue';
import type { vtkRange } from '@kitware/vtk.js/interfaces';
import { watchImmediate } from '@vueuse/core';
import { Maybe } from '../types';
import { LPSAxisDir } from '../types/lps';
import { useViewSliceStore } from '../store/view-configs/slicing';
import { useSliceConfig } from './useSliceConfig';
import { useImage } from './useCurrentImage';
import { getLPSAxisFromDir } from '../utils/lps';

export function useSliceConfigInitializer(
  viewID: MaybeRef<string>,
  imageID: MaybeRef<Maybe<string>>,
  viewDirection: MaybeRef<LPSAxisDir>,
  slicingDomain?: MaybeRef<vtkRange>
) {
  const store = useViewSliceStore();
  const { config: sliceConfig } = useSliceConfig(viewID, imageID);
  const { metadata, isLoading } = useImage(imageID);

  const viewAxis = computed(() => getLPSAxisFromDir(unref(viewDirection)));
  const sliceDomain = computed(() => {
    const domainArg = unref(slicingDomain);
    if (domainArg) return domainArg;
    const { lpsOrientation, dimensions } = metadata.value;
    const ijkIndex = lpsOrientation[viewAxis.value];
    const dimMax = dimensions[ijkIndex];

    return {
      min: 0,
      max: dimMax - 1,
    };
  });

  watchImmediate(
    [
      toRef(sliceDomain),
      toRef(viewDirection),
      toRef(imageID),
      isLoading,
    ] as const,
    ([domain, axisDirection, id, loading]) => {
      if (loading || !id) return;

      const configExisted = !!sliceConfig.value;
      store.updateConfig(unref(viewID), id, {
        ...domain,
        axisDirection,
      });
      if (!configExisted) {
        store.resetSlice(unref(viewID), id);
      }
    }
  );
}
