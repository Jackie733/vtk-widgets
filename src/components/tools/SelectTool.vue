<script setup lang="ts">
import { inject } from 'vue';
import { useToolSelectionStore } from '@/src/store/tools/toolSelection';
import { onVTKEvent } from '@/src/composables/onVTKEvent';
import { vtkAnnotationToolWidget } from '@/src/vtk/ToolWidgetUtils/types';
import { WIDGET_PRIORITY } from '@kitware/vtk.js/Widgets/Core/AbstractWidget/Constants';
import { VtkViewContext } from '../vtk/context';

const view = inject(VtkViewContext);
if (!view) throw new Error('No VtkView');

const selectionStore = useToolSelectionStore();

onVTKEvent(
  view.interactor,
  'onLeftButtonPress',
  (event: any) => {
    const withModifiers = !!(event.shiftKey || event.controlKey);
    const selectedData = view.widgetManager.getSelectedData();
    console.log('onLeftButtonPress', event, selectedData);
    if ('widget' in selectedData) {
      // clicked in empty space.
      const widget = selectedData.widget as vtkAnnotationToolWidget;
      const widgetState = widget.getWidgetState();
      const id = widgetState.getId();
      const type = widgetState.getToolType();
      // preserve if we've used shift or ctrl
      if (withModifiers) {
        selectionStore.toggleSelection(id, type);
      } else {
        selectionStore.clearSelection();
        selectionStore.addSelection(id, type);
      }
    } else if (!withModifiers) {
      // if no modifiers, then deselect
      selectionStore.clearSelection();
    }
  },
  // capture all events by calling handler before widgets
  { priority: WIDGET_PRIORITY + 1 }
);

const render = () => {};
</script>

<template>
  <render />
</template>
