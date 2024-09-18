import vtkCamera from "@kitware/vtk.js/Rendering/Core/Camera";
import { MaybeRef, ref } from "vue";
import { onPausableVTKEvent } from "./onPausableVTKEvent";

export function useAutoFitState(camera: MaybeRef<vtkCamera>) {
  const autoFit = ref(true);

  const { withPaused } = onPausableVTKEvent(camera, "onModified", () => {
    autoFit.value = false;
  });

  return { autoFit, withoutAutoFitEffect: withPaused };
}
