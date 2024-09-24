import { MaybeRef } from 'vue';
import { Maybe } from '@/src/types';
import vtkImageData from '@kitware/vtk.js/Common/DataModel/ImageData';
import vtkImageSlice from '@kitware/vtk.js/Rendering/Core/ImageSlice';
import vtkImageMapper from '@kitware/vtk.js/Rendering/Core/ImageMapper';
import { View } from './types';
import { useVtkRepresentation } from './useVtkRepresentation';

export function useSliceRepresentation(
  view: View,
  imageData: MaybeRef<Maybe<vtkImageData>>
) {
  const sliceRep = useVtkRepresentation({
    view,
    data: imageData,
    vtkActorClass: vtkImageSlice,
    vtkMapperClass: vtkImageMapper,
  });

  return sliceRep;
}
