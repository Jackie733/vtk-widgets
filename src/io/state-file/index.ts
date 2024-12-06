import JSZip from 'jszip';
import { Tools } from '@/src/store/tools/types';
import { LayoutDirection } from '@/src/types/layout';
import { retypeFile } from '../io';
import { ARCHIVE_FILE_TYPES } from '../mimeTypes';
import { Manifest } from './schema';

export const MANIFEST = 'manifest.json';
export const MANIFEST_VERSION = '4.0.0';

export async function serialize() {
  const zip = new JSZip();
  const manifest: Manifest = {
    version: MANIFEST_VERSION,
    datasets: [],
    labelMaps: [],
    tools: {
      crosshairs: {
        position: [0, 0, 0],
      },
      paint: {
        activeSegmentGroupID: null,
        activeSegment: null,
        brushSize: 8,
      },
      current: Tools.WindowLevel,
    },
    layout: {
      direction: LayoutDirection.H,
      items: [],
    },
    views: [],
    parentToLayers: [],
  };

  const stateFile = {
    zip,
    manifest,
  };
  console.log('TODO: serialize stateFile', stateFile);
}

export async function isStateFile(file: File) {
  const typedFile = await retypeFile(file);
  if (ARCHIVE_FILE_TYPES.has(typedFile.type)) {
    const zip = await JSZip.loadAsync(typedFile);

    return zip.file(MANIFEST) !== null;
  }

  return false;
}
