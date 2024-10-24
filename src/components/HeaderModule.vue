<script setup lang="ts">
import { useThrottleFn } from '@vueuse/core';
import { Upload } from '@element-plus/icons-vue';
import { storeToRefs } from 'pinia';
import ToolModule from './ToolModule.vue';
// import QuickInfo from './QuickInfo.vue';
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
      <el-button
        :icon="Upload"
        :loading="isLoading"
        size="small"
        @click="loadData"
        >Sample</el-button
      >
      <ToolModule v-if="hasData"></ToolModule>
      <div>
        <el-button
          v-if="!hasData"
          :icon="Upload"
          :loading="isLoading"
          size="small"
          @click="loadUserPromptedFiles"
          >Upload</el-button
        >
        <!-- <QuickInfo v-else /> -->
      </div>
    </div>
  </div>
</template>
