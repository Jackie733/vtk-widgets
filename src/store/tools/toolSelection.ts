import { ToolID } from '@/src/types/annotation-tool';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { AnnotationToolType } from './types';

export interface ToolSelection {
  id: ToolID;
  type: AnnotationToolType;
}

export const useToolSelectionStore = defineStore('tool-selection', () => {
  type Selections = Record<ToolID, AnnotationToolType>;
  const selectionMap = ref<Selections>(Object.create(null));

  function addSelection(id: ToolID, type: AnnotationToolType) {
    if (id in selectionMap.value) return;
    selectionMap.value[id] = type;
  }

  function clearSelection() {
    selectionMap.value = Object.create(null);
  }

  function removeSelection(id: ToolID) {
    if (!(id in selectionMap.value)) return;
    delete selectionMap.value[id];
  }

  function toggleSelection(id: ToolID, type: AnnotationToolType) {
    if (id in selectionMap.value) {
      removeSelection(id);
    } else {
      addSelection(id, type);
    }
  }

  function isSelected(id: ToolID) {
    return id in selectionMap.value;
  }

  const selection = computed<ToolSelection[]>(() => {
    return Object.entries(selectionMap.value).map(([id, type]) => ({
      id: id as ToolID,
      type,
    }));
  });

  return {
    addSelection,
    clearSelection,
    removeSelection,
    toggleSelection,
    isSelected,
    selection,
  };
});
