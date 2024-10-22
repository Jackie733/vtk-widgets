<script setup lang="ts">
import { useThrottleFn } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import ToolModule from './ToolModule.vue';
import QuickInfo from './QuickInfo.vue';
import { loadFiles, loadUserPromptedFiles } from '../actions/loadUserFiles';
import useLoadDataStore from '../store/load-data';

defineProps<{
  hasData: boolean;
}>();

const { isLoading } = storeToRefs(useLoadDataStore());

const loadData = useThrottleFn(async () => {
  const file = await fetch('/sample.zip');
  const blob = await file.blob();
  const sampleFile = new File([blob], 'sample.zip');
  loadFiles([sampleFile]);
}, 1000);
</script>

<template>
  <div class="bg-zinc-600 w-full h-12">
    <div class="flex items-center justify-between h-full px-4">
      <Button
        label="Sample"
        severity="secondary"
        icon="pi pi-upload"
        size="small"
        :loading="isLoading"
        @click="loadData"
      />

      <ToolModule v-if="hasData"></ToolModule>
      <div>
        <Button
          v-if="!hasData"
          size="small"
          severity="secondary"
          label="Upload"
          :loading="isLoading"
          icon="pi pi-upload"
          @click="loadUserPromptedFiles"
        />
        <QuickInfo v-else />
      </div>
    </div>
  </div>
</template>
