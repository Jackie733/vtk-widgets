<template>
  <div class="vtk-container-wrapper volume-viewer-container" tabindex="0">
    <div class="vtk-container">
      <div class="vtk-sub-container">
        <vtk-volume-view
          class="vtk-view"
          ref="vtkView"
          :view-id="id"
          :image-id="currentImageID"
          :view-direction="viewDirection"
          :view-up="viewUp"
        >
          <vtk-base-volume-representation
            :view-id="id"
            :image-id="currentImageID"
          ></vtk-base-volume-representation>
          <vtk-orientation-marker></vtk-orientation-marker>
          <slot></slot>
        </vtk-volume-view>
      </div>
      <view-overlay-grid class="overlay-no-events view-annotations">
        <template v-slot:top-left>
          <div class="annotation-cell">
            <v-btn
              class="pointer-events-all"
              dark
              icon
              size="medium"
              variant="text"
              @click="resetCamera"
            >
              <v-icon size="medium" class="py-1">
                mdi-camera-flip-outline
              </v-icon>
              <v-tooltip
                location="right"
                activator="parent"
                transition="slide-x-transition"
              >
                Reset Camera
              </v-tooltip>
            </v-btn>
            <span class="ml-3">{{ presetName }}</span>
          </div>
        </template>
      </view-overlay-grid>
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

<script setup lang="ts">
import { computed, ref, toRefs } from 'vue';
import { whenever } from '@vueuse/core';
import { LayoutViewProps } from '../types';
import { LPSAxisDir } from '../types/lps';
import VtkVolumeView from './vtk/VtkVolumeView.vue';
import VtkOrientationMarker from './vtk/VtkOrientationMarker.vue';
import VtkBaseVolumeRepresentation from './vtk/VtkBaseVolumeRepresentation.vue';
import ViewOverlayGrid from './ViewOverlayGrid.vue';
import { VtkViewApi } from '../types/vtk-types';
import { useResetViewsEvents } from './tools/ResetViews.vue';
import { useViewAnimationListener } from '../composables/useViewAnimationListener';
import { useCurrentImage } from '../composables/useCurrentImage';
import { useVolumeColoringStore } from '../store/view-configs/volume-coloring';

interface Props extends LayoutViewProps {
  viewDirection: LPSAxisDir;
  viewUp: LPSAxisDir;
}

const vtkView = ref<VtkViewApi>();

const props = defineProps<Props>();

const { id: viewId, type: viewType, viewDirection, viewUp } = toRefs(props);

function resetCamera() {
  if (!vtkView.value) return;
  vtkView.value.resetCamera();
  vtkView.value.renderer.updateLightsGeometryToFollowCamera();
}

useResetViewsEvents().onClick(resetCamera);

useViewAnimationListener(vtkView, viewId, viewType);

// base image
const { currentImageID, isImageLoading } = useCurrentImage();

whenever(
  computed(() => !isImageLoading.value),
  () => {
    resetCamera();
  }
);

const coloringStore = useVolumeColoringStore();
const coloringConfig = computed(() =>
  coloringStore.getConfig(viewId.value, currentImageID.value)
);
const presetName = computed(
  () => coloringConfig.value?.transferFunction.preset.replace(/-/g, ' ') ?? ''
);
</script>

<style scoped src="@/src/components/styles/vtk-view.css"></style>
<style scoped src="@/src/components/styles/utils.css"></style>

<style scoped>
.volume-viewer-container {
  background-color: black;
  grid-template-columns: auto;
}
</style>
