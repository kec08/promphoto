import type { CapturedPhoto, Frame } from '../types';
import aiIconUrl from '../assets/img/ai_icon.png';

export class PhotoSelection {
  private container: HTMLElement;
  private photos: CapturedPhoto[];
  private frame: Frame;
  private selectedPhotos: CapturedPhoto[] = [];
  private onComplete: (selected: CapturedPhoto[]) => void;

  private dotsInterval: number | null = null;
  private loadingTimeout: number | null = null;

  constructor(
    container: HTMLElement,
    photos: CapturedPhoto[],
    frame: Frame,
    onComplete: (selected: CapturedPhoto[]) => void
  ) {
    this.container = container;
    this.photos = photos;
    this.frame = frame;
    this.onComplete = onComplete;
  }

  render(): void {
    const selectCount = this.frame.type === '3cut' ? 3 : 4;
    const gridPhotos = this.photos.slice(0, 8);

    const previewSlots = Array.from({ length: selectCount })
      .map((_, i) => `<div class="preview-slot" data-slot="${i}"></div>`)
      .join('');

    const gridCells = Array.from({ length: 9 }).map((_, idx) => {
      if (idx === 8) {
        return `
          <div class="photo-cell counter-cell">
            <div class="counter-title">사진을 골라주세요</div>
            <div class="counter-num" id="selection-count-num">0 / ${selectCount}</div>
            <button class="counter-btn" id="confirm-btn" disabled>확인</button>
          </div>
        `;
      }

      const photo = gridPhotos[idx];
      if (!photo) return `<div class="photo-cell empty-cell"></div>`;

      return `
        <button class="photo-cell photo-item" data-photo-id="${photo.id}">
          <img src="${photo.dataUrl}" alt="photo-${idx}" draggable="false" />
          <div class="select-order"></div>
        </button>
      `;
    }).join('');

    this.container.innerHTML = `
      <div class="photo-selection-page">
        <div class="photo-selection-layout">

          <div class="photo-grid" id="photo-grid">
            ${gridCells}
          </div>

          <aside class="preview-panel">
            <div class="preview-strip" id="preview-strip">
              <div class="preview-top">
                <span class="preview-brand">promphoto</span>
                <span class="preview-date">${this.getToday()}</span>
              </div>
              ${previewSlots}
              <div class="preview-footer">promphoto</div>
            </div>
          </aside>

        </div>
      </div>
    `;

    const strip = this.container.querySelector('#preview-strip') as HTMLElement | null;
    if (strip && this.frame.aiUrl) {
      strip.style.backgroundImage = `url(${this.frame.aiUrl})`;
      strip.style.backgroundSize = 'cover';
      strip.style.backgroundPosition = 'center';
      strip.style.backgroundRepeat = 'no-repeat';
      strip.style.backgroundColor = 'transparent';
    }

    // 사진 클릭 바인딩
    const items = this.container.querySelectorAll<HTMLButtonElement>('.photo-item');
    items.forEach((el) => {
      const id = el.dataset.photoId!;
      const photo = this.photos.find(p => p.id === id);
      if (!photo) return;

      el.addEventListener('click', () => {
        this.togglePhotoSelection(photo, el, selectCount);
      });
    });

    // 확인 버튼
    const confirmBtn = this.container.querySelector('#confirm-btn') as HTMLButtonElement;
    confirmBtn.addEventListener('click', () => {
      if (this.selectedPhotos.length !== selectCount) return;
      this.showLoadingAndGoNext(selectCount);
    });

    this.updateSelectionUI(selectCount);
  }

  private showLoadingAndGoNext(selectCount: number) {
    this.cleanupLoadingTimers();

    const preloadPromise = this.preloadAll(this.selectedPhotos.map(p => p.dataUrl));

    this.container.innerHTML = `
      <div class="result-loading-page" style="background:#1C1C1E;">
        <div class="result-loading-inner">
          <div class="result-loading-brand">
            <img class="result-loading-logo" src="${aiIconUrl}" alt="promphoto" />
            <span class="result-loading-title">promphoto</span>
          </div>
          <div class="result-loading-text">
            사진이 나오는 중입니다<span id="loading-dots"></span>
          </div>
        </div>
      </div>
    `;

    const dotsEl = this.container.querySelector('#loading-dots') as HTMLElement;
    let dots = 0;

    this.dotsInterval = window.setInterval(() => {
      dots = (dots + 1) % 4;
      dotsEl.textContent = '.'.repeat(dots);
    }, 450);

    this.loadingTimeout = window.setTimeout(async () => {
      this.cleanupLoadingTimers();
      if (this.selectedPhotos.length !== selectCount) return;

      try { await preloadPromise; } catch { /* empty */ }

      this.onComplete(this.selectedPhotos);
    }, 5000);
  }

  private preloadAll(urls: string[]): Promise<void> {
    return Promise.all(
      urls.map(src => new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = async () => {
          if ('decode' in img) {
            try { await (img as HTMLImageElement).decode(); } catch { /* empty */ }
          }
          resolve();
        };
        img.onerror = () => reject();
        img.src = src;
      }))
    ).then(() => undefined);
  }

  private cleanupLoadingTimers() {
    if (this.dotsInterval !== null) {
      clearInterval(this.dotsInterval);
      this.dotsInterval = null;
    }
    if (this.loadingTimeout !== null) {
      clearTimeout(this.loadingTimeout);
      this.loadingTimeout = null;
    }
  }

  private togglePhotoSelection(
    photo: CapturedPhoto,
    _element: HTMLElement,
    selectCount: number
  ): void {
    const idx = this.selectedPhotos.findIndex(p => p.id === photo.id);

    if (idx >= 0) {
      this.selectedPhotos.splice(idx, 1);
    } else {
      if (this.selectedPhotos.length < selectCount) {
        this.selectedPhotos.push(photo);
      }
    }

    this.updateSelectionUI(selectCount);
  }

  private updateSelectionUI(selectCount: number): void {
    const countNum = this.container.querySelector('#selection-count-num') as HTMLElement;
    const confirmBtn = this.container.querySelector('#confirm-btn') as HTMLButtonElement;

    countNum.textContent = `${this.selectedPhotos.length} / ${selectCount}`;
    confirmBtn.disabled = this.selectedPhotos.length !== selectCount;

    this.container.querySelectorAll<HTMLElement>('.photo-item').forEach(cell => {
      cell.classList.remove('selected');
      const order = cell.querySelector('.select-order') as HTMLElement;
      if (order) order.textContent = '';
    });

    this.selectedPhotos.forEach((photo, orderIdx) => {
      const cell = this.container.querySelector<HTMLElement>(`.photo-item[data-photo-id="${photo.id}"]`);
      if (!cell) return;
      cell.classList.add('selected');
      const orderEl = cell.querySelector('.select-order') as HTMLElement;
      if (orderEl) orderEl.textContent = String(orderIdx + 1);
    });

    const slots = this.container.querySelectorAll<HTMLElement>('.preview-slot');
    slots.forEach((slot, i) => {
      slot.innerHTML = '';
      const p = this.selectedPhotos[i];
      if (p) {
        slot.innerHTML = `<img src="${p.dataUrl}" alt="preview-${i}" draggable="false" />`;
      }
    });
  }

  private getToday(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  }
}
