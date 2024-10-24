import vtkInteractorStyleManipulator from '@kitware/vtk.js/Interaction/Style/InteractorStyleManipulator';
import { watch, MaybeRef, computed, ref, toRef, unref, watchEffect } from 'vue';
import { FirstParam } from '@/src/types';
import { stableDeepRef } from '@/src/composables/stableDeepRef';
import { VtkObjectConstructor } from './types';

function addManipulator(style: vtkInteractorStyleManipulator, manip: any) {
  if (manip.isA('vtkCompositeMouseManipulator')) {
    style.addMouseManipulator(manip);
  } else if (manip.isA('vtkCompositeGestureManipulator')) {
    style.addGestureManipulator(manip);
  } else if (manip.isA('vtkCompositeKeyboardManipulator')) {
    style.addKeyboardManipulator(manip);
  }
}

function removeManipulator(style: vtkInteractorStyleManipulator, manip: any) {
  console.log(
    'removeManipulator',
    manip,
    manip.isA('vtkCompositeMouseManipulator')
  );

  if (manip.isA('vtkCompositeMouseManipulator')) {
    style.removeMouseManipulator(manip);
  } else if (manip.isA('vtkCompositeGestureManipulator')) {
    style.removeGestureManipulator(manip);
  } else if (manip.isA('vtkCompositeKeyboardManipulator')) {
    style.removeKeyboardManipulator(manip);
  }
}

export function useVtkInteractionManipulator<
  T extends VtkObjectConstructor<any>
>(
  style: vtkInteractorStyleManipulator,
  vtkCtor: MaybeRef<T>,
  props: MaybeRef<FirstParam<T['newInstance']>>
) {
  const stableProps = stableDeepRef(toRef(props));
  const manipulator = computed(() => {
    return unref(vtkCtor).newInstance(stableProps.value);
  });

  const enabled = ref(true);

  watch(manipulator, (_, oldManipulator) => {
    oldManipulator?.delete();
  });

  watchEffect((onCleanup) => {
    if (!enabled.value) return;

    const manip = manipulator.value;
    addManipulator(style, manip);
    onCleanup(() => {
      if (!style.isDeleted()) removeManipulator(style, manip);
    });
  });

  return {
    instance: manipulator,
    enabled,
  };
}
