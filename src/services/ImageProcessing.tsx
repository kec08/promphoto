import type { PhotoEditOptions } from '../types';

export class ImageProcessing {
  static applyFilters(
    imageData: ImageData,
    options: PhotoEditOptions
  ): ImageData {
    const data = imageData.data;
    const brightness = options.brightness ?? 0;
    const contrast = options.contrast ?? 0;
    const saturation = options.saturation ?? 0;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // 밝기 조절
      r = Math.min(255, r + brightness);
      g = Math.min(255, g + brightness);
      b = Math.min(255, b + brightness);

      // 명암 조절
      if (contrast !== 0) {
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        r = Math.min(255, factor * (r - 128) + 128);
        g = Math.min(255, factor * (g - 128) + 128);
        b = Math.min(255, factor * (b - 128) + 128);
      }

      // 채도 조절
      if (saturation !== 0) {
        const gray = r * 0.299 + g * 0.587 + b * 0.114;
        const factor = saturation / 100 + 1;
        r = Math.min(255, gray + (r - gray) * factor);
        g = Math.min(255, gray + (g - gray) * factor);
        b = Math.min(255, gray + (b - gray) * factor);
      }

      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }

    return imageData;
  }
}