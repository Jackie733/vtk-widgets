import { Component } from 'vue';
import SliceViewer from '../components/SliceViewer.vue';
// import VolumeViewer from '../components/VolumeViewer.vue';

export const ViewTypeToComponent: Record<string, Component> = {
  '2D': SliceViewer,
  // '3D': VolumeViewer,
};
