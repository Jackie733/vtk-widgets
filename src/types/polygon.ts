import type { Vector3 } from '@kitware/vtk.js/types';
import { AnnotationTool } from './annotation-tool';

export type Polygon = {
  points: Array<Vector3>;
} & AnnotationTool;
