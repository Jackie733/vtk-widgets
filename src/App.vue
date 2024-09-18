<script setup lang="ts">
import LayoutGrid from "./components/LayoutGrid.vue";
import HeaderModule from "./components/HeaderModule.vue";
import { DefaultLayoutName, Layouts } from "./config";
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useImageStore } from "./store/images";

const layout = Layouts[DefaultLayoutName];

const { metadata } = storeToRefs(useImageStore());

const hasData = computed(() => {
  return metadata.value.name !== "(none)";
});
</script>

<template>
  <div class="bg-slate-800 w-screen h-screen">
    <header-module />
    <div class="h-full w-full p-4">
      <layout-grid v-show="hasData" :layout="layout" />
    </div>
  </div>
</template>
