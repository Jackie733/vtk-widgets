import { StateFile, ViewConfig } from '@/src/io/state-file/schema';
import { ensureDefault } from '@/src/utils';
import { DoubleKeyRecord } from '@/src/utils/doubleKeyRecord';
import {
  CameraConfig,
  SliceConfig,
  WindowLevelConfig,
  VolumeColorConfig,
} from './types';

type SubViewConfig =
  | CameraConfig
  | SliceConfig
  | WindowLevelConfig
  | VolumeColorConfig;

type ViewConfigGetter = (
  viewID: string,
  dataID: string
) => SubViewConfig | undefined;

type ViewConfigStateKey = keyof ViewConfig;

export const serializeViewConfig = <K extends ViewConfigStateKey>(
  stateFile: StateFile,
  configGetter: ViewConfigGetter,
  ViewConfigStateKey: K
) => {
  const dataIDs = stateFile.manifest.datasets.map((dataset) => dataset.id);
  const { views } = stateFile.manifest;

  views.forEach((view) => {
    dataIDs.forEach((dataID) => {
      const { config } = view;
      const viewConfig = configGetter(view.id, dataID);
      if (viewConfig !== undefined) {
        const configForData = ensureDefault(dataID, config, {} as ViewConfig);

        configForData[ViewConfigStateKey] = viewConfig as ViewConfig[K];
      }
    });
  });
};

export const serializeViewConfigV2 = <
  K extends ViewConfigStateKey,
  V extends ViewConfig[K]
>(
  stateFile: StateFile,
  viewConfigs: DoubleKeyRecord<V>,
  viewConfigStateKey: K
) => {
  const dataIDs = stateFile.manifest.datasets.map((dataset) => dataset.id);
  const { views } = stateFile.manifest;

  views.forEach((view) => {
    dataIDs.forEach((dataID) => {
      const { config } = view;

      const viewConfig = viewConfigs[view.id]?.[dataID];
      if (viewConfig !== undefined) {
        const configForData = ensureDefault(dataID, config, {} as ViewConfig);

        configForData[viewConfigStateKey] = viewConfig as ViewConfig[K];
      }
    });
  });
};

export const createViewConfigSerializer = <
  K extends ViewConfigStateKey,
  V extends ViewConfig[K]
>(
  viewConfigs: DoubleKeyRecord<V>,
  viewConfigStateKey: K
) => {
  return (stateFile: StateFile) =>
    serializeViewConfigV2(stateFile, viewConfigs, viewConfigStateKey);
};
