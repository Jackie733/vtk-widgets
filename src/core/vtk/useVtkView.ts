import { onVTKEvent } from '@/src/composables/onVTKEvent';
import { Maybe } from '@/src/types';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import vtkOpenGLRenderWindow from '@kitware/vtk.js/Rendering/OpenGL/RenderWindow';
import vtkWidgetManager from '@kitware/vtk.js/Widgets/Core/WidgetManager';
import {
  MaybeRef,
  onScopeDispose,
  unref,
  watchEffect,
  watchPostEffect,
} from 'vue';
import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
import { batchForNextTask } from '@/src/utils/batchForNextTask';
import { useElementSize } from '@vueuse/core';
import { View } from './types';

export function useWebGLRenderWindow(container: MaybeRef<Maybe<HTMLElement>>) {
  const renderWindowView = vtkOpenGLRenderWindow.newInstance();

  watchPostEffect((onCleanup) => {
    const el = unref(container);
    if (!el) return;

    renderWindowView.setContainer(el);
    onCleanup(() => {
      renderWindowView.setContainer(null as unknown as HTMLElement);
    });
  });

  onScopeDispose(() => {
    renderWindowView.delete();
  });

  return renderWindowView;
}

export function useWidgetManager(renderer: vtkRenderer) {
  const manager = vtkWidgetManager.newInstance();
  manager.setRenderer(renderer);

  const updatePickingState = () => {
    const enabled = manager.getPickingEnabled();
    const widgetCount = manager.getWidgets().length;
    if (!enabled && widgetCount) {
      manager.enablePicking();
    } else if (enabled && !widgetCount) {
      manager.disablePicking();
    }
  };

  onVTKEvent(manager, 'onModified', updatePickingState);
  updatePickingState();

  return manager;
}

export function useVtkView(container: MaybeRef<Maybe<HTMLElement>>): View {
  const renderer = vtkRenderer.newInstance();
  const renderWindow = vtkRenderWindow.newInstance();
  renderWindow.addRenderer(renderer);

  const renderWindowView = useWebGLRenderWindow(container);
  renderWindow.addView(renderWindowView);

  onScopeDispose(() => {
    renderWindow.removeView(renderWindowView);
  });

  const interactor = vtkRenderWindowInteractor.newInstance();
  renderWindow.setInteractor(interactor);
  interactor.setView(renderWindowView);

  watchPostEffect((onCleanup) => {
    const el = unref(container);
    if (!el) return;

    interactor.initialize();
    interactor.setContainer(el as HTMLElement);
    onCleanup(() => {
      if (interactor.getContainer()) interactor.setContainer(null);
    });
  });

  const widgetManager = useWidgetManager(renderer);

  const deferredRender = batchForNextTask(() => {
    if (interactor.isAnimating()) return;
    widgetManager.renderWidgets();
    renderWindow.render();
  });

  const immediateRender = () => {
    if (interactor.isAnimating()) return;
    renderWindow.render();
  };

  const requestRender = ({ immediate } = { immediate: false }) => {
    if (immediate) {
      immediateRender();
    }
    deferredRender();
  };

  onVTKEvent(renderer, 'onModified', () => {
    requestRender();
  });

  const setSize = (width: number, height: number) => {
    const scaledWidth = Math.max(1, width * globalThis.devicePixelRatio);
    const scaledHeight = Math.max(1, height * globalThis.devicePixelRatio);
    renderWindowView.setSize(scaledWidth, scaledHeight);
    requestRender({ immediate: true });
  };

  const { width, height } = useElementSize(container);

  watchEffect(() => {
    setSize(width.value, height.value);
  });

  onScopeDispose(() => {
    renderWindow.removeRenderer(renderer);
    renderer.delete();
    renderWindow.delete();
    interactor.delete();
  });

  return {
    renderer,
    renderWindow,
    interactor,
    renderWindowView,
    widgetManager,
    requestRender,
  };
}
