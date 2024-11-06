import { Maybe } from '@/src/types';
import { defineStore } from 'pinia';
import { Manifest, StateFile } from '@/src/io/state-file/schema';
import { AnnotationToolType, IToolStore, Tools } from './types';
import type { AnnotationToolStore } from './useAnnotationTool';
import { useCrosshairsToolStore } from './crosshairs';
import { useRulerStore } from './rulers';
import { usePaintToolStore } from './paint';
import { usePolygonStore } from './polygons';

interface State {
  currentTool: Tools;
}

export const AnnotationToolStoreMap: Record<
  AnnotationToolType,
  () => AnnotationToolStore
> = {
  [AnnotationToolType.Polygon]: usePolygonStore,
  // [AnnotationToolType.Rectangle]: null,
  [AnnotationToolType.Ruler]: useRulerStore,
} as const;

export const ToolStoreMap: Record<Tools, Maybe<() => IToolStore>> = {
  [Tools.Pan]: null,
  [Tools.WindowLevel]: null,
  [Tools.Crosshairs]: useCrosshairsToolStore,
  [Tools.Paint]: usePaintToolStore,
  ...AnnotationToolStoreMap,
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

      usePaintToolStore().deserialize(manifest, segmentGroupIDMap);

      Object.values(ToolStoreMap)
        .filter((useStore) => useStore !== usePaintToolStore)
        .map((useStore) => useStore?.())
        .filter((store): store is IToolStore => !!store)
        .forEach((store) => {
          store.deserialize?.(manifest, dataIDMap);
        });

      this.currentTool = tools.current;
    },
  },
});
