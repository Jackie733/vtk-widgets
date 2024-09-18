import "@kitware/vtk.js/Rendering/OpenGL/Profiles/Geometry";
import "@kitware/vtk.js/Rendering/OpenGL/Profiles/Volume";
import "@kitware/vtk.js/Rendering/OpenGL/Profiles/Glyph";

import { setPipelinesBaseUrl, setPipelineWorkerUrl } from "@itk-wasm/image-io";
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./global.css";
import itkConfig from "@/src/io/itk/itkConfig";
import { initItkWorker } from "./io/itk/worker";

initItkWorker();

setPipelineWorkerUrl(itkConfig.pipelineWorkerUrl);
setPipelinesBaseUrl(itkConfig.imageIOUrl);

const pinia = createPinia();

const app = createApp(App);
app.use(pinia);
app.mount("#app");
