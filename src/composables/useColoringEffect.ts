import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';
import vtkPiecewiseFunctionProxy from '@kitware/vtk.js/Proxy/Core/PiecewiseFunctionProxy';
import vtkPiecewiseGaussianWidget from '@kitware/vtk.js/Interaction/Widgets/PiecewiseGaussianWidget';
import { computed, MaybeRef, unref, watchEffect } from 'vue';
import {
  ColoringConfig,
  ColorTransferFunction,
  OpacityFunction,
} from '../types/views';
import {
  applyNodesToPiecewiseFunction,
  applyPointsToPiecewiseFunction,
  getShiftedOpacityFromPreset,
} from '../utils/vtk-helpers';
import { Maybe } from '../types';

export interface ApplyColoringParams {
  props: {
    colorFunction: ColorTransferFunction;
    opacityFunction: OpacityFunction;
  };
  cfun: vtkColorTransferFunction;
  ofun: vtkPiecewiseFunction;
  componentIndex?: number;
}

export function applyColoring({
  props: { colorFunction, opacityFunction },
  cfun,
  ofun,
  componentIndex = 1,
}: ApplyColoringParams) {
  if (componentIndex === -1) {
    cfun.setVectorModeToMagnitude();
  } else {
    cfun.setVectorModeToComponent();
    cfun.setVectorComponent(componentIndex);
  }

  const preset = vtkColorMaps.getPresetByName(colorFunction.preset);
  if (preset) {
    cfun.applyColorMap(preset);
  }
  cfun.setMappingRange(...colorFunction.mappingRange);

  const { mappingRange } = opacityFunction;
  ofun.setRange(...opacityFunction.mappingRange);

  switch (opacityFunction.mode) {
    case vtkPiecewiseFunctionProxy.Mode.Gaussians:
      vtkPiecewiseGaussianWidget.applyGaussianToPiecewiseFunction(
        opacityFunction.gaussians,
        256,
        opacityFunction.mappingRange,
        ofun
      );
      break;
    case vtkPiecewiseFunctionProxy.Mode.Points: {
      const opacityPoints = getShiftedOpacityFromPreset(
        opacityFunction.preset,
        opacityFunction.mappingRange,
        opacityFunction.shift,
        opacityFunction.shiftAlpha
      );
      if (opacityPoints) {
        applyPointsToPiecewiseFunction(ofun, opacityPoints, mappingRange);
      }
      break;
    }
    case vtkPiecewiseFunctionProxy.Mode.Nodes: {
      applyNodesToPiecewiseFunction(ofun, opacityFunction.nodes, mappingRange);
      break;
    }
    default:
      throw new Error('Invalid opacity function mode encountered');
  }
}

export function useColoringEffect(
  config: MaybeRef<Maybe<ColoringConfig>>,
  cfun: MaybeRef<vtkColorTransferFunction>,
  ofun: MaybeRef<vtkPiecewiseFunction>
) {
  const colorTransferFunction = computed(() => unref(config)?.transferFunction);
  const opacityFunction = computed(() => unref(config)?.opacityFunction);

  watchEffect(() => {
    const colorFunc = colorTransferFunction.value;
    const opacityFunc = opacityFunction.value;
    if (!colorFunc || !opacityFunc) {
      return;
    }
    applyColoring({
      props: {
        colorFunction: colorFunc,
        opacityFunction: opacityFunc,
      },
      cfun: unref(cfun),
      ofun: unref(ofun),
    });
  });
}
