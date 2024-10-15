import { AnnotationToolType, Tools } from './types';

interface State {
  currentTool: Tools;
}

export const AnnotationToolStoreMap: Record<
  AnnotationToolType,
  () => AnnotationToolStore
> = {};
