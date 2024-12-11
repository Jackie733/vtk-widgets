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
        <v-divider class="ms-3" inset vertical></v-divider>
        <v-menu location="right" :close-on-content-click="true">
          <template v-slot:activator="{ props }">
            <ControlButton
              v-bind="props"
              name="Layouts"
              icon="mdi-view-dashboard"
            />
          </template>
          <v-card>
            <v-card-text>
              <v-radio-group v-model="layoutName" class="mt-0" hide-details>
                <v-radio
                  v-for="(value, key) in Layouts"
                  :key="key"
                  :label="value.name"
                  :value="key"
                />
              </v-radio-group>
            </v-card-text>
          </v-card>
        </v-menu>
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
