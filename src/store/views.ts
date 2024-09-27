import { defineStore } from 'pinia';
import { Layout, LayoutDirection } from '../types/layout';
import { ViewSpec } from '../types/views';
import { DefaultViewSpec, InitViewSpecs } from '../config';

interface State {
  layout: Layout;
  viewSpecs: Record<string, ViewSpec>;
}

export const useViewStore = defineStore('view', {
  state: (): State => ({
    layout: {
      direction: LayoutDirection.V,
      items: [],
    },
    viewSpecs: structuredClone(InitViewSpecs),
  }),
  getters: {
    viewIDs(state) {
      return Object.keys(state.viewSpecs);
    },
  },
  actions: {
    addView(id: string) {
      if (!(id in this.viewSpecs)) {
        this.viewSpecs[id] = structuredClone(DefaultViewSpec);
      }
    },
    removeView(id: string) {
      if (id in this.viewSpecs) {
        delete this.viewSpecs[id];
      }
    },
    setLayout(layout: Layout) {
      this.layout = layout;

      const layoutsToProcess = [layout];
      while (layoutsToProcess.length) {
        const ly = layoutsToProcess.shift();
        ly?.items.forEach((item) => {
          if (typeof item === 'string') {
            this.addView(item);
          } else {
            layoutsToProcess.push(item);
          }
        });
      }
    },
  },
});
