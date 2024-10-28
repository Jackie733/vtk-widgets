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
          :icon="Tools.WindowLevel"
          name="Window & Level"
          :active="active"
          :disabled="noCurrentImage"
          @click="toggle"
        />
      </groupable-item>
      <groupable-item v-slot:default="{ active, toggle }" :value="Tools.Pan">
        <control-button
          :icon="Tools.Pan"
          name="Pan"
          :active="active"
          :disabled="noCurrentImage"
          @click="toggle"
        />
      </groupable-item>
      <groupable-item
        v-slot:default="{ active, toggle }"
        :value="Tools.Crosshairs"
      >
        <control-button
          :icon="Tools.Crosshairs"
          name="Crosshairs"
          :active="active"
          :disabled="noCurrentImage"
          @click="toggle"
        />
      </groupable-item>
    </item-group>
  </div>
</template>
