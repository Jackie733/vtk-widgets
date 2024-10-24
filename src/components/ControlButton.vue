<template>
  <div>
    <el-tooltip :content="name" :placement="tooltipLocation">
      <el-button
        size="small"
        :type="active ? 'primary' : 'default'"
        :icon="btnIcon"
        v-bind="$attrs"
      >
      </el-button>
    </el-tooltip>
  </div>
</template>

<script>
import { Sort, Aim, Rank } from '@element-plus/icons-vue';
import { Tools } from '../store/tools/types';

const IconMap = {
  [Tools.WindowLevel]: Sort,
  [Tools.Pan]: Rank,
  [Tools.Crosshairs]: Aim,
};

export default {
  name: 'ToolButton',
  props: {
    icon: { type: String, required: true },
    name: { type: String, required: true },
    active: { type: Boolean, default: false },
    tooltipLocation: { type: String, default: 'bottom' },
  },
  computed: {
    btnIcon() {
      return IconMap[this.icon];
    },
  },
};
</script>
