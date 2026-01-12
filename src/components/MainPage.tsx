import aiIconUrl from '../assets/img/ai_icon.png';

export class MainPage {
    private container: HTMLElement;
    private onStartClick: () => void;
  
    constructor(container: HTMLElement, onStartClick: () => void) {
      this.container = container;
      this.onStartClick = onStartClick;
    }
  
    render(): void {
      this.container.innerHTML = `
        <div class="main-page">
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
  
          <div class="main-hero">
            <div class="hero-brand">
              <img class="hero-logo" src="${aiIconUrl}" alt="promphoto logo" />
              <span class="hero-brand-text">promphoto</span>
            </div>
  
            <h1 class="hero-title">당신의 상상을 네 컷으로 담다</h1>
            <p class="hero-sub">
              프롬프트로 원하는 프레임을 만들고, 단 한 번의 촬영으로 나만의 네 컷을 남겨보세요!
            </p>
  
            <button class="start-btn start-btn--ghost">시작하기</button>
          </div>
        </div>
      `;
  
      const startBtn = this.container.querySelector(".start-btn");
      startBtn?.addEventListener("click", () => this.onStartClick());
    }
  }
  