import { WLAutoRanges } from '@/src/constants';
import { LayoutDirection } from '@/src/types/layout';
import type { LPSAxis } from '@/src/types/lps';
import type { FrameOfReference } from '@/src/utils/frameOfReference';
import type { Vector3 } from '@kitware/vtk.js/types';
import JSZip from 'jszip';
import { z } from 'zod';
import { Tools as ToolsEnum } from '@/src/store/tools/types';
import type {
  CameraConfig,
  SliceConfig,
  WindowLevelConfig,
} from '../../store/view-configs/types';

export enum DatasetType {
  DICOM = 'dicom',
  IMAGE = 'image',
}

const DatasetTypeNative = z.nativeEnum(DatasetType);

const LPSAxisDir = z.union([
  z.literal('Left'),
  z.literal('Right'),
  z.literal('Posterior'),
  z.literal('Anterior'),
  z.literal('Superior'),
  z.literal('Inferior'),
]);

const Dataset = z.object({
  id: z.string(),
  path: z.string(),
  type: DatasetTypeNative,
});
export type Dataset = z.infer<typeof Dataset>;

const LayoutDirectionNative = z.nativeEnum(LayoutDirection);

export interface Layout {
  name?: string;
  direction: LayoutDirection;
  items: Array<Layout | string>;
}

const Layout: z.ZodType<Layout> = z.lazy(() =>
  z.object({
    name: z.string().optional(),
    direction: LayoutDirectionNative,
    items: z.array(z.union([Layout, z.string()])),
  })
);

const Vector3 = z.tuple([
  z.number(),
  z.number(),
  z.number(),
]) satisfies z.ZodType<Vector3>;

type AutoRangeKeys = keyof typeof WLAutoRanges;
const WindowLevelConfig = z.object({
  width: z.number(),
  level: z.number(),
  min: z.number(),
  max: z.number(),
  auto: z.string() as z.ZodType<AutoRangeKeys>,
  preset: z.object({ width: z.number(), level: z.number() }),
}) satisfies z.ZodType<WindowLevelConfig>;

const SliceConfig = z.object({
  slice: z.number(),
  min: z.number(),
  max: z.number(),
  axisDirection: LPSAxisDir,
  syncState: z.boolean(),
}) satisfies z.ZodType<SliceConfig>;

const CameraConfig = z.object({
  parallelScale: z.number().optional(),
  position: Vector3.optional(),
  focalPoint: Vector3.optional(),
  directionOfProjection: Vector3.optional(),
  viewUp: Vector3.optional(),
  syncState: z.boolean().optional(),
}) satisfies z.ZodType<CameraConfig>;

const ViewConfig = z.object({
  window: WindowLevelConfig.optional(),
  slice: SliceConfig.optional(),
  camera: CameraConfig.optional(),
});
export type ViewConfig = z.infer<typeof ViewConfig>;

const View = z.object({
  id: z.string(),
  type: z.string(),
  props: z.record(z.any()),
  config: z.record(ViewConfig),
});
export type View = z.infer<typeof View>;

const RGBAColor = z.tuple([z.number(), z.number(), z.number(), z.number()]);

const SegmentMask = z.object({
  value: z.number(),
  name: z.string(),
  color: RGBAColor,
});

export const SegmentGroupMetadata = z.object({
  name: z.string(),
  parentImage: z.string(),
  segments: z.object({
    order: z.number().array(),
    byValue: z.record(z.string(), SegmentMask),
  }),
});

export const LabelMap = z.object({
  id: z.string(),
  path: z.string(),
  metadata: SegmentGroupMetadata,
});
export type LabelMap = z.infer<typeof LabelMap>;

const LPSAxis = z.union([
  z.literal('Axial'),
  z.literal('Sagittal'),
  z.literal('Coronal'),
]) satisfies z.ZodType<LPSAxis>;

const FrameOfReference = z.object({
  planeOrigin: Vector3,
  planeNormal: Vector3,
}) satisfies z.ZodType<FrameOfReference>;

const Crosshairs = z.object({
  position: Vector3,
});
export type Crosshairs = z.infer<typeof Crosshairs>;

const ToolsEnumNative = z.nativeEnum(ToolsEnum);

const Tools = z.object({
  crosshairs: Crosshairs,
  current: ToolsEnumNative,
});

export const ManifestSchema = z.object({
  version: z.string(),
  datasets: Dataset.array(),
  labelMaps: LabelMap.array(),
  tools: Tools,
  views: View.array(),
  primarySelection: z.string().optional(),
  layout: Layout,
});
export type Manifest = z.infer<typeof ManifestSchema>;

export interface StateFile {
  zip: JSZip;
  manifest: Manifest;
}
