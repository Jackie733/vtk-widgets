import { defineStore } from 'pinia';
import { AnnotationToolAPI } from '../store/tools/useAnnotationTool';
import { AnnotationTool } from '../types/annotation-tool';

export function defineAnnotationToolStore<
  T extends AnnotationTool,
  S extends AnnotationToolAPI<T>
>(name: string, setup: () => S) {
  return defineStore(name, setup);
}
