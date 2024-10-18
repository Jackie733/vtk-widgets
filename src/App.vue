<script setup lang="ts">
import { computed } from 'vue';
import LayoutGrid from './components/LayoutGrid.vue';
import HeaderModule from './components/HeaderModule.vue';
import { DefaultLayoutName, Layouts } from './config';
import { useDICOMStore } from './store/dicom';
import { useImageStore } from './store/images';

const layout = Layouts[DefaultLayoutName];

const imageStore = useImageStore();
const dicomStore = useDICOMStore();

const hasData = computed(() => {
  return (
    imageStore.idList.length > 0 ||
    Object.keys(dicomStore.volumeInfo).length > 0
  );
});
</script>

<template>
  <div class="bg-zinc-900 w-screen h-screen">
    <HeaderModule />
    <div class="h-[28rem] flex flex-col flex-grow">
      <LayoutGrid v-show="hasData" :layout="layout" />
    </div>
  </div>
</template>
