<script setup lang="ts">
import { Maybe } from '@/src/types';
import { LPSAxisDir } from '@/src/types/lps';
import vtkMouseRangeManipulator, {
  IMouseRangeManipulatorInitialValues,
} from '@kitware/vtk.js/Interaction/Manipulators/MouseRangeManipulator';
import { computed, inject, toRefs } from 'vue';
import vtkInteractorStyleManipulator from '@kitware/vtk.js/Interaction/Style/InteractorStyleManipulator';
import { useVtkInteractionManipulator } from '@/src/core/vtk/useVtkInteractionManipulator';
import { useSliceConfig } from '@/src/composables/useSliceConfig';
import { useSliceConfigInitializer } from '@/src/composables/useSliceConfigInitializer';
import { useMouseRangeManipulatorListener } from '@/src/core/vtk/useMouseRangeManipulatorListener';
import { syncRef } from '@vueuse/core';
import { VtkViewContext } from './context';

interface Props {
  viewId: string;
  imageId: Maybe<string>;
  viewDirection: LPSAxisDir;
  manipulatorConfig?: IMouseRangeManipulatorInitialValues;
}

const props = defineProps<Props>();
const { viewId, imageId, viewDirection, manipulatorConfig } = toRefs(props);

const view = inject(VtkViewContext);
if (!view) throw new Error('No VtkView');

const interactorStyle =
  view.interactorStyle as Maybe<vtkInteractorStyleManipulator>;
if (!interactorStyle?.isA('vtkInteractorStyleManipulator')) {
  throw new Error('No VtkInteractorStyleManipulator');
}

const config = computed(() => {
  return {
    button: 1,
    dragEnabled: false,
    scrollEnabled: true,
    ...manipulatorConfig?.value,
  };
});

const { instance: rangeManipulator } = useVtkInteractionManipulator(
  interactorStyle,
  vtkMouseRangeManipulator,
  config
);

const sliceConfig = useSliceConfig(viewId, imageId);
useSliceConfigInitializer(viewId, imageId, viewDirection);

const scroll = useMouseRangeManipulatorListener(
  rangeManipulator,
  'scroll',
  sliceConfig.range,
  1,
  sliceConfig.slice.value
);

syncRef(scroll, sliceConfig.slice, { immediate: true });
</script>

<template><slot></slot></template>
