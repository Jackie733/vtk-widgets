import { WLAutoRanges } from '@/src/constants';
import { LPSAxisDir } from '@/src/types/lps';

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
