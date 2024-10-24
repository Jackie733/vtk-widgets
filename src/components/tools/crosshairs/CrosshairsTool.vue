<template>
  <div v-if="active" class="overlay-no-events">
    <svg class="overlay-no-events">
      <CrosshairSVG2D v-show="isVisible" :position="position" />
    </svg>
    <CrosshairsWidget2D
      :image-id="imageId"
      :view-id="viewId"
      :view-direction="viewDirection"
    />
  </div>
</template>

<script lang="ts">
import { useCurrentImage } from '@/src/composables/useCurrentImage';
import { useSliceInfo } from '@/src/composables/useSliceInfo';
import { useToolStore } from '@/src/store/tools';
import { useCrosshairsToolStore } from '@/src/store/tools/crosshairs';
import { Tools } from '@/src/store/tools/types';
import { Maybe } from '@/src/types';
import { LPSAxisDir } from '@/src/types/lps';
import { getLPSAxisFromDir } from '@/src/utils/lps';
import { clampValue } from '@/src/utils';
import { storeToRefs } from 'pinia';
import { computed, defineComponent, PropType, toRefs } from 'vue';
import CrosshairsWidget2D from './CrosshairsWidget2D.vue';
import CrosshairSVG2D from './CrosshairSVG2D.vue';

export default defineComponent({
  name: 'CrosshairsTool',
  props: {
    viewId: {
      type: String,
      required: true,
    },
    viewDirection: {
      type: String as PropType<LPSAxisDir>,
      required: true,
    },
    imageId: String as PropType<Maybe<string>>,
  },
  components: {
    CrosshairsWidget2D,
    CrosshairSVG2D,
  },
  setup(props) {
    const { viewId, imageId, viewDirection } = toRefs(props);

    const toolStore = useToolStore();
    const { position, imagePosition } = storeToRefs(useCrosshairsToolStore());

    const sliceInfo = useSliceInfo(viewId, imageId);

    const { currentImageMetadata } = useCurrentImage();
    const active = computed(() => toolStore.currentTool === Tools.Crosshairs);
    const isVisible = computed(() => {
      if (!sliceInfo.value) return false;

      const { lpsOrientation, dimensions } = currentImageMetadata.value;
      const axis = getLPSAxisFromDir(viewDirection.value);
      const index = lpsOrientation[axis];
      const crosshairsSlice = clampValue(
        imagePosition.value[index],
        0,
        dimensions[index] - 1
      );
      return Math.round(crosshairsSlice) === sliceInfo.value.slice;
    });

    return {
      active,
      position,
      isVisible,
    };
  },
});
</script>

<style scoped src="@/src/components/styles/vtk-view.css"></style>
