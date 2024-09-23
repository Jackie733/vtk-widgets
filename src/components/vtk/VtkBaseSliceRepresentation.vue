<script setup lang="ts">
import { Maybe } from '@/src/types';
import { LPSAxis } from '@/src/types/lps';
import { inject, toRefs } from 'vue';
import { useImage } from '@/src/composables/useCurrentImage';
import { VtkViewContext } from './context';

interface Props {
  viewId: string;
  imageId: Maybe<string>;
  axis: LPSAxis;
}

const props = defineProps<Props>();
const { viewId: viewID, imageId: imageID, axis } = toRefs(props);

const view = inject(VtkViewContext);
if (!view) throw new Error('No VtkView');

const { metadata: imageMetadata, imageData } = useImage(imageID);
</script>

<template>
  <slot></slot>
</template>
