import vtkInteractorStyle from "@kitware/vtk.js/Rendering/Core/InteractorStyle";
import { View, VtkObjectConstructor } from "./types";
import { vtkWarningMacro } from "@kitware/vtk.js/macros";
import { onScopeDispose } from "vue";

export function useVtkInteractorStyle<T extends vtkInteractorStyle>(
  vtkCtor: VtkObjectConstructor<T>,
  view: View,
) {
  const style = vtkCtor.newInstance();

  if (view.interactor.getInteractorStyle()) {
    vtkWarningMacro("Overwriting an already set interactor style");
  }
  view.interactor.setInteractorStyle(style);

  onScopeDispose(() => {
    if (view.interactor.getInteractorStyle() === style) {
      view.interactor.setInteractorStyle(null);
    }
    style.delete();
  });

  return { interactorStyle: style };
}
