import { getImage, type DataSelection } from '@/src/utils/dataSelection';
import vtkBoundingBox from '@kitware/vtk.js/Common/DataModel/BoundingBox';
import vtkImageData from '@kitware/vtk.js/Common/DataModel/ImageData';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ensureSameSpace } from '../io/resample/resample';
import { useErrorMessage } from '../composables/useErrorMessage';
import { Maybe } from '../types';
import { Manifest, StateFile } from '../io/state-file/schema';

export type Layer = {
  selection: DataSelection;
  id: string;
};

export const useLayersStore = defineStore('layer', () => {
  type _This = ReturnType<typeof useLayersStore>;

  const parentToLayers = ref<Record<string, Layer[]>>({});
  const layerImages = ref<Record<string, vtkImageData>>({});

  async function _addLayer(
    this: _This,
    parent: DataSelection,
    source: DataSelection
  ) {
    if (!parent) {
      throw new Error('Tried to addLayer without parent data selection');
    }

    const id = `${parent}::${source}` as string;
    this.parentToLayers[parent] = [
      ...(this.parentToLayers[parent] ?? []),
      { selection: source, id } as Layer,
    ];

    const [parentImage, sourceImage] = await Promise.all(
      [parent, source].map(getImage)
    );

    if (!sourceImage) {
      throw new Error('Failed to load layer image');
    }
    if (
      !vtkBoundingBox.intersects(
        parentImage.getBounds(),
        sourceImage.getBounds()
      )
    ) {
      this.deleteLayer(parent, source);
      throw new Error(
        'Image bounds do not intersect, so no overlap in physical space'
      );
    }

    const image = await ensureSameSpace(parentImage, sourceImage);

    this.layerImages[id] = image;
  }

  async function addLayer(
    this: _This,
    parent: DataSelection,
    source: DataSelection
  ) {
    return useErrorMessage('Failed to build layer', async () => {
      try {
        await this._addLayer(parent, source);
      } catch (err) {
        this.parentToLayers[parent] = this.parentToLayers[parent]?.filter(
          ({ selection }) => selection !== source
        );
        throw err;
      }
    });
  }

  function deleteLayer(
    this: _This,
    parent: DataSelection,
    source: DataSelection
  ) {
    if (!parent) {
      throw new Error('Tried to deleteLayer without parent data selection');
    }

    const layers = this.parentToLayers[parent] ?? [];

    const layerToDelete = layers.find(({ selection }) => selection === source);
    if (!layerToDelete) return;

    this.parentToLayers[parent] = layers.filter(
      (layer) => layer !== layerToDelete
    );

    delete this.layerImages[layerToDelete.id];
  }

  const remove = (selectionToRemove: DataSelection) => {
    const layerStore = useLayersStore();
    // delete as parent
    layerStore
      .getLayers(selectionToRemove)
      .forEach(({ selection }) => layerStore.deleteLayer(selection, selection));
    // delete from layer lists
    Object.keys(layerStore.parentToLayers).forEach((parent) =>
      layerStore.deleteLayer(parent, selectionToRemove)
    );
  };

  function getLayers(key: Maybe<DataSelection>) {
    if (!key) return [];
    return parentToLayers.value[key] ?? [];
  }

  const getLayer = (layerID: string) =>
    Object.values(parentToLayers.value)
      .flat()
      .flat()
      .find(({ id }) => id === layerID);

  function serialize(this: _This, state: StateFile) {
    state.manifest.parentToLayers = Object.entries(this.parentToLayers).map(
      ([selectionKey, layers]) => ({
        selectionKey,
        sourceSelectionKeys: layers.map(({ selection }) => selection),
      })
    );
  }

  function deserialize(
    this: _This,
    manifest: Manifest,
    dataIDMap: Record<string, string>
  ) {
    const remapSelection = (selection: DataSelection) => {
      return dataIDMap[selection];
    };

    const { parentToLayers: parentToLayersSerialized } = manifest;
    parentToLayersSerialized.forEach(
      ({ selectionKey, sourceSelectionKeys }) => {
        const parent = remapSelection(selectionKey);
        sourceSelectionKeys.forEach((sourceKey) => {
          const source = remapSelection(sourceKey);
          this.addLayer(parent, source);
        });
      }
    );
  }

  return {
    parentToLayers,
    layerImages,
    _addLayer,
    addLayer,
    deleteLayer,
    remove,
    getLayers,
    getLayer,
    serialize,
    deserialize,
  };
});
