export const NOOP = () => {};

export const WLAutoRanges = {
  FullRange: 0,
  LowContrast: 1.0,
  MediumContrast: 2.0,
  HighContrast: 5.0,
};
export const WL_AUTO_DEFAULT = 'FullRange';
export const WL_HIST_BINS = 512;

export const WLPresetsCT = {
  Head: {
    Brain: {
      width: 80,
      level: 40,
    },
    Subdural: {
      width: 300,
      level: 100,
    },
    Stroke: {
      width: 40,
      level: 40,
    },
    Bones: {
      width: 2800,
      level: 600,
    },
    SoftTissue: {
      width: 400,
      level: 60,
    },
  },
  Chest: {
    Lungs: {
      width: 1500,
      level: -600,
    },
    Mediastinum: {
      width: 350,
      level: 50,
    },
  },
  Abdomen: {
    SoftTissue: {
      width: 400,
      level: 50,
    },
    Liver: {
      width: 150,
      level: 30,
    },
  },
  Spine: {
    SoftTissue: {
      width: 250,
      level: 50,
    },
    Bones: {
      width: 1800,
      level: 400,
    },
  },
};
