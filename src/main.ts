import '@kitware/vtk.js/Rendering/OpenGL/Profiles/Geometry';
import '@kitware/vtk.js/Rendering/OpenGL/Profiles/Volume';
import '@kitware/vtk.js/Rendering/OpenGL/Profiles/Glyph';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { setPipelinesBaseUrl, setPipelineWorkerUrl } from 'itk-wasm';
import { setPipelinesBaseUrl as imageIoSetPipelinesBaseUrl } from '@itk-wasm/image-io';
import itkConfig from '@/src/io/itk/itkConfig';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import { CorePiniaProviderPlugin } from '@/src/core/provider';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import { initItkWorker } from './io/itk/worker';
import { registerAllReaders } from './io/readers';
import { FILE_READERS } from './io';
import { StoreRegistry } from './plugins/storeRegistry';
import 'vuetify/lib/styles/main.css';
import './global.css';
import './reset.css';

initItkWorker();
registerAllReaders(FILE_READERS);

// Initialize global mapper topologies
// polys and lines in the front
vtkMapper.setResolveCoincidentTopologyToPolygonOffset();

// for @itk-wasm/image-io
setPipelinesBaseUrl(itkConfig.pipelinesUrl);
setPipelineWorkerUrl(itkConfig.pipelineWorkerUrl);
imageIoSetPipelinesBaseUrl(itkConfig.imageIOUrl);

const pinia = createPinia();
pinia.use(CorePiniaProviderPlugin({}));
pinia.use(StoreRegistry);

const app = createApp(App);

app.use(pinia);
app.use(vuetify);
app.mount('#app');
