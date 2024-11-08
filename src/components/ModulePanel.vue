<template>
  <div class="h-full w-full flex flex-col">
    <div id="module-switcher">
      <v-tabs v-model="activeTab" color="primary">
        <v-tab v-for="item in modules" :key="item.name">
          <div class="tab-content">
            <v-icon :icon="`mdi-${item.icon}`"></v-icon>
            <v-tooltip location="bottom" activator="parent">{{
              item.name
            }}</v-tooltip>
          </div>
        </v-tab>
      </v-tabs>
    </div>
    <div id="module-container">
      <v-window v-model="activeTab" touchless class="h-full">
        <v-window-item v-for="mod in modules" :key="mod.name" class="h-full">
          <component
            :key="mod.name"
            v-show="modules[activeTab] === mod"
            :is="mod.component"
          />
        </v-window-item>
      </v-window>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Component } from 'vue';
import MeasurementsModule from './MeasurementsModule.vue';
import SegmentsModule from './SegmentsModule.vue';
import DemosModule from './DemosModule.vue';

interface Module {
  name: string;
  icon: string;
  component: Component;
}

const modules: Module[] = [
  {
    name: 'Demos',
    icon: 'database',
    component: DemosModule,
  },
  {
    name: 'Measurements',
    icon: 'pencil',
    component: MeasurementsModule,
  },
  {
    name: 'Segments',
    icon: 'cube',
    component: SegmentsModule,
  },
];

const activeTab = ref(0);
</script>

<style scoped>
#module-switcher {
  display: relative;
  flex: 0 2;
  transition: border-bottom 0.3s;
  border-bottom: 1px solid rgb(var(--v-theme-on-surface-variant));
}

#module-container {
  position: relative;
  flex: 2;
  overflow: auto;
}
</style>
