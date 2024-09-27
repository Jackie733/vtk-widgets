<template>
  <div class="flex flex-col flex-auto" :class="flexFlow">
    <div v-for="(item, i) in items" :key="i" class="flex flex-auto">
      <layout-grid v-if="item.type === 'layout'" :layout="item as Layout" />
      <div v-else class="flex flex-1 border border-solid border-slate-400">
        <component
          :is="item.component"
          :key="item.id"
          :id="item.id"
          :type="item.viewType"
          v-bind="item.props"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, toRefs, watchEffect } from 'vue';
import { InitViewSpecs } from '../config';
import { Layout, LayoutDirection } from '../types/layout';
import { ViewTypeToComponent } from '../core/viewTypes';

export default defineComponent({
  name: 'LayoutGrid',
  props: {
    layout: {
      type: Object as PropType<Layout>,
      required: true,
    },
  },
  setup(props) {
    const { layout } = toRefs(props);

    const flexFlow = computed(() => {
      return layout.value.direction === LayoutDirection.H
        ? 'flex-column'
        : 'flex-row';
    });

    watchEffect(() => {
      console.log(flexFlow.value);
    });

    const items = computed(() => {
      return layout.value.items.map((item) => {
        if (typeof item === 'string') {
          const spec = InitViewSpecs[item];
          return {
            type: 'view',
            id: item,
            viewType: spec.viewType,
            component: ViewTypeToComponent[spec.viewType],
            props: spec.props,
          };
        }
        return {
          type: 'layout',
          ...item,
        };
      });
    });

    return {
      items,
      flexFlow,
    };
  },
});
</script>

<style scoped src="@/src/components/styles/utils.css"></style>
