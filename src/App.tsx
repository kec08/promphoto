import './styles.css';

import { MainPage } from './components/MainPage';
import { FrameSelection } from './components/FrameSelection';
import { CameraGuidance } from './components/CameraGuidance';
import { CameraCapture } from './components/CameraCapture';
import { PhotoSelection } from './components/PhotoSelection';
import { PhotoEdit } from './components/PhotoEdit';
import { AIFrameGenerator } from './components/AIFrameGenerator';
import { CameraService } from './services/CameraService';
import { FrameService } from './services/FrameService';
import type { ProjectState, Frame, CapturedPhoto } from './types';

class PrompPhoto {
  private state: ProjectState = {
    currentPage: 'main',
    selectedFrame: null,
    capturedPhotos: [],
    selectedPhotos: [],
    editOptions: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0,
      blur: 0
    }
  };

  private cameraService: CameraService;
  private frameService: FrameService;
  private container: HTMLElement;

  constructor() {
    this.container = document.getElementById('app') || document.body;
    this.cameraService = new CameraService();
    this.frameService = new FrameService();
  }

  init(): void {
    this.renderPage('main');
  }

  private renderPage(page: ProjectState['currentPage']): void {
    this.state.currentPage = page;

    switch (page) {
      case 'main':
        this.renderMainPage();
        break;
      case 'frameSelection':
        this.renderFrameSelection();
        break;

      case 'aiGenerator':
        this.renderAIFrameGenerator();
        break;

      case 'guidance':
        this.renderCameraGuidance();
        break;
      case 'capture':
        this.renderCameraCapture();
        break;
      case 'selection':
        this.renderPhotoSelection();
        break;
      case 'edit':
        this.renderPhotoEdit();
        break;
    }
  }

  private renderMainPage(): void {
    const mainPage = new MainPage(this.container, () => {
      this.renderPage('frameSelection');
    });
    mainPage.render();
  }

  private renderFrameSelection(): void {
    const frames = this.frameService.getFrames();
    const frameSelection = new FrameSelection(
      this.container,
      frames,
      (frame: Frame) => {
        this.state.selectedFrame = frame;
        this.renderPage('guidance');
      },
      () => {
        this.renderPage('aiGenerator');
      }
    );
    frameSelection.render();
  }

  private renderAIFrameGenerator(): void {
    const aiGen = new AIFrameGenerator(
      this.container,
      (imageUrl: string, frameType: '3cut' | '4cut') => {
        const aiFrame: Frame = {
          id: `ai-${Date.now()}`,
          name: "AI Frame",
          type: frameType,
          thumbnail: imageUrl,
          description: "AI 생성 프레임",
          aiUrl: imageUrl,
          isAI: true
        };

        this.state.selectedFrame = aiFrame;
        this.renderPage('guidance');
      },
      () => this.renderPage('frameSelection')
    );

    aiGen.render();
  }

  private renderCameraGuidance(): void {
    const guidance = new CameraGuidance(this.container, () => {
      this.renderPage('capture');
    });
    guidance.render();
  }

  private renderCameraCapture(): void {
    const capture = new CameraCapture(
      this.container,
      this.cameraService,
      (photos: CapturedPhoto[]) => {
        this.state.capturedPhotos = photos;
        this.renderPage('selection');
      }
    );
    capture.render();
  }

  private renderPhotoSelection(): void {
    if (!this.state.selectedFrame) return;

    const selection = new PhotoSelection(
      this.container,
      this.state.capturedPhotos,
      this.state.selectedFrame,
      (selected: CapturedPhoto[]) => {
        this.state.selectedPhotos = selected;
        this.renderPage('edit');
      }
    );
    selection.render();
  }

  private renderPhotoEdit(): void {
    if (!this.state.selectedFrame) return;

    const edit = new PhotoEdit(
      this.container,
      this.state.selectedPhotos,
      this.state.selectedFrame,
      this.frameService,
      () => {
        this.renderPage('main');
      }
    );
    edit.render();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new PrompPhoto();
  app.init();
});
