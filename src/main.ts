import '@kitware/vtk.js/Rendering/OpenGL/Profiles/Geometry';
import '@kitware/vtk.js/Rendering/OpenGL/Profiles/Volume';
import '@kitware/vtk.js/Rendering/OpenGL/Profiles/Glyph';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import { setPipelinesBaseUrl, setPipelineWorkerUrl } from '@itk-wasm/image-io';
import itkConfig from '@/src/io/itk/itkConfig';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import App from './App.vue';
import { initItkWorker } from './io/itk/worker';
import { registerAllReaders } from './io/readers';
import { FILE_READERS } from './io';
import { storeRegistry } from './plugins/storeRegistry';
import { CorePiniaProviderPlugin } from '@/src/core/provider';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import './global.css';
import './reset.css';

initItkWorker();
registerAllReaders(FILE_READERS);

// Initialize global mapper topologies
// polys and lines in the front
vtkMapper.setResolveCoincidentTopologyToPolygonOffset();

// for @itk-wasm/image-io
setPipelineWorkerUrl(itkConfig.pipelineWorkerUrl);
setPipelinesBaseUrl(itkConfig.imageIOUrl);

const pinia = createPinia();
pinia.use(CorePiniaProviderPlugin({}));
pinia.use(storeRegistry);

const app = createApp(App);

app.use(ElementPlus);
app.use(pinia);
app.mount('#app');
