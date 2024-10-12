import { TOOL_COLORS } from '@/src/config';
import { ref } from 'vue';
import { Maybe } from '@/src/types';
import { StoreActions, StoreState } from 'pinia';
import { useIdStore } from '../id';

const labelDefault = Object.freeze({
  labelName: 'New Label' as string,
  color: TOOL_COLORS[0] as string,
});

export type Label<Props> = Partial<Props & typeof labelDefault>;
export type Labels<Props> = Record<string, Label<Props>>;

type LabelID = string;

// param newLabelDefault should contain all label controlled props
// of the tool so placing tool does hold any last active label props.
export const useLabels = <Props>(newLabelDefault: Props) => {
  type ToolLabel = Label<Props>;
  type ToolLabels = Labels<Props>;

  const labels = ref<ToolLabels>({});

  const activeLabel = ref<string | undefined>();
  const setActiveLabel = (id: string) => {
    activeLabel.value = id;
  };

  let nextToolColorIndex = 0;

  const addLabel = (label: ToolLabel = {}) => {
    const id = useIdStore().nextId();
    labels.value[id] = {
      ...labelDefault,
      ...newLabelDefault,
      color: TOOL_COLORS[nextToolColorIndex],
      ...label,
    };

    nextToolColorIndex = (nextToolColorIndex + 1) % TOOL_COLORS.length;

    setActiveLabel(id);
    return id;
  };

  const deleteLabel = (id: LabelID) => {
    if (!(id in labels.value)) throw new Error('Label not found');

    delete labels.value[id];
    labels.value = { ...labels.value }; // trigger reactive update for measurement list

    if (id === activeLabel.value) {
      const labelIDs = Object.keys(labels.value);
      if (labelIDs.length !== 0) setActiveLabel(labelIDs[0]);
      else setActiveLabel('');
    }
  };

  const updateLabel = (id: LabelID, patch: ToolLabel) => {
    if (!(id in labels.value)) throw new Error('Label does not exist');

    labels.value = { ...labels.value, [id]: { ...labels.value[id], ...patch } };
  };

  // Flag to indicate if should clear existing labels
  const defaultLabels = ref(true);

  const clearDefaultLabels = () => {
    if (defaultLabels.value) labels.value = {};
    defaultLabels.value = false;
  };

  const findLabel = (name: Maybe<string>) => {
    return Object.entries(labels.value).find(
      ([, { labelName }]) => name === labelName
    );
  };

  const mergeLabel = (label: ToolLabel) => {
    const { labelName } = label;
    const matchingName = findLabel(labelName);

    if (matchingName) {
      const [existingID] = matchingName;
      updateLabel(existingID, label);
      return existingID;
    }

    return addLabel(label);
  };

  const mergeLabels = (newLabels: Maybe<ToolLabels>) => {
    Object.entries(newLabels ?? {}).forEach(([labelName, props]) =>
      mergeLabel({ ...props, labelName })
    );
  };

  return {
    labels,
    activeLabel,
    setActiveLabel,
    addLabel,
    deleteLabel,
    updateLabel,
    clearDefaultLabels,
    mergeLabel,
    mergeLabels,
  };
};

type UseLabels<Tool> = ReturnType<typeof useLabels<Tool>>;

export type LabelsStore<Tool> = StoreState<UseLabels<Tool>> &
  StoreActions<UseLabels<Tool>>;
