<script setup lang="ts">
import { OverlayInfo } from '@/src/composables/annotationTool';
import { AnnotationToolStore } from '@/src/store/tools/useAnnotationTool';
import { useElementSize } from '@vueuse/core';
import { computed, ref } from 'vue';

// These seem to work ¯\_(ツ)_/¯
const TOOLTIP_PADDING_X = 30;
const TOOLTIP_PADDING_Y = 20;

const props = defineProps<{
  info: OverlayInfo;
  toolStore: AnnotationToolStore;
}>();

const visible = computed(() => {
  return props.info.visible;
});

const label = computed(() => {
  if (!props.info.visible) return '';
  return props.toolStore.toolByID[props.info.toolID].labelName;
});

const tooltip = ref();
const content = computed(() => {
  return tooltip.value?.contentEl;
});

const { width, height } = useElementSize(content);
const offset = computed(() => {
  return {
    x: (width.value + TOOLTIP_PADDING_X) / 2,
    y: height.value + TOOLTIP_PADDING_Y,
  };
});
</script>

<template>
  <v-tooltip
    ref="tooltip"
    v-if="info.visible"
    v-model="visible"
    :style="{
      left: `${info.displayXY[0] - offset.x}px`,
      top: `${info.displayXY[1] - offset.y}px`,
      zIndex: 500,
    }"
    >{{ label }}</v-tooltip
  >
</template>

<style scoped>
.better-contrast :deep(.v-overlay__content) {
  opacity: 1 !important;
  background: rgba(255, 255, 255, 0.9) !important;
}
</style>
