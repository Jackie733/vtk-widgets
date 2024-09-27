import type { Vector3 } from '@kitware/vtk.js/types';

/**
 * Defines a 2D plane used for locating annotations.
 */
export interface FrameOfReference {
  planeNormal: Vector3;
  planeOrigin: Vector3;
}
