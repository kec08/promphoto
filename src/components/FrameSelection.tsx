import type { Frame } from "../types";
import aiIconUrl from '../assets/img/ai_icon.png';
import photo3Url from '../assets/img/photo_3.png';
import photo4Url from '../assets/img/photo_4.png';
import ai3dUrl from '../assets/img/ai_3d.png';

export class FrameSelection {
  private container: HTMLElement;
  private frames: Frame[];
  private onFrameSelect: (frame: Frame) => void;
  private onAIClick: () => void;

  constructor(
    container: HTMLElement,
    frames: Frame[],
    onFrameSelect: (frame: Frame) => void,
    onAIClick: () => void
  ) {
    this.container = container;
    this.frames = frames;
    this.onFrameSelect = onFrameSelect;
    this.onAIClick = onAIClick;
  }

  render(): void {
    const frame3 = this.frames.find(f => f.type === "3cut");
    const frame4 = this.frames.find(f => f.type === "4cut");

    this.container.innerHTML = `
      <div class="frame-selection-page">
      <nav class="navbar">
          <div class="navbar-logo">
            <img class="header-logo" src="${aiIconUrl}" alt="promphoto logo" />
              <span>promphoto</span>
          </div>

          <ul class="navbar-menu">
            <li><a href="#home">홈</a></li>
            <li><a href="#select">선택</a></li>
            <li><a href="#image">이미지</a></li>
          </ul>
        </nav>
        <div class="frame-selection-layout">

          <div class="frame-left">
            <button class="frame-type-card" id="card-3cut" ${!frame3 ? "disabled" : ""}>
              <div class="frame-type-inner">
                <img class="frame-type-icon-3" src="${photo3Url}" alt="3cut" />
                <div class="frame-type-text-3">3cut</div>
              </div>
            </button>

            <button class="frame-type-card" id="card-4cut" ${!frame4 ? "disabled" : ""}>
              <div class="frame-type-inner">
                <img class="frame-type-icon-4" src="${photo4Url}" alt="4cut" />
                <div class="frame-type-text-4">4cut</div>
              </div>
            </button>
          </div>

          <button class="frame-ai-card" id="card-ai">
            <div class="frame-ai-inner">
              <img class="frame-ai-icon" src="${ai3dUrl}" alt="AI" />
              <div class="frame-ai-text">AI 프레임 생성하기</div>
            </div>
          </button>

        </div>
      </div>
    `;

    if (frame3) {
      this.container.querySelector("#card-3cut")
        ?.addEventListener("click", () => this.onFrameSelect(frame3));
    }

    if (frame4) {
      this.container.querySelector("#card-4cut")
        ?.addEventListener("click", () => this.onFrameSelect(frame4));
    }

    this.container.querySelector("#card-ai")
      ?.addEventListener("click", () => this.onAIClick());
  }
}
