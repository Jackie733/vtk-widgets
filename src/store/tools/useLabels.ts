import { TOOL_COLORS } from '@/src/config';
import { ref } from 'vue';
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
  };
};
