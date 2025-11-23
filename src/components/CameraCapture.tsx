import type { CapturedPhoto } from '../types';
import { CameraService } from '../services/CameraService';

export class CameraCapture {
  private container: HTMLElement;
  private cameraService: CameraService;
  private onCaptureComplete: (photos: CapturedPhoto[]) => void;
  private capturedPhotos: CapturedPhoto[] = [];
  private totalPhotos = 8;
  private currentCount = 0;

  constructor(
    container: HTMLElement,
    cameraService: CameraService,
    onCaptureComplete: (photos: CapturedPhoto[]) => void
  ) {
    this.container = container;
    this.cameraService = cameraService;
    this.onCaptureComplete = onCaptureComplete;
  }

  async render(): Promise<void> {
    this.container.innerHTML = `
      <div class="camera-capture-page">
        <div class="camera-stage">

          <div class="stage-side stage-left">
            <div class="stage-count" id="stage-number">01</div>
          </div>

          <div class="stage-center">
            <video id="camera-video" autoplay playsinline></video>
            <canvas id="capture-canvas" style="display:none;"></canvas>

            <div class="countdown" id="countdown"></div>

            <div class="stage-instruction" id="capture-status">
              카메라를 보고 원하는 포즈를 취해보세요!
            </div>
          </div>

          <div class="stage-side stage-right">
            <div class="stage-right-label">촬영 횟수</div>
            <div class="stage-right-count" id="photo-count">1/8</div>
          </div>

        </div>
      </div>
    `;

    const video = this.container.querySelector('#camera-video') as HTMLVideoElement;
    await this.cameraService.startCamera(video);

    await this.capturePhotos();
  }

  private async capturePhotos(): Promise<void> {
    for (let i = 0; i < this.totalPhotos; i++) {
      this.updateStageIndex(i);
      await this.countdownAndCapture(i);
    }

    this.cameraService.stopCamera();
    this.onCaptureComplete(this.capturedPhotos);
  }

  private updateStageIndex(i: number) {
    const stageNum = this.container.querySelector('#stage-number') as HTMLElement;
    const rightCount = this.container.querySelector('#photo-count') as HTMLElement;

    const idx = i + 1;
    stageNum.textContent = String(idx).padStart(2, '0');
    rightCount.textContent = `${idx}/${this.totalPhotos}`;
  }

  private countdownAndCapture(index: number): Promise<void> {
    return new Promise((resolve) => {
      let countdown = 5; // ✅ 5초로 변경
      const countdownElement = this.container.querySelector('#countdown') as HTMLElement;
      const statusElement = this.container.querySelector('#capture-status') as HTMLElement;

      statusElement.textContent = '카메라를 보고 원하는 포즈를 취해보세요!';

      const interval = setInterval(() => {
        if (countdown > 0) {
          countdownElement.textContent = countdown.toString();
          countdownElement.style.opacity = '1';
          countdown--;
        } else {
          clearInterval(interval);
          countdownElement.style.opacity = '0';
          statusElement.textContent = '촬영 중...';

          this.capturePhoto(index);

          setTimeout(() => {
            statusElement.textContent = '다음 포즈를 준비하세요!';
            resolve();
          }, 500);
        }
      }, 1000);
    });
  }

  private capturePhoto(index: number): void {
    const canvas = this.container.querySelector('#capture-canvas') as HTMLCanvasElement;
    canvas.width = 1280;
    canvas.height = 720;

    const dataUrl = this.cameraService.capturePhoto(canvas);
    this.capturedPhotos.push({
        id: `photo-${index}`,
        timestamp: Date.now(),
        dataUrl,
        url: ''
    });

    this.currentCount++;
  }
}
