<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import ToolControls from './ToolControls.vue';
import { AnnotationToolType, Tools } from '../store/tools/types';
import { useToolStore } from '../store/tools';

const Tabs = {
  Measurements: 'measurements',
  SegmentGroups: 'segmentGroups',
};

const MeasurementTools = [
  {
    type: AnnotationToolType.Ruler,
    icon: 'mdi-ruler',
  },
  {
    type: AnnotationToolType.Rectangle,
    icon: 'mdi-vector-square',
  },
  {
    type: AnnotationToolType.Polygon,
    icon: 'mdi-pentagon-outline',
  },
];

const MeasurementToolTypes = new Set<string>(
  MeasurementTools.map(({ type }) => type)
);

const tab = ref(Tabs.Measurements);
const { currentTool } = storeToRefs(useToolStore());

function autoFocusTab() {
  if (currentTool.value === Tools.Paint) {
    tab.value = Tabs.SegmentGroups;
  } else if (MeasurementToolTypes.has(currentTool.value)) {
    tab.value = Tabs.Measurements;
  }
}

watch(
  currentTool,
  () => {
    autoFocusTab();
  },
  { immediate: true }
);
</script>

<template>
  <div class="overflow-y-auto mx-2 fill-height">
    <tool-controls />
  </div>
</template>

<style scoped></style>
