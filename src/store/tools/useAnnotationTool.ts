import {
  STROKE_WIDTH_ANNOTATION_TOOL_DEFAULT,
  TOOL_COLORS,
} from '@/src/config';
import { AnnotationTool, ToolID } from '@/src/types/annotation-tool';
import type { Vector3 } from '@kitware/vtk.js/types';
import { StoreActions, StoreGetters, StoreState } from 'pinia';
import { UnwrapNestedRefs } from 'vue';
import { IToolStore } from './types';

const annotationToolLabelDefault = Object.freeze({
  strokeWidth: STROKE_WIDTH_ANNOTATION_TOOL_DEFAULT as number,
});

const makeAnnotationToolDefaults = () => ({
  frameOfReference: {
    planeOrigin: [0, 0, 0],
    planeNormal: [1, 0, 0],
  },
  slice: -1,
  imageID: '',
  placing: false,
  color: TOOL_COLORS[0],
  strokeWidth: STROKE_WIDTH_ANNOTATION_TOOL_DEFAULT,
  name: 'baseAnnotationTool',
});

// export const useAnnotationTool = <
//   MakeToolDefaults extends (...args: any) => any,
//   LabelProps
// >({
//   toolDefaults,
//   initialLabels,
//   newLabelDefault,
// }: {
//   toolDefaults: MakeToolDefaults;
//   initialLabels: Labels<LabelProps>;
//   newLabelDefault?: LabelProps;
// }) => {};
//
type ToolFactory<T extends AnnotationTool> = (...args: any[]) => T;

export type AnnotationToolAPI<T extends AnnotationTool> = {
  getPoints(id: ToolID): Vector3[];
};

type UseAnnotationToolBasedStore<T extends AnnotationTool> = StoreState<
  AnnotationToolAPI<T>
> &
  StoreActions<AnnotationToolAPI<T>> &
  UnwrapNestedRefs<StoreGetters<AnnotationToolAPI<T>>>;

export interface AnnotationToolStore<T extends AnnotationTool = AnnotationTool>
  extends UseAnnotationToolBasedStore<T>,
    IToolStore {}
