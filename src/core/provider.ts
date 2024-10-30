import PaintTool from './tools/paint';

export function CorePiniaProviderPlugin({
  paint,
}: {
  paint?: PaintTool;
} = {}) {
  const dependencies = {
    $paint: paint ?? new PaintTool(),
  };
  return () => dependencies;
}
