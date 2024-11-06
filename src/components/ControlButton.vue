<template>
  <v-btn
    size="small"
    variant="text"
    dark
    :height="sizeV"
    :width="sizeV"
    :min-height="sizeV"
    :max-height="sizeV"
    :min-width="sizeV"
    :max-width="sizeV"
    :class="classV"
    v-bind="$attrs"
  >
    <v-icon :size="iconSize">{{ icon }}</v-icon>
    <v-tooltip
      activator="parent"
      :location="tooltipLocation"
      transition="slide-y-transition"
    >
      <span>{{ name }}</span>
    </v-tooltip>
  </v-btn>
</template>

<script>
export default {
  name: 'ToolButton',
  props: {
    icon: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: [Number, String], default: 38 },
    buttonClass: [String, Array, Object],
    tooltipLocation: { type: String, default: 'bottom' },
  },
  computed: {
    sizeV() {
      return Number(this.size);
    },
    iconSize() {
      return Math.floor(0.6 * this.sizeV);
    },
    classV() {
      const classSpec = this.buttonClass;
      if (typeof classSpec === 'string') {
        return classSpec;
      }
      if (Array.isArray(classSpec)) {
        return classSpec.join(' ');
      }
      if (classSpec && Object.keys(classSpec).length) {
        return Object.keys(this.buttonClass)
          .filter((key) => this.buttonClass[key])
          .join(' ');
      }
      return '';
    },
  },
};
</script>
