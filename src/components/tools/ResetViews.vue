<script lang="ts">
import { defineComponent } from 'vue';
import { createEventHook } from '@vueuse/core';

const clickEvent = createEventHook<void>();

export function useResetViewsEvents() {
  return { onClick: clickEvent.on };
}

export default defineComponent({
  components: {},
  methods: {
    onClick() {
      clickEvent.trigger();
    },
  },
});
</script>

<template>
  <div></div>
</template>
