<script setup lang="ts">
import { useThrottleFn } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { loadFiles } from '../actions/loadUserFiles';
import useLoadDataStore from '../store/load-data';

const { isLoading } = storeToRefs(useLoadDataStore());

const loadData = useThrottleFn(async () => {
  const file = await fetch('/sample.zip');
  const blob = await file.blob();
  const sampleFile = new File([blob], 'sample.zip');
  loadFiles([sampleFile]);
}, 1000);
</script>

<template>
  <div class="bg-slate-600 w-full h-12">
    <div class="flex items-center justify-between h-full px-4">
      <div class="flex items-center space-x-4">
        <button class="bg-blue-300 rounded px-2" @click="loadData">
          <i v-if="isLoading" class="pi pi-spin pi-spinner"></i>
          Load sample data
        </button>
      </div>
    </div>
  </div>
</template>
