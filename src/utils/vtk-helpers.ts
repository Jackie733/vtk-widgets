import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import vtkOpenGLRenderWindow from '@kitware/vtk.js/Rendering/OpenGL/RenderWindow';
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

/**
 * Gets the CSS coordinates for a vtk.js mouse event.
 */
export function getCSSCoordinatesFromEvent(eventData: any) {
  const { pokedRenderer }: { pokedRenderer: vtkRenderer } = eventData;
  const view = pokedRenderer?.getRenderWindow()?.getViews()?.[0] as
    | vtkOpenGLRenderWindow
    | undefined;
  const bbox = view?.getContainer()?.getBoundingClientRect();

  if (!('position' in eventData) || !bbox) {
    return null;
  }

  return [
    bbox.left + eventData.position.x / devicePixelRatio,
    bbox.top + bbox.height - eventData.position.y / devicePixelRatio,
  ] as Vector2;
}

/**
 * Retrieves the color function range, if any.
 *
 * Will only return the color function range if the preset
 * has AbsoluteRange specified as true. For medical presets,
 * the range is defined by the transfer function point range,
 * rather than the dataset data range.
 * @param presetName
 * @returns
 */
export function getColorFunctionRangeFromPreset(
  presetName: string
): [number, number] | null {
  const preset = vtkColorMaps.getPresetByName(presetName);
  if (!preset) return null;

  const { AbsoluteRange, RGBPoints } = preset;
  if (AbsoluteRange && RGBPoints) {
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < RGBPoints.length; i += 4) {
      min = Math.min(min, RGBPoints[i]);
      max = Math.max(max, RGBPoints[i]);
    }
    return [min, max];
  }
  return null;
}
