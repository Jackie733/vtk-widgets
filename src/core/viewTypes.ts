import { Component } from 'vue';
import SliceViewer from '../components/SliceViewer.vue';

export const ViewTypeToComponent: Record<string, Component> = {
  '2D': SliceViewer,
};
