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
import type { Vector2 } from '@kitware/vtk.js/types';
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
import { usePopperState } from './usePopperState';
import { useToolStore } from '../store/tools';
import { Tools } from '../store/tools/types';

const SHOW_OVERLAY_DELAY = 250; // milliseconds

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

export type OverlayInfo =
  | { visible: false }
  | { visible: true; toolID: ToolID; displayXY: Vector2 };

// Maintains list of tools' hover states.
// If one tool hovered, overlayInfo.visible === true with toolID and displayXY
export const useHover = (
  tools: Ref<Array<AnnotationTool>>,
  currentSlice: Ref<number>
) => {
  type Info = OverlayInfo;
  const toolHoverState = ref({}) as Ref<Record<ToolID, Info>>;

  const toolsOnCurrentSlice = computed(() =>
    tools.value.filter((tool) => tool.slice === currentSlice.value)
  );

  watch(toolsOnCurrentSlice, () => {
    toolHoverState.value = toolsOnCurrentSlice.value.reduce(
      (toolsHovers, { id }) => {
        const state = toolHoverState.value[id] ?? {
          visible: false,
        };
        return Object.assign(toolsHovers, {
          [id]: state,
        });
      },
      {} as Record<ToolID, Info>
    );
  });

  const onHover = (id: ToolID, event: any) => {
    toolHoverState.value[id] = event.hovering
      ? {
          visible: true,
          toolID: id,
          displayXY: event.displayXY,
        }
      : {
          visible: false,
        };
  };

  const synchronousOverlayInfo = computed(() => {
    const visibleToolID = Object.keys(toolHoverState.value).find(
      (toolID) => toolHoverState.value[toolID as ToolID].visible
    ) as ToolID | undefined;

    return visibleToolID
      ? toolHoverState.value[visibleToolID]
      : ({ visible: false } as Info);
  });

  const { isSet: showOverlay, reset: resetOverlay } =
    usePopperState(SHOW_OVERLAY_DELAY);

  watch(synchronousOverlayInfo, resetOverlay);

  const overlayInfo = computed(() =>
    showOverlay.value
      ? synchronousOverlayInfo.value
      : ({ visible: false } as Info)
  );

  const toolStore = useToolStore();
  const noInfoWithoutSelect = computed(() => {
    if (toolStore.currentTool !== Tools.Select)
      return { visible: false } as Info;
    return overlayInfo.value;
  });

  return { overlayInfo: noInfoWithoutSelect, onHover };
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
