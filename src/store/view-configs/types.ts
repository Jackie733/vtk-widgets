import { WLAutoRanges } from '@/src/constants';
import { LPSAxisDir } from '@/src/types/lps';
import type { Vector3 } from '@kitware/vtk.js/types';

export interface CameraConfig {
  parallelScale?: number;
  position?: Vector3;
  focalPoint?: Vector3;
  directionOfProjection?: Vector3;
  viewUp?: Vector3;
}

export interface SliceConfig {
  slice: number;
  min: number;
  max: number;
  axisDirection: LPSAxisDir;
}

export interface WindowLevelConfig {
  width: number;
  level: number;
  min: number;
  max: number;
  auto: keyof typeof WLAutoRanges;
  preset: {
    width: number;
    level: number;
  };
}
