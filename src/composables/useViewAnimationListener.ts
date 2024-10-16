import { MaybeRef } from 'vue';
import { Maybe } from '../types';
import { View } from '../core/vtk/types';

export function useViewAnimationListener(
  view: MaybeRef<Maybe<View>>,
  viewId: MaybeRef<string>,
  viewType: MaybeRef<string>
) {}
