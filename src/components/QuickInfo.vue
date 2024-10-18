<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import Popover from 'primevue/popover';

const op = ref();

const toggle = (event: Event) => {
  op.value.toggle(event);
};
</script>

<template>
  <div class="card flex justify-center">
    <Button
      size="small"
      severity="secondary"
      icon="pi pi-info"
      rounded
      aria-label="Info"
      @click="toggle"
    />
    <Popover ref="op">
      <div class="flex flex-col gap-4 w-[25rem]"></div>
    </Popover>
  </div>
</template>
