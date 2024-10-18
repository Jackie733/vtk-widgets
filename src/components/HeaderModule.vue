<script setup lang="ts">
import { useThrottleFn } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import SplitButton from 'primevue/splitbutton';
import { loadFiles, loadUserPromptedFiles } from '../actions/loadUserFiles';
import useLoadDataStore from '../store/load-data';

const { isLoading } = storeToRefs(useLoadDataStore());

const loadData = useThrottleFn(async () => {
  const file = await fetch('/sample.zip');
  const blob = await file.blob();
  const sampleFile = new File([blob], 'sample.zip');
  loadFiles([sampleFile]);
}, 1000);

const items = [
  {
    label: 'Load Sample',
    command: loadData,
  },
];
</script>

<template>
  <div class="bg-zinc-600 w-full h-12">
    <div class="flex items-center justify-between h-full px-4">
      <div class="flex items-center space-x-2">
        <SplitButton
          size="small"
          label="Upload"
          :model="items"
          :disabled="isLoading"
          :icon="isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-upload'"
          @click="loadUserPromptedFiles"
        >
        </SplitButton>
      </div>
    </div>
  </div>
</template>
