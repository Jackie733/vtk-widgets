<script setup lang="ts">
import { computed, ref, toRefs } from 'vue';
import { storeToRefs } from 'pinia';
import { whenever } from '@vueuse/core';
import vtkMouseCameraTrackballPanManipulator from '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballPanManipulator';
import vtkMouseCameraTrackballZoomToMouseManipulator from '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballZoomToMouseManipulator';
import { LPSAxisDir } from '../types/lps';
import VtkSliceView from './vtk/VtkSliceView.vue';
import VtkBaseSliceRepresentation from './vtk/VtkBaseSliceRepresentation.vue';
import VtkSegmentationSliceRepresentation from './vtk/VtkSegmentationSliceRepresentation.vue';
import VtkSliceViewWindowManipulator from './vtk/VtkSliceViewWindowManipulator.vue';
import VtkSliceViewSlicingManipulator from './vtk/VtkSliceViewSlicingManipulator.vue';
import VtkMouseInteractionManipulator from './vtk/VtkMouseInteractionManipulator.vue';
import SliceViewerOverlay from './SliceViewerOverlay.vue';
import CrosshairsTool from './tools/crosshairs/CrosshairsTool.vue';
import SliceSlider from './SliceSlider.vue';
import RulerTool from './tools/ruler/RulerTool.vue';
import PaintTool from './tools/paint/PaintTool.vue';
import PolygonTool from './tools/polygon/PolygonTool.vue';
import SelectTool from './tools/SelectTool.vue';
import BoundingRectangle from './tools/BoundingRectangle.vue';
import { VtkViewApi } from '../types/vtk-types';
import { getLPSAxisFromDir } from '../utils/lps';
import { useCurrentImage } from '../composables/useCurrentImage';
import { useAnnotationToolStore, useToolStore } from '../store/tools';
import { Tools } from '../store/tools/types';
import { useSliceConfig } from '../composables/useSliceConfig';
import { LayoutViewProps } from '../types';
import { useResetViewsEvents } from './tools/ResetViews.vue';
import { useViewAnimationListener } from '../composables/useViewAnimationListener';
import { useToolSelectionStore } from '../store/tools/toolSelection';
import { doesToolFrameMatchViewAxis } from '../composables/annotationTool';
import { useSegmentGroupStore } from '../store/segmentGroups';

interface Props extends LayoutViewProps {
  viewDirection: LPSAxisDir;
  viewUp: LPSAxisDir;
}

const vtkView = ref<VtkViewApi>();

const props = defineProps<Props>();

const { id: viewId, type: viewType, viewDirection, viewUp } = toRefs(props);
const viewAxis = computed(() => getLPSAxisFromDir(viewDirection.value));

const hover = ref(false);

function resetCamera() {
  if (!vtkView.value) return;
  vtkView.value.resetCamera();
}

useResetViewsEvents().onClick(resetCamera);

useViewAnimationListener(vtkView, viewId, viewType);

const { currentTool } = storeToRefs(useToolStore());
const windowingManipulatorProps = computed(() =>
  currentTool.value === Tools.WindowLevel ? { button: 1 } : { button: -1 }
);

const { currentImageID, currentImageMetadata, isImageLoading } =
  useCurrentImage();
const { slice: currentSlice, range: sliceRange } = useSliceConfig(
  viewId,
  currentImageID
);

whenever(
  computed(() => !isImageLoading.value),
  () => {
    resetCamera();
  }
);

// segmentations
const segmentations = computed(() => {
  if (!currentImageID.value) return [];
  const store = useSegmentGroupStore();
  return store.orderByParent[currentImageID.value];
});

// --- selection points --- //

const selectionStore = useToolSelectionStore();
const selectionPoints = computed(() => {
  return selectionStore.selection
    .map((sel) => {
      const store = useAnnotationToolStore(sel.type);
      return { store, tool: store.toolByID[sel.id] };
    })
    .filter(
      ({ tool }) =>
        tool.slice === currentSlice.value &&
        doesToolFrameMatchViewAxis(viewAxis, tool, currentImageMetadata.value)
    )
    .flatMap(({ store, tool }) => store.getPoints(tool.id));
});
</script>

<template>
  <div
    class="vtk-container-wrapper"
    @pointerenter="hover = true"
    @pointerleave="hover = true"
    @focusin="hover = true"
    @focusout="hover = false"
  >
    <div class="vtk-gutter">
      <v-btn dark icon size="medium" variant="text" @click="resetCamera">
        <v-icon size="medium" class="py-1"> mdi-camera-flip-outline </v-icon>
        <v-tooltip
          location="right"
          activator="parent"
          transition="slide-x-transition"
          >Reset Camera</v-tooltip
        >
      </v-btn>
      <SliceSlider
        v-model="currentSlice"
        class="slice-slider"
        :min="sliceRange[0]"
        :max="sliceRange[1]"
        :step="1"
        :handle-height="20"
      />
    </div>
    <div class="vtk-container">
      <div class="vtk-sub-container">
        <vtk-slice-view
          class="vtk-view"
          ref="vtkView"
          :view-id="id"
          :image-id="currentImageID"
          :view-direction="viewDirection"
          :view-up="viewUp"
        >
          <vtk-mouse-interaction-manipulator
            v-if="currentTool === Tools.Pan"
            :manipulator-constructor="vtkMouseCameraTrackballPanManipulator"
            :manipulator-props="{ button: 1 }"
          ></vtk-mouse-interaction-manipulator>
          <vtk-mouse-interaction-manipulator
            :manipulator-constructor="vtkMouseCameraTrackballPanManipulator"
            :manipulator-props="{ button: 1, shift: true }"
          ></vtk-mouse-interaction-manipulator>
          <vtk-mouse-interaction-manipulator
            :manipulator-constructor="vtkMouseCameraTrackballPanManipulator"
            :manipulator-props="{ button: 2 }"
          ></vtk-mouse-interaction-manipulator>
          <!-- <vtk-mouse-interaction-manipulator
            v-if="currentTool === Tools.Zoom"
            :manipulator-constructor="
              vtkMouseCameraTrackballZoomToMouseManipulator
            "
            :manipulator-props="{ button: 1 }"
          ></vtk-mouse-interaction-manipulator> -->
          <vtk-mouse-interaction-manipulator
            :manipulator-constructor="
              vtkMouseCameraTrackballZoomToMouseManipulator
            "
            :manipulator-props="{ button: 3 }"
          ></vtk-mouse-interaction-manipulator>
          <vtk-slice-view-slicing-manipulator
            :view-id="id"
            :image-id="currentImageID"
            :view-direction="viewDirection"
          ></vtk-slice-view-slicing-manipulator>
          <vtk-slice-view-window-manipulator
            :view-id="id"
            :image-id="currentImageID"
            :manipulator-config="windowingManipulatorProps"
          ></vtk-slice-view-window-manipulator>
          <slice-viewer-overlay
            :view-id="id"
            :image-id="currentImageID"
          ></slice-viewer-overlay>
          <vtk-base-slice-representation
            :view-id="id"
            :image-id="currentImageID"
            :axis="viewAxis"
          >
          </vtk-base-slice-representation>
          <vtk-segmentation-slice-representation
            v-for="segId in segmentations"
            :key="`seg-${segId}`"
            :view-id="id"
            :segmentation-id="segId"
            :axis="viewAxis"
          ></vtk-segmentation-slice-representation>
          <crosshairs-tool
            :view-id="viewId"
            :image-id="currentImageID"
            :view-direction="viewDirection"
          />
          <paint-tool
            :view-id="viewId"
            :image-id="currentImageID"
            :view-direction="viewDirection"
          />
          <polygon-tool
            :view-id="viewId"
            :image-id="currentImageID"
            :view-direction="viewDirection"
          />
          <ruler-tool
            :view-id="viewId"
            :image-id="currentImageID"
            :view-direction="viewDirection"
          />
          <select-tool />
          <svg class="overlay-no-events">
            <bounding-rectangle :points="selectionPoints" />
          </svg>
          <slot></slot>
        </vtk-slice-view>
      </div>
      <transition name="loading">
        <div v-if="isImageLoading" class="overlay-no-events loading">
          <div>Loading the image</div>
          <div>
            <v-progress-circular indeterminate color="blue" />
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped src="@/src/components/styles/vtk-view.css"></style>
<style scoped src="@/src/components/styles/utils.css"></style>
