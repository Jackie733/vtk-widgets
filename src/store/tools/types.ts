import type { Manifest, StateFile } from '@/src/io/state-file/schema';
import { Store } from 'pinia';

export enum AnnotationToolType {
  Ruler = 'Ruler',
  Rectangle = 'Rectangle',
  Polygon = 'Polygon',
}

export enum Tools {
  Crosshairs = 'Crosshairs',
  WindowLevel = 'WindowLevel',
  Pan = 'Pan',
  Paint = 'Paint',
  Ruler = 'Ruler',
  // Zoom = 'Zoom',
  // Crop = 'Crop',
  Select = 'Select',
  Rectangle = 'Rectangle',
  Polygon = 'Polygon',
}

export interface IActivatableTool {
  activateTool: () => boolean;
  deactivateTool: () => void;
}

export interface ISerializableTool {
  serialize: (state: StateFile) => void;
  deserialize: (manifest: Manifest, dataIDMap: Record<string, string>) => void;
}

export interface IToolStore
  extends Partial<IActivatableTool>,
    Partial<ISerializableTool>,
    Store {}
