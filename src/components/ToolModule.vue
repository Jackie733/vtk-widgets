<script setup lang="ts">
import { ref } from 'vue';
import SelectButton from 'primevue/selectbutton';

const value = ref(null);
const options = ref([{ icon: 'pi pi-map-marker', value: 'Marker' }]);
</script>

<template>
  <div>
    <SelectButton
      v-model="value"
      :options="options"
      optionLabel="value"
      dataKey="value"
      aria-labelledby="custom"
    >
      <template #option="slotProps">
        <i :class="slotProps.option.icon"></i>
      </template>
    </SelectButton>
  </div>
</template>
