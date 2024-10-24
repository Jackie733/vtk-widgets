import { MaybeRef, unref } from 'vue';
import { AnnotationTool } from '../types/annotation-tool';
import { LPSAxis } from '../types/lps';
import { ImageMetadata } from '../types/image';
import { frameOfReferenceToImageSliceAndAxis } from '../utils/frameOfReference';

export const doesToolFrameMatchViewAxis = <Tool extends AnnotationTool>(
  viewAxis: MaybeRef<LPSAxis>,
  tool: Partial<Tool>,
  imageMetadata: MaybeRef<ImageMetadata>
) => {
  if (!tool.frameOfReference) return false;

  const toolAxis = frameOfReferenceToImageSliceAndAxis(
    tool.frameOfReference,
    unref(imageMetadata),
    {
      allowOutOfBoundsSlice: true,
    }
  );
  return !!toolAxis && toolAxis.axis === unref(viewAxis);
};
