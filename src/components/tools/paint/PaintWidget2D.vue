<script lang="ts">
import { Maybe } from '@/src/types';
import { LPSAxisDir } from '@/src/types/lps';
import {
  computed,
  defineComponent,
  inject,
  onMounted,
  onUnmounted,
  PropType,
  toRefs,
  watchEffect,
} from 'vue';
import { useSliceInfo } from '@/src/composables/useSliceInfo';
import { usePaintToolStore } from '@/src/store/tools/paint';
import { useImage } from '@/src/composables/useCurrentImage';
import { getLPSAxisFromDir } from '@/src/utils/lps';
import { vec3 } from 'gl-matrix';
import { vtkPaintViewWidget } from '@/src/vtk/PaintWidget';
import { onVTKEvent } from '@/src/composables/onVTKEvent';
import vtkPlaneManipulator from '@kitware/vtk.js/Widgets/Manipulators/PlaneManipulator';
import { updatePlaneManipulatorFor2DView } from '@/src/utils/manipulators';
import { VtkViewContext } from '../../vtk/context';

export default defineComponent({
  name: 'PaintWidget2D',
  props: {
    viewId: {
      type: String,
      required: true,
    },
    viewDirection: {
      type: String as PropType<LPSAxisDir>,
      required: true,
    },
    imageId: String as PropType<Maybe<string>>,
  },
  setup(props) {
    const { viewDirection, viewId, imageId } = toRefs(props);

    const view = inject(VtkViewContext);
    if (!view) throw new Error('No VtkView');

    const sliceInfo = useSliceInfo(viewId, imageId);
    const slice = computed(() => sliceInfo.value?.slice);

    const paintStore = usePaintToolStore();
    const widgetFactory = paintStore.getWidgetFactory();
    const widgetState = widgetFactory.getWidgetState();

    const { metadata: imageMetadata } = useImage(imageId);
    const viewAxis = computed(() => getLPSAxisFromDir(viewDirection.value));
    const viewAxisIndex = computed(
      () => imageMetadata.value.lpsOrientation[viewAxis.value]
    );

    const worldPointToIndex = (worldPoint: vec3) => {
      const { worldToIndex } = imageMetadata.value;
      const indexPoint = vec3.create();
      vec3.transformMat4(indexPoint, worldPoint, worldToIndex);
      return indexPoint;
    };

    const widget = view.widgetManager.addWidget(
      widgetFactory
    ) as vtkPaintViewWidget;

    onMounted(() => {
      view.widgetManager.renderWidgets();
      view.widgetManager.grabFocus(widget);
    });

    onUnmounted(() => {
      view.widgetManager.removeWidget(widgetFactory);
    });

    // --- widget representation config --- //

    watchEffect(() => {
      const metadata = imageMetadata.value;
      const slicingIndex = metadata.lpsOrientation[viewAxis.value];
      if (widget) {
        widget.setSlicingIndex(slicingIndex);
        widget.setIndexToWorld(metadata.indexToWorld);
        widget.setWorldToIndex(metadata.worldToIndex);
      }
    });

    // --- interaction --- //

    onVTKEvent(widget, 'onStartInteractionEvent', () => {
      const indexPoint = worldPointToIndex(widgetState.getBrush().getOrigin()!);
      paintStore.startStroke(indexPoint, viewAxisIndex.value);
    });

    onVTKEvent(widget, 'onInteractionEvent', () => {
      const indexPoint = worldPointToIndex(widgetState.getBrush().getOrigin()!);
      paintStore.placeStrokePoint(indexPoint, viewAxisIndex.value);
    });

    onVTKEvent(widget, 'onEndInteractionEvent', () => {
      const indexPoint = worldPointToIndex(widgetState.getBrush().getOrigin()!);
      paintStore.endStroke(indexPoint, viewAxisIndex.value);
    });

    // --- manipulator --- //

    const manipulator = vtkPlaneManipulator.newInstance();
    widget.setManipulator(manipulator);

    watchEffect(() => {
      if (slice.value == null) return;
      updatePlaneManipulatorFor2DView(
        manipulator,
        viewDirection.value,
        slice.value,
        imageMetadata.value
      );
    });

    // --- visibility --- //

    let checkIfPointerInView = false;

    onMounted(() => {
      widget.setVisibility(false);
      checkIfPointerInView = true;
    });

    // Turn on widget visibility and update stencil
    // if mouse starts within view
    onVTKEvent(view.interactor, 'onMouseMove', () => {
      if (!checkIfPointerInView) {
        return;
      }
      checkIfPointerInView = false;

      widget.setVisibility(true);
      paintStore.setSliceAxis(viewAxisIndex.value);
    });

    onVTKEvent(view.interactor, 'onMouseEnter', () => {
      paintStore.setSliceAxis(viewAxisIndex.value);
      widget.setVisibility(true);
    });

    onVTKEvent(view.interactor, 'onMouseLeave', () => {
      widget.setVisibility(false);
    });

    return () => null;
  },
});
</script>
