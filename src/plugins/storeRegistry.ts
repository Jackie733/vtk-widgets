import { PiniaPluginContext, StoreGeneric } from 'pinia';

const stores = new Map<string, StoreGeneric>();

export function getPiniaStore(id: string) {
  return stores.get(id);
}

export function storeRegistry(context: PiniaPluginContext) {
  const { store } = context;
  stores.set(store.$id, store);
}
