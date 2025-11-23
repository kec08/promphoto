// src/components/PhotoEdit.tsx
import type { CapturedPhoto, Frame, PhotoEditOptions } from '../types';
import { FrameService } from '../services/FrameService';

export class PhotoEdit {
  private container: HTMLElement;
  private photos: CapturedPhoto[];
  private frame: Frame;
  private frameService: FrameService;

  private editOptions: PhotoEditOptions = {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    blur: 0
  };

  private onComplete: () => void;
  private loaded = false;

  constructor(
    container: HTMLElement,
    photos: CapturedPhoto[],
    frame: Frame,
    frameService: FrameService,
    onComplete: () => void
  ) {
    this.container = container;
    this.photos = photos;
    this.frame = frame;
    this.frameService = frameService;
    this.onComplete = onComplete;
  }

  render(): void {
    this.container.innerHTML = `
      <div class="photo-edit-page">
        <div class="photo-edit-layout">
          
          <aside class="edit-preview-panel">
            <div class="edit-preview-strip">
              <div class="edit-preview-top">
                <span class="edit-preview-brand">promphoto</span>
                <span class="edit-preview-date">${this.getToday()}</span>
              </div>
              <canvas id="preview-canvas"></canvas>
              <div class="edit-preview-footer">promphoto</div>
            </div>
          </aside>

          <section class="edit-controls">
            <h3>보정 옵션</h3>

            <div class="control-group">
              <label>밝기</label>
              <input type="range" id="brightness" min="-100" max="100" value="0">
              <span id="brightness-value">0</span>
            </div>

            <div class="control-group">
              <label>명암</label>
              <input type="range" id="contrast" min="-100" max="100" value="0">
              <span id="contrast-value">0</span>
            </div>

            <div class="control-group">
              <label>채도</label>
              <input type="range" id="saturation" min="-100" max="100" value="0">
              <span id="saturation-value">0</span>
            </div>

            <div class="button-group">
              <button id="reset-btn" class="reset-btn">초기화</button>
              <button id="download-btn" class="download-btn">다운로드</button>
            </div>
          </section>

        </div>
      </div>
    `;

    this.setupEventListeners();
    this.drawPreview();
    window.addEventListener('resize', () => this.drawPreview());
  }

  private setupEventListeners(): void {
    const controls = ['brightness', 'contrast', 'saturation'] as const;

    controls.forEach(control => {
      const input = this.container.querySelector(`#${control}`) as HTMLInputElement;
      const valueSpan = this.container.querySelector(`#${control}-value`) as HTMLElement;

      input?.addEventListener('input', () => {
        const value = parseInt(input.value, 10);
        valueSpan.textContent = String(value);
        this.editOptions[control] = value;
        this.drawPreview();
      });
    });

    const resetBtn = this.container.querySelector('#reset-btn') as HTMLButtonElement;
    resetBtn?.addEventListener('click', () => this.resetFilters());

    const downloadBtn = this.container.querySelector('#download-btn') as HTMLButtonElement;
    downloadBtn?.addEventListener('click', () => this.downloadFinal());
  }

  private async ensureImagesLoaded() {
    if (this.loaded) return;

    await Promise.all(
      this.photos.map(p => new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = p.dataUrl;
      }))
    );

    this.loaded = true;
  }

  private getCssFilter(): string {
    const b = 100 + this.editOptions.brightness;
    const c = 100 + this.editOptions.contrast;
    const s = 100 + this.editOptions.saturation;
    return `brightness(${b}%) contrast(${c}%) saturate(${s}%)`;
  }

  private drawPreview = async (): Promise<void> => {
    const canvas = this.container.querySelector('#preview-canvas') as HTMLCanvasElement;
    const strip  = this.container.querySelector('.edit-preview-strip') as HTMLElement;
    if (!canvas || !strip) return;

    await this.ensureImagesLoaded();

    const dpr = window.devicePixelRatio || 1;

    const stripStyle = window.getComputedStyle(strip);
    const padX = parseFloat(stripStyle.paddingLeft) + parseFloat(stripStyle.paddingRight);
    const padY = parseFloat(stripStyle.paddingTop) + parseFloat(stripStyle.paddingBottom);
    const gap = parseFloat(stripStyle.rowGap || stripStyle.gap || "0");

    const topEl = strip.querySelector('.edit-preview-top') as HTMLElement;
    const footerEl = strip.querySelector('.edit-preview-footer') as HTMLElement;
    const topH = topEl?.offsetHeight ?? 0;
    const footerH = footerEl?.offsetHeight ?? 0;

    const availW = strip.clientWidth - padX;
    const availH = strip.clientHeight - padY - topH - footerH - gap * 2;

    let cssW = availW;
    let cssH = cssW * (16 / 9);
    if (cssH > availH) {
      cssH = availH;
      cssW = cssH * (9 / 16);
    }

    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width  = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, cssW, cssH);
    

    if (this.frame.type === '4cut' || this.frame.type === '3cut') {
  const count = this.frame.type === '3cut' ? 3 : 4;
  // 프리뷰는 DOM에 이미 상/하단 바가 있으니까 bars=false
  await this.drawVerticalStrip(ctx, cssW, cssH, count);
} else {
  ctx.save();
  ctx.filter = this.getCssFilter();
  this.frameService.drawFrame(
    canvas,
    this.photos.map(p => p.dataUrl),
    this.frame
  );
  ctx.restore();
}
  };

private async drawVerticalStrip(
ctx: CanvasRenderingContext2D, w: number, h: number, count: number) {
    const slotGap = 12;
    const pad = 8;
    const border = 2;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    const innerX = pad;
    const innerY = pad;
    const innerW = w - pad * 2;
    const innerH = h - pad * 2;

    // 슬롯 계산
    const totalGap = slotGap * (count - 1);

    const scaleY = 1.03;

    const baseSlotH = (innerH - totalGap) / count;
    const slotH = baseSlotH * scaleY;

    const slotW = innerW;

    for (let i = 0; i < count; i++) {
      const imgUrl = this.photos[i]?.dataUrl;
      const x = innerX;
      const y = innerY + i * (slotH + slotGap);

      ctx.save();
      ctx.filter = 'none';
      ctx.fillStyle = '#fff';
      ctx.fillRect(x, y, slotW, slotH);

      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = border;
      ctx.strokeRect(x + border/2, y + border/2, slotW - border, slotH - border);
      ctx.restore();

      if (!imgUrl) continue;

      const img = await this.loadImage(imgUrl);

      ctx.save();
      ctx.filter = this.getCssFilter();
      this.drawImageCover(ctx, img, x, y, slotW, slotH);
      ctx.restore();
    }
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  private drawImageCover(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    if (!iw || !ih) return;

    const scale = Math.max(w / iw, h / ih);
    const sw = w / scale;
    const sh = h / scale;

    const sx = (iw - sw) / 2;
    const sy = (ih - sh) / 2;

    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  private resetFilters(): void {
    this.editOptions = {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0,
      blur: 0
    };

    (['brightness', 'contrast', 'saturation'] as const).forEach(control => {
      const input = this.container.querySelector(`#${control}`) as HTMLInputElement;
      const valueSpan = this.container.querySelector(`#${control}-value`) as HTMLElement;
      if (input) input.value = '0';
      if (valueSpan) valueSpan.textContent = '0';
    });

    this.drawPreview();
  }

private async downloadFinal(): Promise<void> {
    await this.ensureImagesLoaded();
  
    const previewCanvas = this.container.querySelector('#preview-canvas') as HTMLCanvasElement;
    if (!previewCanvas) return;
  
    const cssW = previewCanvas.clientWidth;
    const cssH = previewCanvas.clientHeight;
  
    const dpr = 2;
  
    const barH = Math.round(cssH * 0.08); // 상/하단 바 높이(원하면 0.08~0.1 사이로 조절)
    const outCssH = cssH + barH * 2;
  
    const out = document.createElement('canvas');
    out.width = Math.floor(cssW * dpr);
    out.height = Math.floor(outCssH * dpr);
  
    const ctx = out.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, cssW, outCssH);
  
    if (this.frame.type === '4cut' || this.frame.type === '3cut') {
      const count = this.frame.type === '3cut' ? 3 : 4;
  
      this.drawTopBar(ctx, cssW, barH);

      ctx.save();
      const overlap = 5;
      ctx.translate(0, barH - overlap);
      await this.drawVerticalStrip(ctx, cssW, cssH, count);
      ctx.restore();
  
      this.drawBottomBar(ctx, cssW, outCssH, barH);
  
    } else {
      ctx.save();
      ctx.filter = this.getCssFilter();
      this.frameService.drawFrame(
        out,
        this.photos.map(p => p.dataUrl),
        this.frame
      );
      ctx.restore();
    }
  
    const link = document.createElement('a');
    link.href = out.toDataURL('image/jpeg', 0.95);
    link.download = `promphoto-${Date.now()}.jpg`;
    link.click();
  
    this.onComplete();
  }
  
  private drawTopBar(ctx: CanvasRenderingContext2D, w: number, barH: number) {
    ctx.save();
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, barH);
  
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.round(barH * 0.24)}px sans-serif`;
  
    ctx.fillText('promphoto', 18, barH / 2);
  
    const date = this.getToday();
    const dateW = ctx.measureText(date).width;
    ctx.fillText(date, w - 18 - dateW, barH / 2);
  
    ctx.restore();
  }
  
  private drawBottomBar(ctx: CanvasRenderingContext2D, w: number, outH: number, barH: number) {
    ctx.save();
    const y = outH - barH;
  
    ctx.fillStyle = '#000';
    ctx.fillRect(0, y, w, barH);
  
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.round(barH * 0.25)}px sans-serif`;
  
    const brand = 'promphoto';
    const brandW = ctx.measureText(brand).width;
    ctx.fillText(brand, (w - brandW) / 2, y + barH / 2);
  
    ctx.restore();
  }

  private getToday(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  }
}
