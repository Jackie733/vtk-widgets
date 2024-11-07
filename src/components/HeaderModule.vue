<script setup lang="ts">
import { useThrottleFn } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import ToolModule from './ToolModule.vue';
// import QuickInfo from './QuickInfo.vue';
import { loadFiles, loadUserPromptedFiles } from '../actions/loadUserFiles';
import useLoadDataStore from '../store/load-data';
import ControlButton from './ControlButton.vue';
import { DefaultLayoutName, Layouts } from '../config';
import { useViewStore } from '../store/views';
import { Layout } from '../types/layout';

defineProps<{
  hasData: boolean;
}>();

function useViewLayout() {
  const viewStore = useViewStore();
  const layoutName = ref(DefaultLayoutName);
  const { layout: currentLayout } = storeToRefs(viewStore);

  watch(
    layoutName,
    () => {
      const layout = Layouts[layoutName.value] || [];
      viewStore.setLayout(layout);
    },
    { immediate: true }
  );

  watch(currentLayout, () => {
    if (
      currentLayout.value?.name &&
      currentLayout.value.name !== layoutName.value
    ) {
      layoutName.value = currentLayout.value.name;
    }
  });

  return layoutName;
}

const { isLoading } = storeToRefs(useLoadDataStore());
const layoutName = useViewLayout();

const loadData = useThrottleFn(async () => {
  const file = await fetch('/sample.zip');
  const blob = await file.blob();
  const sampleFile = new File([blob], 'sample.zip');
  loadFiles([sampleFile]);
}, 1000);

const handleCommand = (command: Layout) => {
  useViewStore().setLayout(command);
};

const toggleSide = () => {
  useViewStore().toggleSideVisible();
};
</script>

<template>
  <v-app-bar app clipped-left :height="48">
    <div class="w-full flex items-center justify-between h-full px-4">
      <div class="flex items-center gap-1">
        <v-btn size="small" icon="mdi-menu" @click="toggleSide" />
        <v-btn
          v-if="!hasData"
          :loading="isLoading"
          variant="outlined"
          size="small"
          prepend-icon="mdi-upload"
          @click="loadData"
        >
          Sample
        </v-btn>
        <el-dropdown placement="bottom" @command="handleCommand">
          <ControlButton name="Layouts" icon="Layouts" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="(value, key) in Layouts"
                :class="{ 'bg-slate-600': layoutName === value.name }"
                :key="key"
                :command="value"
                >{{ value.name }}</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <ToolModule v-if="hasData"></ToolModule>
      <div>
        <v-btn
          v-if="!hasData"
          :loading="isLoading"
          variant="outlined"
          size="small"
          @click="loadUserPromptedFiles"
          >Upload</v-btn
        >
        <!-- <QuickInfo v-else /> -->
      </div>
    </div>
  </v-app-bar>
</template>
