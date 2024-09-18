import { readImage } from "@itk-wasm/image-io";
import { convertItkToVtkImage } from "@kitware/vtk.js/Common/DataModel/ITKHelper";

async function itkReader(file: File) {
  const { image } = await readImage(file, {
    webWorker: getWorker(),
  });
  return convertItkToVtkImage(image);
}
