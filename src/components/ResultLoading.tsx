export class ResultLoading {
  private container: HTMLElement;
  private onDone: () => void;
  private intervalId: number | null = null;
  private timeoutId: number | null = null;

  constructor(container: HTMLElement, onDone: () => void) {
    this.container = container;
    this.onDone = onDone;
  }

  render(): void {
    this.container.innerHTML = `
      <div class="result-loading-page">
        <div class="result-loading-inner">
          <div class="result-loading-brand">
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
    this.intervalId = window.setInterval(() => {
      dots = (dots + 1) % 4;
      dotsEl.textContent = '.'.repeat(dots);
    }, 500);

    this.timeoutId = window.setTimeout(() => {
      this.cleanup();
      this.onDone();
    }, 5000);
  }

  private cleanup() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  destroy(): void {
    this.cleanup();
    this.container.innerHTML = '';
  }
}
