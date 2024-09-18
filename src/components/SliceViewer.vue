<script setup lang="ts">
import { computed, ref, toRefs } from "vue";
import { LPSAxisDir } from "../types/lps";
import VtkSliceView from "./vtk/VtkSliceView.vue";
import { VtkViewApi } from "../types/vtk-types";
import { getLPSAxisFromDir } from "../utils/lps";

interface Props {
  id: string;
  type: string;
  viewDirection: LPSAxisDir;
  viewUp: LPSAxisDir;
}

const vtkView = ref<VtkViewApi>();

const props = defineProps<Props>();

const { id: viewId, type: viewType, viewDirection, viewUp } = toRefs(props);
const viewAxis = computed(() => getLPSAxisFromDir(viewDirection.value));
</script>

<template>
  <div class="vtk-container-wrapper">
    <div class="vtk-container">
      <div class="vtk-sub-container">
        <vtk-slice-view
          class="vtk-view"
          ref="vtkView"
          :view-id="id"
          :view-direction="viewDirection"
          :view-up="viewUp"
        ></vtk-slice-view>
      </div>
    </div>
    <div class="vtk-gutter"></div>
  </div>
</template>

<style scoped src="@/src/components/styles/vtk-view.css"></style>
<style scoped src="@/src/components/styles/utils.css"></style>
