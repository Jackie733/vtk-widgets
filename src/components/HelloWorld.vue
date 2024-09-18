<script setup lang="ts">
defineProps<{ msg: string }>();
</script>

<template>
  <h1>{{ msg }}</h1>

  <p class="text-red-300">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped></style>
