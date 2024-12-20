import { computed, MaybeRef, Ref, unref } from 'vue';
import vtkCamera from '@kitware/vtk.js/Rendering/Core/Camera';
import { syncRef } from '@vueuse/core';
import { Maybe } from '../types';
import useViewCameraStore from '../store/view-configs/camera';
import { guardedWritableRef } from '../utils/guardedWritableRef';
import { vtkFieldRef } from '../core/vtk/vtkFieldRef';

export function usePersistCameraConfig(
  viewID: MaybeRef<string>,
  dataID: MaybeRef<Maybe<string>>,
  camera: MaybeRef<vtkCamera>
) {
  const viewCameraStore = useViewCameraStore();

  const keys = [
    'position',
    'focalPoint',
    'viewUp',
    'parallelScale',
    'directionOfProjection',
  ] as const;
  type KeyType = (typeof keys)[number];

  const cameraRefs = keys.reduce(
    (refs, key) => ({
      ...refs,
      [key]: guardedWritableRef(
        vtkFieldRef(camera, key),
        (incoming) => !!incoming
      ),
    }),
    {} as Record<KeyType, Ref<any>>
  );

  const config = computed(() =>
    viewCameraStore.getConfig(unref(viewID), unref(dataID))
  );

  const configRefs = keys.reduce(
    (refs, key) => ({
      ...refs,
      [key]: computed({
        get: () => config.value?.[key],
        set: (v) => {
          const viewIDVal = unref(viewID);
          const dataIDVal = unref(dataID);
          if (!viewIDVal || !dataIDVal) return;
          viewCameraStore.updateConfig(viewIDVal, dataIDVal, { [key]: v });
          if (viewCameraStore.isSync()) {
            viewCameraStore.updateSyncConfigs();
          }
        },
      }),
    }),
    {} as Record<KeyType, Ref<any>>
  );

  keys.forEach((key) => {
    syncRef(configRefs[key], cameraRefs[key]);
  });
}
