import { defineStore } from 'pinia';
import { Layout, LayoutDirection } from '../types/layout';
import { ViewSpec } from '../types/views';
import { DefaultViewSpec, InitViewSpecs } from '../config';
import {
  StateFile,
  Layout as StateFileLayout,
  View,
} from '../io/state-file/schema';
import { useViewConfigStore } from './view-configs';

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
    serialize(stateFile: StateFile) {
      const viewConfigStore = useViewConfigStore();
      const { manifest } = stateFile;
      const { views } = manifest;

      manifest.layout = this.layout as StateFileLayout;

      // Serialize the view specs
      Object.entries(this.viewSpecs).forEach(([id, spec]) => {
        const type = spec.viewType;
        const { props } = spec;
        const config = {};

        const view = {
          id,
          type,
          props,
          config,
        };

        views.push(view);
      });

      // Serialize the view config
    },
  },
});
