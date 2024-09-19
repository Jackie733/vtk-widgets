import { Bounds } from '@kitware/vtk.js/types';
import { mat3, mat4, vec3 } from 'gl-matrix';
import { defineStore } from 'pinia';
import vtkImageData from '@kitware/vtk.js/Common/DataModel/ImageData';
import { defaultLPSDirections, getLPSDirections } from '../utils/lps';
import { ImageMetadata } from '../types/image';
import { useIdStore } from './id';
import { removeFromArray } from '../utils';

export const defaultImageMetadata = () => ({
  name: '(none)',
  orientation: mat3.create(),
  lpsOrientation: defaultLPSDirections(),
  spacing: vec3.fromValues(1, 1, 1),
  origin: vec3.create(),
  dimensions: vec3.fromValues(1, 1, 1),
  worldBounds: [0, 1, 0, 1, 0, 1] as Bounds,
  worldToIndex: mat4.create(),
  indexToWorld: mat4.create(),
});

interface State {
  idList: string[];
  dataIndex: Record<string, vtkImageData>;
  metadata: Record<string, ImageMetadata>;
}

export const useImageStore = defineStore('images', {
  state: (): State => ({
    idList: [],
    dataIndex: Object.create(null),
    metadata: Object.create(null),
  }),
  actions: {
    addVTKImageData(name: string, imageData: vtkImageData, useId?: string) {
      if (useId && useId in this.dataIndex) {
        throw new Error('ID already exists');
      }

      const id = useId || useIdStore().nextId();

      this.idList.push(id);
      this.dataIndex[id] = imageData;

      this.metadata[id] = { ...defaultImageMetadata(), name };
      this.updateData(id, imageData);
      return id;

      // this.metadata = {
      //   name,
      //   dimensions: imageData.getDimensions(),
      //   spacing: imageData.getSpacing(),
      //   origin: imageData.getOrigin(),
      //   orientation: imageData.getDirection(),
      //   lpsOrientation: getLPSDirections(imageData.getDirection()),
      //   worldBounds: imageData.getBounds(),
      //   worldToIndex: imageData.getWorldToIndex(),
      //   indexToWorld: imageData.getIndexToWorld(),
      // };
    },
    updateData(id: string, imageData: vtkImageData) {
      if (id in this.metadata) {
        const metadata: ImageMetadata = {
          name: this.metadata[id].name,
          dimensions: imageData.getDimensions() as vec3,
          spacing: imageData.getSpacing() as vec3,
          origin: imageData.getOrigin() as vec3,
          orientation: imageData.getDirection() as mat3,
          lpsOrientation: getLPSDirections(imageData.getDirection()),
          worldBounds: imageData.getBounds(),
          worldToIndex: imageData.getWorldToIndex(),
          indexToWorld: imageData.getIndexToWorld(),
        };

        this.metadata[id] = metadata;
        this.dataIndex[id] = imageData;
      }
      this.dataIndex[id] = imageData;
    },
    deletaData(id: string) {
      if (id in this.dataIndex) {
        delete this.dataIndex[id];
        delete this.metadata[id];
        removeFromArray(this.idList, id);
      }
    },
  },
});
