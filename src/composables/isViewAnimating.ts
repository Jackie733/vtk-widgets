import { ref } from 'vue';
import { View } from '../core/vtk/types';
import { onVTKEvent } from './onVTKEvent';

export function isViewAnimating(view: View) {
  const isAnimating = ref(false);

  onVTKEvent(view.interactor, 'onStartAnimation', () => {
    isAnimating.value = true;
  });
  onVTKEvent(view.interactor, 'onEndAnimation', () => {
    isAnimating.value = false;
  });

  return isAnimating;
}
