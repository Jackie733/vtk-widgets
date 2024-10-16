import { Maybe } from '@/src/types';
import { defineStore } from 'pinia';
import { Manifest, StateFile } from '@/src/io/state-file/schema';
import { AnnotationToolType, IToolStore, Tools } from './types';
import { AnnotationToolStore } from './useAnnotationTool';

interface State {
  currentTool: Tools;
}

export const AnnotationToolStoreMap: Record<
  AnnotationToolType,
  () => AnnotationToolStore
> = {
  [AnnotationToolType.Polygon]: null,
  [AnnotationToolType.Rectangle]: null,
  [AnnotationToolType.Ruler]: null,
} as const;

export const ToolStoreMap: Record<Tools, Maybe<() => IToolStore>> = {
  [Tools.Pan]: null,
  [Tools.WindowLevel]: null,
  [Tools.Zoom]: null,
  [Tools.Select]: null,
} as const;

export function useAnnotationToolStore(
  type: AnnotationToolType
): AnnotationToolStore {
  const useStore = AnnotationToolStoreMap[type];
  return useStore();
}

function setupTool(tool: Tools) {
  const useStore = ToolStoreMap[tool];
  const store = useStore?.();
  if (store?.activateTool) {
    return store.activateTool?.();
  }
  return true;
}

function teardownTool(tool: Tools) {
  const useStore = ToolStoreMap[tool];
  const store = useStore?.();
  if (store) {
    store.deactivateTool?.();
  }
}

export const useToolStore = defineStore('tool', {
  state: (): State => ({
    currentTool: Tools.WindowLevel,
  }),
  actions: {
    setCurrentTool(tool: Tools) {
      if (!setupTool(tool)) {
        return;
      }
      teardownTool(this.currentTool);
      this.currentTool = tool;
    },
    serialize(state: StateFile) {
      const { tools } = state.manifest;

      Object.values(ToolStoreMap)
        .map((useStore) => useStore?.())
        .filter((store): store is IToolStore => !!store)
        .forEach((store) => {
          store.serialize?.(state);
        });

      tools.current = this.currentTool;
    },
    deserialize(
      manifest: Manifest,
      segmentGroupIDMap: Record<string, string>,
      dataIDMap: Record<string, string>
    ) {
      const { tools } = manifest;

      // usePaintToolStore().deserialize(manifest, segmentGroupIDMap);
      // TODO:

      this.currentTool = tools.current;
    },
  },
});
