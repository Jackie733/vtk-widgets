import { MaybeRef, computed, unref, watchEffect } from 'vue';
import { storeToRefs } from 'pinia';
import { Maybe } from '../types';
import { View } from '../core/vtk/types';
import useViewAnimationStore, {
  matchesViewFilter,
} from '../store/view-animation';

export function useViewAnimationListener(
  view: MaybeRef<Maybe<View>>,
  viewId: MaybeRef<string>,
  viewType: MaybeRef<string>
) {
  const store = useViewAnimationStore();
  const { animating, viewFilter } = storeToRefs(store);
  const canAnimate = computed(() =>
    matchesViewFilter(unref(viewId), unref(viewType), viewFilter.value)
  );

  let requested = false;

  watchEffect(() => {
    const viewVal = unref(view);
    if (!viewVal) return;

    if (!animating.value) {
      viewVal.interactor.cancelAnimation(store);
      requested = false;
    } else if (!requested && canAnimate.value) {
      viewVal.interactor.requestAnimation(store);
      requested = true;
    }
  });
}
