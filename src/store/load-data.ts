import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { Maybe } from '../types';

export function useLoading() {
  const loadingCount = ref(0);
  const loadingError = ref<Maybe<Error>>();

  const startLoading = () => {
    loadingCount.value += 1;
  };

  const stopLoading = () => {
    if (loadingCount.value === 0) return;
    loadingCount.value -= 1;
  };

  const setError = (err: Error) => {
    loadingError.value = err;
  };

  const isLoading = computed(() => {
    return loadingCount.value > 0;
  });

  return {
    isLoading,
    startLoading,
    stopLoading,
    setError,
  };
}
const useLoadDataStore = defineStore('loadData', () => {
  const { startLoading, stopLoading, setError, isLoading } = useLoading();

  const segmentGroupExtension = ref('');

  return {
    segmentGroupExtension,
    isLoading,
    startLoading,
    stopLoading,
    setError,
  };
});

export default useLoadDataStore;
