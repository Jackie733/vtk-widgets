<script setup lang="ts">
import { useAutoFitState } from "@/src/composables/useAutoFitState";
import { useVtkInteractorStyle } from "@/src/core/vtk/useVtkInteractorStyle";
import { useVtkView } from "@/src/core/vtk/useVtkView";
import { LPSAxisDir } from "@/src/types/lps";
import { VtkViewApi } from "@/src/types/vtk-types";
import { resetCameraToImage, resizeToFitImage } from "@/src/utils/camera";
import vtkInteractorStyleManipulator from "@kitware/vtk.js/Interaction/Style/InteractorStyleManipulator";
import { useResizeObserver, watchImmediate } from "@vueuse/core";
import { effectScope, markRaw, onUnmounted, provide, ref, toRefs } from "vue";
import { VtkViewContext } from "./context";
import { useImageStore } from "@/src/store/images";
import { storeToRefs } from "pinia";

interface Props {
  viewId: string;
  viewDirection: LPSAxisDir;
  viewUp: LPSAxisDir;
  disableAutoResetCamera?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disableAutoResetCamera: false,
});
const {
  viewId: viewID,
  viewDirection,
  viewUp,
  disableAutoResetCamera,
} = toRefs(props);

const { metadata: imageMetadata } = storeToRefs(useImageStore());

const vtkContainerRef = ref<HTMLElement>();
//
// use a detached scope so that actors can be removed from
// the renderer before the renderer is deleted.
const scope = effectScope(true);
const view = scope.run(() => useVtkView(vtkContainerRef))!;
onUnmounted(() => {
  scope.stop();
});

view.renderer.setBackground(0, 0, 0);
view.renderer.getActiveCamera().setParallelProjection(true);

const { interactorStyle } = useVtkInteractorStyle(
  vtkInteractorStyleManipulator,
  view,
);

const { autoFit, withoutAutoFitEffect } = useAutoFitState(
  view.renderer.getActiveCamera(),
);

function autoFitImage() {
  if (!autoFit.value) return;
  withoutAutoFitEffect(() => {
    resizeToFitImage(
      view,
      imageMetadata.value,
      viewDirection.value,
      viewUp.value,
    );
  });
}

useResizeObserver(vtkContainerRef, () => {
  if (disableAutoResetCamera.value) return;
  autoFitImage();
});

function resetCamera() {
  autoFit.value = true;
  withoutAutoFitEffect(() => {
    resetCameraToImage(
      view,
      imageMetadata.value,
      viewDirection.value,
      viewUp.value,
    );
  });
  autoFitImage();
}

watchImmediate([disableAutoResetCamera, viewID], ([noAutoReset]) => {
  if (noAutoReset) return;
  resetCamera();
});

const api: VtkViewApi = markRaw({
  ...view,
  interactorStyle,
  resetCamera,
});

defineExpose(api);
provide(VtkViewContext, api);
</script>

<template>
  <div ref="vtkContainerRef"><slot></slot></div>
</template>
