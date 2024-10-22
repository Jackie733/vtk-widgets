<script setup lang="ts">
import { ref } from 'vue';
import SelectButton from 'primevue/selectbutton';
import { Tools } from '../store/tools/types';
import { useToolStore } from '../store/tools';

const value = ref(null);
const options = ref([
  { icon: 'pi pi-map-marker', value: 'Label' },
  { icon: 'pi pi-plus', value: Tools.Crosshairs },
]);

const toolStore = useToolStore();

function handleChange(obj: any) {
  console.log('Changed', obj.value);
  toolStore.setCurrentTool(obj.value);
}
</script>

<template>
  <div>
    <SelectButton
      v-model="value"
      :options="options"
      optionLabel="value"
      dataKey="value"
      aria-labelledby="custom"
      @update:model-value="handleChange"
    >
      <template #option="slotProps">
        <i
          v-tooltip.bottom="slotProps.option.value"
          :class="slotProps.option.icon"
        ></i>
      </template>
    </SelectButton>
  </div>
</template>
