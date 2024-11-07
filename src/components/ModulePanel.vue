<template>
  <div class="h-full w-full flex flex-col border-r-2 border-zinc-700">
    <div id="module-switcher">
      <el-tabs v-model="activeTab">
        <el-tab-pane
          v-for="(item, index) in modules"
          :key="index"
          :label="item.name"
          :name="index"
        />
      </el-tabs>
    </div>
    <div id="module-container">
      <template v-for="mod in modules" :key="mod.name">
        <component v-show="modules[activeTab] === mod" :is="mod.component" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Component } from 'vue';
import MeasurementsModule from './MeasurementsModule.vue';
import SegmentsModule from './SegmentsModule.vue';

interface Module {
  name: string;
  component: Component;
}

const modules: Module[] = [
  {
    name: 'Measurements',
    component: MeasurementsModule,
  },
  {
    name: 'Segments',
    component: SegmentsModule,
  },
];

const activeTab = ref(0);
</script>
