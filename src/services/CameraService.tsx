export class CameraService {
    private stream: MediaStream | null = null;
    private video: HTMLVideoElement | null = null;
  
    async startCamera(videoElement: HTMLVideoElement): Promise<void> {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: false
        });
        
        videoElement.srcObject = this.stream;
        this.video = videoElement;
        
        return new Promise((resolve) => {
          videoElement.onloadedmetadata = () => {
            videoElement.play();
            resolve();
          };
        });
      } catch (error) {
        console.error('카메라 접근 실패:', error);
        throw error;
      }
    }
  
    stopCamera(): void {
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }
    }
  
    capturePhoto(canvas: HTMLCanvasElement): string {
      if (!this.video) throw new Error('비디오 요소가 없습니다');
      
      const context = canvas.getContext('2d');
      if (!context) throw new Error('캔버스 컨텍스트를 가져올 수 없습니다');
      
      context.drawImage(this.video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.95);
    }
  }
  