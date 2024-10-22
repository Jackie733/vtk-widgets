import { computed, MaybeRef } from 'vue';
import type { Vector3 } from '@kitware/vtk.js/types';
import { Maybe } from '../types';
import { useImage } from './useCurrentImage';
import { useSliceConfig } from './useSliceConfig';
import { getLPSAxisFromDir } from '../utils/lps';

/**
 * Returns information about the current slice.
 *
 * axisName: the name of the axis
 * axisIndex: corresponding index in an LPS coordinate array
 * number: slice value
 * planeNormal: slice plane normal
 * planeOrigin: slice plane origin
 * @param viewID
 */
export function useSliceInfo(
  viewID: MaybeRef<string>,
  imageID: MaybeRef<Maybe<string>>
) {
  const { metadata: imageMetadata } = useImage(imageID);
  const { slice, config } = useSliceConfig(viewID, imageID);
  return computed(() => {
    if (!config.value) return null;
    const { lpsOrientation } = imageMetadata.value;
    const { axisDirection } = config.value;
    const axis = getLPSAxisFromDir(axisDirection);
    const planeOrigin = [0, 0, 0] as Vector3;
    planeOrigin[lpsOrientation[axis]] = slice.value;
    return {
      axisName: axis,
      axisIndex: lpsOrientation[axis],
      slice: slice.value,
      planeNormal: lpsOrientation[axisDirection] as Vector3,
      planeOrigin,
    };
  });
}
