<script lang="ts" setup>
import vtkMouseRangeManipulator, {
  IMouseRangeManipulatorInitialValues,
} from '@kitware/vtk.js/Interaction/Manipulators/MouseRangeManipulator';
import { Maybe } from '@/src/types';
import { computed, inject, toRefs } from 'vue';
import vtkInteractorStyleManipulator from '@kitware/vtk.js/Interaction/Style/InteractorStyleManipulator';
import { useVtkInteractionManipulator } from '@/src/core/vtk/useVtkInteractionManipulator';
import { useWindowingConfig } from '@/src/composables/useWindowingConfig';
import { useWindowingConfigInitializer } from '@/src/composables/useWindowingConfigInitializer';
import type { Vector2 } from '@kitware/vtk.js/types';
import { useMouseRangeManipulatorListener } from '@/src/core/vtk/useMouseRangeManipulatorListener';
import { syncRef } from '@vueuse/core';
import { VtkViewContext } from './context';

interface Props {
  viewId: string;
  imageId: Maybe<string>;
  manipulatorConfig?: IMouseRangeManipulatorInitialValues;
}

const props = defineProps<Props>();
const { viewId, imageId, manipulatorConfig } = toRefs(props);

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
    dragEnabled: true,
    scrollEnabled: false,
    ...manipulatorConfig?.value,
  };
});

const { instance: rangeManipulator } = useVtkInteractionManipulator(
  interactorStyle,
  vtkMouseRangeManipulator,
  config
);

const wlConfig = useWindowingConfig(viewId, imageId);
useWindowingConfigInitializer(viewId, imageId);

const computeStep = (range: Vector2) => {
  return Math.min(range[1] - range[0], 1) / 256;
};
const wlStep = computed(() => computeStep(wlConfig.range.value));

const horiz = useMouseRangeManipulatorListener(
  rangeManipulator,
  'horizontal',
  wlConfig.range,
  wlStep,
  wlConfig.level.value
);

const vert = useMouseRangeManipulatorListener(
  rangeManipulator,
  'vertical',
  computed(() => [1e-12, wlConfig.range.value[1] - wlConfig.range.value[0]]),
  wlStep,
  wlConfig.width.value
);

syncRef(horiz, wlConfig.level, { immediate: true });
syncRef(vert, wlConfig.width, { immediate: true });
</script>

<template><slot></slot></template>
