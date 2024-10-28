import {
  computed,
  MaybeRef,
  onMounted,
  readonly,
  ref,
  Ref,
  unref,
  UnwrapRef,
  watch,
} from 'vue';
import vtkAbstractWidget from '@kitware/vtk.js/Widgets/Core/AbstractWidget';
import { watchImmediate } from '@vueuse/core';
import { AnnotationTool, ToolID } from '../types/annotation-tool';
import { LPSAxis } from '../types/lps';
import { ImageMetadata } from '../types/image';
import { frameOfReferenceToImageSliceAndAxis } from '../utils/frameOfReference';
import { getCSSCoordinatesFromEvent } from '../utils/vtk-helpers';
import { onVTKEvent } from './onVTKEvent';
import {
  ContextMenuEvent,
  vtkAnnotationToolWidget,
} from '../vtk/ToolWidgetUtils/types';
import { View } from '../core/vtk/types';
import { AnnotationToolStore } from '../store/tools/useAnnotationTool';
import { useCurrentImage } from './useCurrentImage';
import { Maybe } from '../types';

export const doesToolFrameMatchViewAxis = <Tool extends AnnotationTool>(
  viewAxis: MaybeRef<LPSAxis>,
  tool: Partial<Tool>,
  imageMetadata: MaybeRef<ImageMetadata>
) => {
  if (!tool.frameOfReference) return false;

  const toolAxis = frameOfReferenceToImageSliceAndAxis(
    tool.frameOfReference,
    unref(imageMetadata),
    {
      allowOutOfBoundsSlice: true,
    }
  );
  return !!toolAxis && toolAxis.axis === unref(viewAxis);
};

export const useCurrentTools = <S extends AnnotationToolStore>(
  toolStore: S,
  viewAxis: Ref<LPSAxis>
) => {
  const { currentImageID, currentImageMetadata } = useCurrentImage();
  return computed(() => {
    const curImageID = currentImageID.value;

    type ToolType = S['tools'][number];
    return (toolStore.tools as Array<ToolType>).filter((tool) => {
      // only show tools for the current image,
      // current view axis and not hidden
      return (
        tool.imageID === curImageID &&
        doesToolFrameMatchViewAxis(viewAxis, tool, currentImageMetadata) &&
        !tool.hidden
      );
    });
  });
};

// --- Context Menu --- //

export const useContextMenu = () => {
  const contextMenu = ref<{
    open: (id: ToolID, e: ContextMenuEvent) => void;
  } | null>(null);
  const openContextMenu = (toolID: ToolID, event: ContextMenuEvent) => {
    if (!contextMenu.value)
      throw new Error('contextMenu component does not exist');
    contextMenu.value.open(toolID, event);
  };

  return { contextMenu, openContextMenu };
};

export const useRightClickContextMenu = (
  emit: (event: 'contextmenu', ...args: any[]) => void,
  widget: MaybeRef<vtkAnnotationToolWidget | null>
) => {
  onVTKEvent(widget, 'onRightClickEvent', (eventData) => {
    const displayXY = getCSSCoordinatesFromEvent(eventData);
    if (displayXY) {
      emit('contextmenu', {
        displayXY,
        widgetActions: eventData.widgetActions,
      } satisfies ContextMenuEvent);
    }
  });
};

// --- Hover --- //

export const useHoverEvent = (
  emit: (event: 'widgetHover', ...args: any[]) => void,
  widget: MaybeRef<vtkAnnotationToolWidget | null>
) => {
  onVTKEvent(widget, 'onHoverEvent', (eventData: any) => {
    const displayXY = getCSSCoordinatesFromEvent(eventData);
    if (displayXY) {
      emit('widgetHover', {
        displayXY,
        hovering: eventData.hovering,
      });
    }
  });
};

export const usePlacingAnnotationTool = (
  store: AnnotationToolStore,
  metadata: Ref<Partial<AnnotationTool>>
) => {
  const id = ref<Maybe<ToolID>>(null);

  const commit = () => {
    const id_ = id.value as Maybe<ToolID>;
    if (!id_) return;
    store.updateTool(id_, { placing: false });
    id.value = null;
  };

  const add = () => {
    if (id.value) throw new Error('Placing tool already exists.');
    id.value = store.addTool({
      ...metadata.value,
      placing: true,
    }) as UnwrapRef<ToolID>;
  };

  const remove = () => {
    const id_ = id.value as Maybe<ToolID>;
    if (!id_) return;
    store.removeTool(id_);
    id.value = null;
  };

  watch(metadata, () => {
    if (!id.value) return;
    store.updateTool(id.value as ToolID, metadata.value);
  });

  return {
    id: readonly(id),
    commit,
    add,
    remove,
  };
};

export const useWidgetVisibility = <T extends vtkAbstractWidget>(
  widget: T,
  visible: Ref<boolean>,
  view: View
) => {
  // toggles the pickability of the ruler handles,
  // since the 3D ruler parts are visually hidden.
  watchImmediate(
    () => visible.value,
    (visibility) => {
      widget.setVisibility(visibility);
    }
  );

  onMounted(() => {
    // hide handle visibility, but not picking visibility
    widget.setHandleVisibility(false);
    view.widgetManager.renderWidgets();
    view.requestRender();
  });
};
