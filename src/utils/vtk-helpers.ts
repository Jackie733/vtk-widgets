import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import type { Vector2, Vector3 } from '@kitware/vtk.js/types';

export function computeWorldToDisplay(
  xyz: Vector3,
  renderer: vtkRenderer
): Vector2 | null {
  const view = renderer.getRenderWindow()?.getViews()?.[0];
  if (view) {
    const [x, y, z] = xyz;
    return view.worldToDisplay(x, y, z, renderer);
  }
  return null;
}

/**
 * Converts world coordinates to SVG-friendly coordinates.
 *
 * Assumes that the SVG layer is the same size as the renderer.
 * TODO verify this is the case.
 */
export function worldToSVG(xyz: Vector3, renderer: vtkRenderer) {
  const coords = computeWorldToDisplay(xyz, renderer);
  const view = renderer.getRenderWindow()?.getViews()?.[0];
  if (coords && view) {
    const [, height] = view.getViewportSize(renderer);
    // convert from canvas space to svg space
    return [
      coords[0] / devicePixelRatio,
      (height - coords[1]) / devicePixelRatio,
    ] as Vector2;
  }
  return null;
}