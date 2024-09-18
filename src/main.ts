import "@kitware/vtk.js/Rendering/OpenGL/Profiles/Geometry";
import "@kitware/vtk.js/Rendering/OpenGL/Profiles/Volume";
import "@kitware/vtk.js/Rendering/OpenGL/Profiles/Glyph";

import { createApp } from "vue";
import "./global.css";
import App from "./App.vue";

createApp(App).mount("#app");
