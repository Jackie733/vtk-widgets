import JSZip from 'jszip';
import { retypeFile } from '../io';
import { ARCHIVE_FILE_TYPES } from '../mimeTypes';

export const MANIFEST = 'manifest.json';
export const MANIFEST_VERSION = '4.0.0';

export async function isStateFile(file: File) {
  const typedFile = await retypeFile(file);
  if (ARCHIVE_FILE_TYPES.has(typedFile.type)) {
    const zip = await JSZip.loadAsync(typedFile);

    return zip.file(MANIFEST) !== null;
  }

  return false;
}
