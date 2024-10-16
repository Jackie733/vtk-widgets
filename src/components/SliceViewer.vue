<script setup lang="ts">
import { computed, ref, toRefs } from 'vue';
import { storeToRefs } from 'pinia';
import { whenever } from '@vueuse/core';
import { LPSAxisDir } from '../types/lps';
import VtkSliceView from './vtk/VtkSliceView.vue';
import VtkBaseSliceRepresentation from './vtk/VtkBaseSliceRepresentation.vue';
import VtkSliceViewWindowManipulator from './vtk/VtkSliceViewWindowManipulator.vue';
import VtkSliceViewSlicingManipulator from './vtk/VtkSliceViewSlicingManipulator.vue';
import { VtkViewApi } from '../types/vtk-types';
import { getLPSAxisFromDir } from '../utils/lps';
import { useCurrentImage } from '../composables/useCurrentImage';
import { useToolStore } from '../store/tools';
import { Tools } from '../store/tools/types';
import { useSliceConfig } from '../composables/useSliceConfig';
import { LayoutViewProps } from '../types';

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

const { currentTool } = storeToRefs(useToolStore());
const windowingManipulatorProps = computed(() =>
  currentTool.value === Tools.WindowLevel ? { button: 1 } : { button: -1 }
);

const { currentImageID, isImageLoading } = useCurrentImage();
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
</script>

<template>
  <div class="vtk-container-wrapper">
    <div class="vtk-container">
      <div class="vtk-sub-container">
        <VtkSliceView
          class="vtk-view"
          ref="vtkView"
          :view-id="viewId"
          :image-id="currentImageID"
          :view-direction="viewDirection"
          :view-up="viewUp"
        >
          <VtkBaseSliceRepresentation
            :view-id="viewId"
            :image-id="currentImageID"
            :axis="viewAxis"
          >
          </VtkBaseSliceRepresentation>
          <VtkSliceViewSlicingManipulator
            :view-id="viewId"
            :image-id="currentImageID"
            :view-direction="viewDirection"
          ></VtkSliceViewSlicingManipulator>
          <VtkSliceViewWindowManipulator
            :view-id="viewId"
            :image-id="currentImageID"
          ></VtkSliceViewWindowManipulator>
        </VtkSliceView>
      </div>
    </div>
    <div class="vtk-gutter"></div>
  </div>
</template>

<style scoped src="@/src/components/styles/vtk-view.css"></style>
<style scoped src="@/src/components/styles/utils.css"></style>
