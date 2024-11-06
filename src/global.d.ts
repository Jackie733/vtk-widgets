import 'pinia';
import PaintTool from './core/tools/paint';
import type { Framework } from 'vuetify/types';

declare module 'pinia' {
  export interface PiniaCustomProperties {
    // from CorePiniaProviderPlugin
    $paint: PaintTool;
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $vuetify: Framework;
  }
}
