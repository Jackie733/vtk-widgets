<script setup lang="ts">
import { computed } from 'vue';
import ItemGroup from './ItemGroup.vue';
import GroupableItem from './GroupableItem.vue';
import ControlButton from './ControlButton.vue';
import { Tools } from '../store/tools/types';
import { useToolStore } from '../store/tools';
import { useDatasetStore } from '../store/datasets';

const dataStore = useDatasetStore();
const toolStore = useToolStore();

const noCurrentImage = computed(() => !dataStore.primaryDataset);
const currentTool = computed(() => toolStore.currentTool);
</script>

<template>
  <div class="flex gap-1">
    <item-group
      mandatory
      :model-value="currentTool"
      @update:model-value="toolStore.setCurrentTool($event)"
    >
      <groupable-item
        v-slot:default="{ active, toggle }"
        :value="Tools.WindowLevel"
      >
        <control-button
          icon="mdi-circle-half-full"
          name="Window & Level"
          :buttonClass="['tool-btn', active ? 'tool-btn-selected' : '']"
          :disabled="noCurrentImage"
          @click="toggle"
        />
      </groupable-item>
      <groupable-item v-slot:default="{ active, toggle }" :value="Tools.Pan">
        <control-button
          icon="mdi-cursor-move"
          name="Pan"
          :buttonClass="['tool-btn', active ? 'tool-btn-selected' : '']"
          :disabled="noCurrentImage"
          @click="toggle"
        />
      </groupable-item>
      <groupable-item
        v-slot:default="{ active, toggle }"
        :value="Tools.Crosshairs"
      >
        <control-button
          icon="mdi-crosshairs"
          name="Crosshairs"
          :buttonClass="['tool-btn', active ? 'tool-btn-selected' : '']"
          :disabled="noCurrentImage"
          @click="toggle"
        />
      </groupable-item>
      <groupable-item v-slot:default="{ active, toggle }" :value="Tools.Ruler">
        <control-button
          icon="mdi-ruler"
          name="Ruler"
          :buttonClass="['tool-btn', active ? 'tool-btn-selected' : '']"
          :disabled="noCurrentImage"
          @click="toggle"
        />
      </groupable-item>
      <groupable-item
        v-slot:default="{ active, toggle }"
        :value="Tools.Rectangle"
      >
        <control-button
          icon="mdi-rectangle"
          name="Rectangle"
          :buttonClass="['tool-btn', active ? 'tool-btn-selected' : '']"
          :disabled="noCurrentImage"
          @click="toggle"
        />
      </groupable-item>
      <groupable-item v-slot:default="{ active, toggle }" :value="Tools.Paint">
        <control-button
          icon="mdi-brush"
          name="Paint"
          :buttonClass="['tool-btn', active ? 'tool-btn-selected' : '']"
          :disabled="noCurrentImage"
          @click="toggle"
        />
      </groupable-item>
      <groupable-item
        v-slot:default="{ active, toggle }"
        :value="Tools.Polygon"
      >
        <control-button
          icon="mdi-pentagon-outline"
          name="Polygon"
          :buttonClass="['tool-btn', active ? 'tool-btn-selected' : '']"
          :disabled="noCurrentImage"
          @click="toggle"
        />
      </groupable-item>
    </item-group>
  </div>
</template>

<style>
.tool-btn-selected {
  background-color: rgb(var(--v-theme-selection-bg-color));
}
</style>
