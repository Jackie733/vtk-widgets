<script setup lang="ts">
import { VtkObjectConstructor } from '@/src/core/vtk/types';
import vtkCompositeMouseManipulator, {
  type ICompositeMouseManipulatorInitialValues,
} from '@kitware/vtk.js/Interaction/Manipulators/CompositeMouseManipulator';
import { computed, inject, toRefs } from 'vue';
import { Maybe } from '@/src/types';
import vtkInteractorStyleManipulator from '@kitware/vtk.js/Interaction/Style/InteractorStyleManipulator';
import { useVtkInteractionManipulator } from '@/src/core/vtk/useVtkInteractionManipulator';
import { VtkViewContext } from './context';

interface Props {
  manipulatorConstructor: VtkObjectConstructor<vtkCompositeMouseManipulator>;
  manipulatorProps?: ICompositeMouseManipulatorInitialValues;
}

const props = defineProps<Props>();
const { manipulatorConstructor, manipulatorProps } = toRefs(props);

const view = inject(VtkViewContext);
if (!view) throw new Error('No VtkView');

const interactorStyle =
  view.interactorStyle as Maybe<vtkInteractorStyleManipulator>;
if (!interactorStyle?.isA('vtkInteractorStyleManipulator')) {
  throw new Error('No vtkInteractorStyleManipulator');
}

const draggableManipulatorProps = computed(() => ({
  dragEnabled: true,
  ...manipulatorProps?.value,
}));

const { instance } = useVtkInteractionManipulator(
  interactorStyle,
  manipulatorConstructor,
  draggableManipulatorProps
);

defineExpose({
  manipulator: instance,
});
</script>

<template>
  <slot></slot>
</template>
