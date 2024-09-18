<script setup lang="ts">
import { useThrottleFn } from '@vueuse/core';
import { extractFilesFromZip } from '../io/zip';
import { itkReader } from '../io/readers';

const loadData = useThrottleFn(async () => {
  const file = await fetch('/sample.zip');
  const blob = await file.blob();
  const sampleFile = new File([blob], 'sample.zip');
  const files = await extractFilesFromZip(sampleFile);
  console.log(files);
  const itkImage = await itkReader(files[0].file);
  console.log(itkImage);
}, 1000);
</script>

<template>
  <div class="bg-slate-600 w-full h-12">
    <div class="flex items-center justify-between h-full px-4">
      <div class="flex items-center space-x-4">
        <button class="bg-blue-300 rounded px-2" @click="loadData">Load</button>
      </div>
    </div>
  </div>
</template>
