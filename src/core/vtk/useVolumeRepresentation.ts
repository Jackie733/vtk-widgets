import { View } from '@/src/core/vtk/types';
import { Maybe } from '@/src/types';
import vtkImageData from '@kitware/vtk.js/Common/DataModel/ImageData';
import { MaybeRef } from 'vue';
import vtkVolume from '@kitware/vtk.js/Rendering/Core/Volume';
import vtkVolumeMapper from '@kitware/vtk.js/Rendering/Core/VolumeMapper';
import { useVtkRepresentation } from './useVtkRepresentation';

export function useVolumeRepresentation(
  view: View,
  imageData: MaybeRef<Maybe<vtkImageData>>
) {
  const volRep = useVtkRepresentation({
    view,
    data: imageData,
    vtkActorClass: vtkVolume,
    vtkMapperClass: vtkVolumeMapper,
  });

  return volRep;
}
