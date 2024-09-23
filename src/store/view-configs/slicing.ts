import { defineStore } from 'pinia';
import { reactive } from 'vue';
import {
  deleteSecondKey,
  DoubleKeyRecord,
  getDoubleKeyRecord,
  patchDoubleKeyRecord,
} from '@/src/utils/doubleKeyRecord';
import { Maybe } from '@/src/types';
import { clampValue } from '@kitware/vtk.js/Common/Core/Math';
import { SliceConfig } from './types';

export const defaultSliceConfig = (): SliceConfig => ({
  slice: 0,
  min: 0,
  max: 0,
  axisDirection: 'Inferior',
});

export const useViewSliceStore = defineStore('viewSlice', () => {
  const configs = reactive<DoubleKeyRecord<SliceConfig>>({});

  const getConfig = (viewID: Maybe<string>, dataID: Maybe<string>) =>
    getDoubleKeyRecord(configs, viewID, dataID);

  const updateConfig = (
    viewID: string,
    dataID: string,
    patch: Partial<SliceConfig>
  ) => {
    const config = {
      ...defaultSliceConfig(),
      ...getConfig(viewID, dataID),
      ...patch,
    };

    config.slice = clampValue(config.slice, config.min, config.max);
    patchDoubleKeyRecord(configs, viewID, dataID, config);
  };

  const resetSlice = (viewID: string, dataID: string) => {
    const config = getConfig(viewID, dataID);
    if (!config) return;

    updateConfig(viewID, dataID, {
      slice: Math.ceil((config.min + config.max) / 2),
    });
  };

  const removeView = (viewID: string) => {
    delete configs[viewID];
  };

  const removeData = (dataID: string, viewID?: string) => {
    if (viewID) {
      delete configs[viewID]?.[dataID];
    } else {
      deleteSecondKey(configs, dataID);
    }
  };

  return {
    configs,
    getConfig,
    updateConfig,
    resetSlice,
    removeView,
    removeData,
  };
});
