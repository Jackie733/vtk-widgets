import { extensionToImageIo, readImage } from '@itk-wasm/image-io';
import { convertItkToVtkImage } from '@kitware/vtk.js/Common/DataModel/ITKHelper';
import { getWorker } from './itk/worker';
import { FILE_EXT_TO_MIME } from './mimeTypes';
import { FileReaderMap } from '.';

export const ITK_IMAGE_MIME_TYPES = Array.from(
  new Set(
    Array.from(extensionToImageIo.keys()).map(
      (ext) => FILE_EXT_TO_MIME[ext.toLowerCase()]
    )
  )
);

export async function itkReader(file: File) {
  const { image } = await readImage(file, {
    webWorker: getWorker(),
  });
  return convertItkToVtkImage(image);
}

export function registerAllReaders(readerMap: FileReaderMap) {
  // readerMap.set('application/vnd.unknown.vti', vtiReader);
  // readerMap.set('application/vnd.unknown.vtp', vtpReader);
  // readerMap.set('model/stl', stlReader);

  ITK_IMAGE_MIME_TYPES.forEach((mime) => {
    readerMap.set(mime, itkReader);
  });
}
