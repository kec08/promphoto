export class CameraGuidance {
    private container: HTMLElement;
    private onReady: () => void;
  
    constructor(container: HTMLElement, onReady: () => void) {
      this.container = container;
      this.onReady = onReady;
    }
  
    render(): void {
      this.container.innerHTML = `
        <div class="camera-guidance-v2">
  
          <p class="cg-line cg-line-1">
            촬영이 곧 시작됩니다.
          </p>
  
          <p class="cg-line cg-line-2">
            <span class="bold">원하는 포즈</span>를 생각하며 준비 해주세요
          </p>
  
          <p class="cg-line cg-line-3">
            촬영 횟수는 <span class="bold">총 8회 입니다.</span>
          </p>
  
          <button class="cg-start-btn">준비 완료</button>
        </div>
      `;
  
      const btn = this.container.querySelector(".cg-start-btn");
      btn?.addEventListener("click", () => this.onReady());
    }
  }
  