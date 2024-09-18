import { Bounds } from "@kitware/vtk.js/types";
import { mat3, mat4, vec3 } from "gl-matrix";
import { defineStore } from "pinia";
import { defaultLPSDirections, getLPSDirections } from "../utils/lps";
import { ImageMetadata } from "../types/image";
import vtkImageData from "@kitware/vtk.js/Common/DataModel/ImageData";

export const defaultImageMetadata = () => ({
  name: "(none)",
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
  metadata: ImageMetadata;
}

export const useImageStore = defineStore("images", {
  state: (): State => ({
    metadata: defaultImageMetadata(),
  }),
  actions: {
    addVTKImageData(name: string, imageData: vtkImageData) {
      this.metadata = {
        name,
        dimensions: imageData.getDimensions(),
        spacing: imageData.getSpacing(),
        origin: imageData.getOrigin(),
        orientation: imageData.getDirection(),
        lpsOrientation: getLPSDirections(imageData.getDirection()),
        worldBounds: imageData.getBounds(),
        worldToIndex: imageData.getWorldToIndex(),
        indexToWorld: imageData.getIndexToWorld(),
      };
    },
    deletaData() {
      this.metadata = defaultImageMetadata();
    },
  },
});
