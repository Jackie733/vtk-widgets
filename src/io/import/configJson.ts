import { Layouts } from '@/src/config';
import useLoadDataStore from '@/src/store/load-data';
import { useSegmentGroupStore } from '@/src/store/segmentGroups';
import { usePolygonStore } from '@/src/store/tools/polygons';
import { useRectangleStore } from '@/src/store/tools/rectangles';
import { useRulerStore } from '@/src/store/tools/rulers';
import { AnnotationToolStore } from '@/src/store/tools/useAnnotationTool';
import useWindowingStore from '@/src/store/view-configs/windowing';
import { useViewStore } from '@/src/store/views';
import { zodEnumFromObjKeys } from '@/src/utils';
import { z } from 'zod';

const layout = z
  .object({
    activeLayout: zodEnumFromObjKeys(Layouts).optional(),
  })
  .optional();

// Labels
const color = z.string();

const label = z.object({
  color,
  strokeWidth: z.number().optional(),
});

const rulerLabel = label;
const polygonLabel = label;

const rectangleLabel = z.intersection(
  label,
  z.object({
    fillColor: color,
  })
);

const labels = z
  .object({
    defaultLabels: z.record(label).or(z.null()).optional(),
    rulerLabels: z.record(rulerLabel).or(z.null()).optional(),
    rectangleLabels: z.record(rectangleLabel).or(z.null()).optional(),
    polygonLabels: z.record(polygonLabel).or(z.null()).optional(),
  })
  .optional();

// IO
const io = z.object({
  segmentGroupSaveFormat: z.string().optional(),
  setmentGroupExtension: z.string().default(''),
});

const windowing = z
  .object({
    level: z.number(),
    width: z.number(),
  })
  .optional();

export const config = z.object({
  layout,
  labels,
  io,
  windowing,
});

export type Config = z.infer<typeof config>;

export const readConfigFile = async (configFile: File) => {
  const decoder = new TextDecoder();
  const ab = await configFile.arrayBuffer();
  const text = decoder.decode(new Uint8Array(ab));
  return config.parse(JSON.parse(text));
};

const applyLabels = (manifest: Config) => {
  if (!manifest.labels) return;

  const defaultLabelsIfUndefined = <T>(toolLabels: T) => {
    if (toolLabels === undefined) return manifest.labels?.defaultLabels;
    return toolLabels;
  };

  const applyLabelsToStore = (
    store: AnnotationToolStore,
    maybeLabels: (typeof manifest.labels)[keyof typeof manifest.labels]
  ) => {
    const labelsOrFallback = defaultLabelsIfUndefined(maybeLabels);
    if (!labelsOrFallback) return;
    store.clearDefaultLabels();
    store.mergeLabels(labelsOrFallback);
  };

  const { rulerLabels, rectangleLabels, polygonLabels } = manifest.labels;
  applyLabelsToStore(useRulerStore(), rulerLabels);
  applyLabelsToStore(useRectangleStore(), rectangleLabels);
  applyLabelsToStore(usePolygonStore(), polygonLabels);
};

const applyLayout = (manifest: Config) => {
  if (manifest.layout?.activeLayout) {
    const startingLayout = Layouts[manifest.layout.activeLayout];
    useViewStore().setLayout(startingLayout);
  }
};

const applyIO = (manifest: Config) => {
  if (!manifest.io) return;

  if (manifest.io.segmentGroupSaveFormat) {
    useSegmentGroupStore().saveFormat = manifest.io.segmentGroupSaveFormat;
  }
  useLoadDataStore().segmentGroupExtension = manifest.io.setmentGroupExtension;
};

const applyWindowing = (manifest: Config) => {
  if (!manifest.windowing) return;
  useWindowingStore().runtimeConfigWindowLevel = manifest.windowing;
};

export const applyConfig = (manifest: Config) => {
  applyLayout(manifest);
  applyLabels(manifest);
  applyIO(manifest);
  applyWindowing(manifest);
};
