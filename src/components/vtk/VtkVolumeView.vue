<script setup lang="ts">
import { useImage } from '@/src/composables/useCurrentImage';
import { usePersistCameraConfig } from '@/src/composables/usePersistCameraConfig';
import { useVtkInteractionManipulator } from '@/src/core/vtk/useVtkInteractionManipulator';
import { useVtkInteractorStyle } from '@/src/core/vtk/useVtkInteractorStyle';
import { useVtkView } from '@/src/core/vtk/useVtkView';
import useViewCameraStore from '@/src/store/view-configs/camera';
import { Maybe } from '@/src/types';
import { LPSAxisDir } from '@/src/types/lps';
import { VtkViewApi } from '@/src/types/vtk-types';
import { resetCameraToImage } from '@/src/utils/camera';
import vtkBoundingBox from '@kitware/vtk.js/Common/DataModel/BoundingBox';
import vtkMouseCameraTrackballPanManipulator from '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballPanManipulator';
import vtkMouseCameraTrackballRotateManipulator from '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballRotateManipulator';
import vtkMouseCameraTrackballZoomManipulator from '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballZoomManipulator';
import vtkInteractorStyleManipulator from '@kitware/vtk.js/Interaction/Style/InteractorStyleManipulator';
import { watchImmediate } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import {
  effectScope,
  markRaw,
  onUnmounted,
  provide,
  ref,
  toRefs,
  watchEffect,
} from 'vue';
import { VtkViewContext } from './context';

interface Props {
  viewId: string;
  imageId: Maybe<string>;
  viewDirection: LPSAxisDir;
  viewUp: LPSAxisDir;
}

const props = defineProps<Props>();
const {
  viewId: viewID,
  imageId: imageID,
  viewDirection,
  viewUp,
} = toRefs(props);

const vtkContainerRef = ref<HTMLElement>();

const { disableCameraAutoReset } = storeToRefs(useViewCameraStore());

const { metadata: imageMetadata } = useImage(imageID);

const scope = effectScope(true);
const view = scope.run(() => useVtkView(vtkContainerRef))!;
onUnmounted(() => {
  scope.stop();
});

view.renderer.setBackground(0, 0, 0);

// setup interactor style
const { interactorStyle } = useVtkInteractorStyle(
  vtkInteractorStyleManipulator,
  view
);

useVtkInteractionManipulator(
  interactorStyle,
  vtkMouseCameraTrackballPanManipulator,
  { button: 1, shift: true }
);
useVtkInteractionManipulator(
  interactorStyle,
  vtkMouseCameraTrackballZoomManipulator,
  { button: 3, scrollEnabled: true }
);
useVtkInteractionManipulator(
  interactorStyle,
  vtkMouseCameraTrackballRotateManipulator,
  { button: 1 }
);

// set center of rotation
watchEffect(() => {
  const center = vtkBoundingBox.getCenter(imageMetadata.value.worldBounds);
  interactorStyle.setCenterOfRotation(...center);
});

function resetCamera() {
  resetCameraToImage(
    view,
    imageMetadata.value,
    viewDirection.value,
    viewUp.value
  );
}

watchImmediate([disableCameraAutoReset, viewID, imageID], ([noAutoReset]) => {
  if (noAutoReset) return;
  resetCamera();
});

// persistent camera config
usePersistCameraConfig(viewID, imageID, view.renderer.getActiveCamera());

// exposed API
const api: VtkViewApi = markRaw({
  ...view,
  interactorStyle,
  resetCamera,
});

defineExpose(api);
provide(VtkViewContext, api);
</script>

<template>
  <div ref="vtkContainerRef">
    <slot></slot>
  </div>
</template>
