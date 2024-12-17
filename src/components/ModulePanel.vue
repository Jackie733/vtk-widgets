<template>
  <div class="h-full w-full flex flex-col">
    <div id="module-switcher">
      <v-tabs
        id="module-switcher-tabs"
        v-model="activeTab"
        icons-and-text
        show-arrows
      >
        <v-tab
          v-for="item in modules"
          :key="item.name"
          :data-testid="`module-tab-${item.name}`"
        >
          <div class="tab-content">
            <span class="mb-0 mt-1 module-text">{{ item.name }}</span>
            <v-icon>mdi-{{ item.icon }}</v-icon>
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
import { ref, watch } from 'vue';
import type { Component } from 'vue';
import AnnotationsModule from './AnnotationsModule.vue';
import SegmentsModule from './SegmentsModule.vue';
import DemosModule from './DemosModule.vue';
import { Tools } from '../store/tools/types';
import { useToolStore } from '../store/tools';

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
    name: 'Annotations',
    icon: 'pencil',
    component: AnnotationsModule,
  },
  {
    name: 'Segments',
    icon: 'cube',
    component: SegmentsModule,
  },
];

const autoSwitchToAnnotationsTools = [
  Tools.Rectangle,
  Tools.Ruler,
  Tools.Polygon,
  Tools.Paint,
];

const activeTab = ref(0);

const toolStore = useToolStore();
watch(
  () => toolStore.currentTool,
  (newTool) => {
    if (autoSwitchToAnnotationsTools.includes(newTool)) {
      activeTab.value = 1;
    }
  }
);
</script>

<style scoped>
#module-switcher {
  display: relative;
  flex: 0 2;
  /* roughly match vuetify's dark/light transition */
  transition: border-bottom 0.3s;
  border-bottom: 2px solid rgb(var(--v-theme-on-surface-variant));
}

#close-btn {
  position: absolute;
  top: 1.5em;
  left: 0.5em;
  z-index: 10;
}

#module-container {
  position: relative;
  flex: 2;
  overflow: auto;
}

.module-text {
  font-size: 0.6rem;
  white-space: pre;
}

.tab-content {
  display: flex;
  justify-content: flex-end;
  flex-direction: column-reverse;
  height: 100%;
  align-items: center;
}

#module-switcher-tabs :deep(.v-slide-group__content) {
  justify-content: center;
}

#module-switcher-tabs
  :deep(.v-slide-group__prev.v-slide-group__prev--disabled) {
  visibility: hidden;
}

#module-switcher-tabs
  :deep(.v-slide-group__next.v-slide-group__next--disabled) {
  visibility: hidden;
}
</style>
