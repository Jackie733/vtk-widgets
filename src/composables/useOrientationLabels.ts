import type { Vector3 } from '@kitware/vtk.js/types';
import { MaybeRef, computed, ref, unref } from 'vue';
import { vec3 } from 'gl-matrix';
import { EPSILON } from '../constants';
import { View } from '../core/vtk/types';
import { vtkFieldRef } from '../core/vtk/vtkFieldRef';
import { onVTKEvent } from './onVTKEvent';

export function toOrderedLabels(vec: Vector3) {
  return (
    vec
      .map((v, i) => ({ value: v, axis: i }))
      // remove components close to zero, since we won't show those labels
      .filter(({ value }) => Math.abs(value) > EPSILON)
      // sort from largest to smallest component
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
      // apply labels
      .map(({ value, axis }) => (Math.sign(value) === 1 ? 'LPS' : 'RAI')[axis])
      .join('')
  );
}

/**
 * Computes orientation labels for a given view.
 *
 * Labels are with respect to the current camera orientation.
 *
 * vtk.js coordinate is implied to the LPS, so orientation Labels
 * are determined solely from the camera direction and view-up.
 */
export function useOrientationLabels(view: MaybeRef<View>) {
  const renderer = computed(() => unref(view).renderer);
  const camera = vtkFieldRef(renderer, 'activeCamera');

  const top = ref('');
  const left = ref('');
  const right = ref('');
  const bottom = ref('');

  function updateAxes() {
    const vup = camera.value.getViewUp();
    const vdir = camera.value.getDirectionOfProjection();
    const vright = [0, 0, 0] as Vector3;

    vec3.cross(vright, vdir, vup);

    const vbottom = vup.map((c) => c * -1) as Vector3;
    const vleft = vright.map((c) => c * -1) as Vector3;

    top.value = toOrderedLabels(vup);
    right.value = toOrderedLabels(vright);
    bottom.value = toOrderedLabels(vbottom);
    left.value = toOrderedLabels(vleft);
  }

  onVTKEvent(camera, 'onModified', updateAxes);
  updateAxes();

  return { top, right, bottom, left };
}
