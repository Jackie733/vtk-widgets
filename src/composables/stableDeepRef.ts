import { computed, ref, Ref } from 'vue';
import deepEqual from 'fast-deep-equal';
import { watchCompare } from '../utils/watchCompare';

// Ensures that a Ref holds a stable reference by deep comparison.
export function stableDeepRef<T>(sourceRef: Ref<T>) {
  const stableRef = ref<T>(sourceRef.value) as Ref<T>;
  watchCompare(
    sourceRef,
    (result) => {
      stableRef.value = result;
    },
    { compare: deepEqual }
  );

  return computed({
    get: () => stableRef.value,
    set: (v) => {
      // eslint-disable-next-line no-param-reassign
      sourceRef.value = v;
    },
  });
}
