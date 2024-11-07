<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import LayoutGrid from './components/LayoutGrid.vue';
import HeaderModule from './components/HeaderModule.vue';
import ModulePanel from './components/ModulePanel.vue';
import { useDICOMStore } from './store/dicom';
import { useImageStore } from './store/images';
import { useViewStore } from './store/views';

const { layout } = storeToRefs(useViewStore());

const imageStore = useImageStore();
const dicomStore = useDICOMStore();
const viewStore = useViewStore();

const hasData = computed(() => {
  return (
    imageStore.idList.length > 0 ||
    Object.keys(dicomStore.volumeInfo).length > 0
  );
});
</script>

<template>
  <div class="bg-zinc-900 w-screen h-screen flex flex-col">
    <v-app>
      <HeaderModule :has-data="hasData" />
      <v-navigation-drawer
        v-model="viewStore.sideVisible"
        app
        clipped
        touchless
        width="320"
        id="left-nav"
      >
        <ModulePanel v-if="viewStore.sideVisible" />
      </v-navigation-drawer>
      <v-main id="content-main">
        <div class="h-full flex flex-row flex-1">
          <LayoutGrid v-show="hasData" :layout="layout" />
        </div>
      </v-main>
    </v-app>
  </div>
</template>
