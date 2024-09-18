<script setup lang="ts">
import LayoutGrid from "./components/LayoutGrid.vue";
import HeaderModule from "./components/HeaderModule.vue";
import { DefaultLayoutName, Layouts } from "./config";

const layout = Layouts[DefaultLayoutName];
</script>

<template>
  <div class="bg-slate-800 w-screen h-screen">
    <header-module />
    <div class="h-full w-full p-4">
      <layout-grid :layout="layout" />
    </div>
  </div>
</template>
