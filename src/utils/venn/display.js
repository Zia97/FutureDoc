export function fitVennCanvasToWidth(canvas, widthPx, scale = 1) {
  let width = canvas.width;
  let height = canvas.height;

  if (Number.isFinite(widthPx) && widthPx > 0 && width > widthPx) {
    const fitScale = widthPx / width;
    width = widthPx;
    height *= fitScale;
  } else if (widthPx == null) {
    width *= scale;
    height *= scale;
  }

  return { width, height };
}
