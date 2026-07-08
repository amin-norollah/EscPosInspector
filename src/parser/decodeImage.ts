import { DEFAULT_PAPER_WIDTH } from './utils';
import type { ImageCommand } from '@/types/escpos';

// escpos images are 1 bit per pixel (just black or white). here we blow that
// up into a normal rgba png so the browser can show it. every bit becomes one
// pixel: 1 means black dot, 0 means white paper.
export function rasterToDataUrl(
  data: Uint8Array,
  width: number,
  height: number,
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const imageData = ctx.createImageData(width, height);
  let src = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // find which byte holds this pixel and which bit inside that byte.
      const byteIndex = Math.floor(x / 8);
      const bitIndex = 7 - (x % 8);
      const on = byteIndex < data.length && ((data[src + byteIndex]! >> bitIndex) & 1) === 1;
      const dst = (y * width + x) * 4;
      const color = on ? 0 : 255;
      imageData.data[dst] = color;
      imageData.data[dst + 1] = color;
      imageData.data[dst + 2] = color;
      imageData.data[dst + 3] = 255;
    }
    src += Math.ceil(width / 8);
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

export function decodeEscStarImage(
  mode: number,
  widthBytes: number,
  height: number,
  data: Uint8Array,
): Pick<ImageCommand, 'width' | 'height' | 'imageSize' | 'imageDataUrl' | 'mode'> {
  const width = widthBytes * 8;
  const modeLabel =
    mode === 0 ? '8-dot single density' : mode === 1 ? '8-dot double density' : mode === 32 ? '24-dot single density' : mode === 33 ? '24-dot double density' : `mode ${mode}`;

  return {
    width,
    height,
    imageSize: data.length,
    imageDataUrl: rasterToDataUrl(data, width, height),
    mode: `ESC * ${modeLabel}`,
  };
}

export function decodeGsV0Image(
  mode: number,
  width: number,
  height: number,
  data: Uint8Array,
): Pick<ImageCommand, 'width' | 'height' | 'imageSize' | 'imageDataUrl' | 'mode'> {
  const modeLabels: Record<number, string> = {
    0: 'normal',
    1: 'double width',
    2: 'double height',
    3: 'quadruple',
  };

  return {
    width,
    height,
    imageSize: data.length,
    imageDataUrl: rasterToDataUrl(data, width, height),
    mode: `GS v 0 (${modeLabels[mode] ?? `mode ${mode}`})`,
  };
}

// most thermal printers are 58mm or 80mm wide, which is around 384 or 512
// dots. we just snap the image width up to the nearest common size so the
// preview does not look too tiny or too big.
export function estimatePaperWidthFromImage(width: number): number {
  if (width <= 0) return DEFAULT_PAPER_WIDTH;
  if (width <= 256) return 256;
  if (width <= 384) return 384;
  if (width <= 512) return 512;
  return width;
}
