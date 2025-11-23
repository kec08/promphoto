import type { Frame } from "../types";

export class FrameService {
    private frames: Frame[] = [
      {
        id: '3cut-1',
        name: '클래식 3컷',
        type: '3cut',
        thumbnail: 'https://via.placeholder.com/100x150?text=3cut',
        description: '전통적인 3장 프레임'
      },
      {
        id: '3cut-2',
        name: '미니멀 3컷',
        type: '3cut',
        thumbnail: 'https://via.placeholder.com/100x150?text=x3cut2',
        description: '심플한 3장 프레임'
      },
      {
        id: '4cut-1',
        name: '클래식 4컷',
        type: '4cut',
        thumbnail: 'https://via.placeholder.com/100x120?text=4cut',
        description: '전통적인 4장 프레임'
      },
      {
        id: '4cut-2',
        name: '감성 4컷',
        type: '4cut',
        thumbnail: 'https://via.placeholder.com/100x120?text=4cut2',
        description: '감성적인 4장 프레임'
      }
    ];
  
    getFrames(): Frame[] {
      return this.frames;
    }
  
    getFrameById(id: string): Frame | undefined {
      return this.frames.find(frame => frame.id === id);
    }
  
    drawFrame(
      canvas: HTMLCanvasElement,
      photos: string[],
      frame: Frame
    ): void {
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('캔버스 컨텍스트를 가져올 수 없습니다');
  
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
  
      if (frame.type === '3cut') {
        this.draw3CutFrame(ctx, photos, canvas);
      } else {
        this.draw4CutFrame(ctx, photos, canvas);
      }
    }
  
    private draw3CutFrame(
      ctx: CanvasRenderingContext2D,
      photos: string[],
      canvas: HTMLCanvasElement
    ): void {
      const padding = 20;
      const photoWidth = canvas.width - padding * 2;
      const photoHeight = (canvas.height - padding * 4) / 3;
  
      photos.forEach((photoUrl, index) => {
        const img = new Image();
        img.onload = () => {
          const y = padding + (photoHeight + padding) * index;
          ctx.drawImage(img, padding, y, photoWidth, photoHeight);
          ctx.strokeStyle = '#cccccc';
          ctx.lineWidth = 2;
          ctx.strokeRect(padding, y, photoWidth, photoHeight);
        };
        img.src = photoUrl;
      });
    }
  
    private draw4CutFrame(
      ctx: CanvasRenderingContext2D,
      photos: string[],
      canvas: HTMLCanvasElement
    ): void {
      const padding = 20;
      const photoWidth = (canvas.width - padding * 3) / 2;
      const photoHeight = (canvas.height - padding * 3) / 2;
  
      photos.forEach((photoUrl, index) => {
        const img = new Image();
        img.onload = () => {
          const row = Math.floor(index / 2);
          const col = index % 2;
          const x = padding + (photoWidth + padding) * col;
          const y = padding + (photoHeight + padding) * row;
          
          ctx.drawImage(img, x, y, photoWidth, photoHeight);
          ctx.strokeStyle = '#cccccc';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, photoWidth, photoHeight);
        };
        img.src = photoUrl;
      });
    }
  }