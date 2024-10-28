<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import LayoutGrid from './components/LayoutGrid.vue';
import HeaderModule from './components/HeaderModule.vue';
import { useDICOMStore } from './store/dicom';
import { useImageStore } from './store/images';
import { useViewStore } from './store/views';

const { layout } = storeToRefs(useViewStore());

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
  <div class="bg-zinc-900 w-screen h-screen flex flex-col">
    <HeaderModule :has-data="hasData" />
    <div class="flex flex-col flex-1">
      <LayoutGrid v-show="hasData" :layout="layout" />
    </div>
  </div>
</template>
