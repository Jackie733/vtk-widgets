import { LPSAxisDir } from '@/src/types/lps';

export interface SliceConfig {
  slice: number;
  min: number;
  max: number;
  axisDirection: LPSAxisDir;
}
