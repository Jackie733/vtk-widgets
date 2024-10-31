import { WLAutoRanges } from '@/src/constants';
import { LPSAxisDir } from '@/src/types/lps';
import type { Vector3 } from '@kitware/vtk.js/types';
import {
  ColorTransferFunction,
  BlendConfig,
  OpacityFunction,
} from '@/src/types/views';

export interface CameraConfig {
  parallelScale?: number;
  position?: Vector3;
  focalPoint?: Vector3;
  directionOfProjection?: Vector3;
  viewUp?: Vector3;
  syncState?: boolean;
}

export interface SliceConfig {
  slice: number;
  min: number;
  max: number;
  axisDirection: LPSAxisDir;
  syncState: boolean;
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
export interface LayersConfig {
  colorBy: {
    arrayName: string;
    location: string;
  };
  transferFunction: ColorTransferFunction;
  opacityFunction: OpacityFunction;
  blendConfig: BlendConfig;
}
