// src/components/AIFrameGenerator.tsx
export class AIFrameGenerator {
  private container: HTMLElement;

  private onFrameGenerated: (frameImageUrl: string, frameType: '3cut' | '4cut') => void;
  private onBack: () => void;
  private isGenerating = false;

  // ✅ 선택 상태
  private selectedFrameType: '3cut' | '4cut' = '3cut';

  constructor(
    container: HTMLElement,
    onFrameGenerated: (frameImageUrl: string, frameType: '3cut' | '4cut') => void,
    onBack: () => void
  ) {
    this.container = container;
    this.onFrameGenerated = onFrameGenerated;
    this.onBack = onBack;
  }

  render(): void {
    this.container.innerHTML = `
      <div class="ai-frame-generator-page">
        <nav class="ai-navbar">
          <div class="ai-navbar-left">
            <button class="ai-back-btn" id="back-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <span class="ai-navbar-title">AI 프레임 생성</span>
          </div>
        </nav>

        <div class="ai-generator-layout">
          <section class="ai-input-section">
            <div class="ai-input-inner">
              <h2>프롬프트 입력</h2>
              <p class="ai-description">
                생성하고 싶은 프레임의 스타일을 설명해주세요. 
                프롬프트에 자동으로 포토프레임이 적용됩니다.
              </p>

              <div class="ai-frame-type-toggle" role="tablist" aria-label="frame type">
                <button id="type-3cut" class="ai-type-btn active" data-type="3cut" role="tab" aria-selected="true">
                  3컷
                </button>
                <button id="type-4cut" class="ai-type-btn" data-type="4cut" role="tab" aria-selected="false">
                  4컷
                </button>
              </div>

              <div class="ai-form-group">
                <label for="prompt">프롬프트</label>
                <textarea 
                  id="prompt" 
                  class="ai-prompt-input" 
                  placeholder="예: 봄날 벚꽃 배경, 친구들이 웃고 있는 모습&#10;또는: 카페에서 따뜻한 분위기의 두 명&#10;또는: 노을 석양 배경, 커플이 포즈를 취하고 있는..."
                  rows="6"
                ></textarea>
                <span class="ai-char-count"><span id="char-current">0</span>/500</span>
              </div>

              <button class="ai-generate-btn" id="generate-btn">
                <span class="ai-btn-text">생성하기</span>
                <span class="ai-btn-loader" id="loader" style="display: none;">
                  <span class="dot"></span>
                  <span class="dot"></span>
                  <span class="dot"></span>
                </span>
              </button>

              <p class="ai-note">생성에는 약 20-40초가 소요될 수 있습니다.</p>
            </div>
          </section>

          <section class="ai-preview-section">
            <div class="ai-preview-inner">
              <div class="ai-preview-box" id="preview-box">
                <div class="ai-preview-empty">
                  <svg width="48" height="48" viewBox="0 0 64 74" fill="none" xmlns="http://www.w3.org/2000/svg"></svg>
                  <p>프레임 미리보기</p>
                </div>
              </div>

              <button class="ai-confirm-btn" id="confirm-btn" disabled>
                이 프레임으로 진행
              </button>
            </div>
          </section>
        </div>
      </div>
    `;

    this.setupEventListeners();
    this.syncTypeUI(); // ✅ 초기 UI 동기화
  }

  private setupEventListeners(): void {
    const backBtn = this.container.querySelector('#back-btn') as HTMLButtonElement;
    backBtn?.addEventListener('click', () => this.onBack());

    const promptInput = this.container.querySelector('#prompt') as HTMLTextAreaElement;
    const charCurrent = this.container.querySelector('#char-current') as HTMLElement;
    promptInput?.addEventListener('input', () => {
      charCurrent.textContent = String(Math.min(promptInput.value.length, 500));
      promptInput.value = promptInput.value.substring(0, 500);
    });

    // ✅ 타입 버튼 이벤트
    const typeBtns = this.container.querySelectorAll<HTMLButtonElement>('.ai-type-btn');
    typeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const t = btn.dataset.type as '3cut' | '4cut';
        if (!t) return;
        this.selectedFrameType = t;
        this.syncTypeUI();
      });
    });

    const generateBtn = this.container.querySelector('#generate-btn') as HTMLButtonElement;
    generateBtn?.addEventListener('click', () => this.generateFrame());

    const confirmBtn = this.container.querySelector('#confirm-btn') as HTMLButtonElement;
    confirmBtn?.addEventListener('click', () => this.confirmFrame());
  }

  // ✅ 버튼 active/aria 동기화
  private syncTypeUI() {
    const btn3 = this.container.querySelector('#type-3cut') as HTMLButtonElement | null;
    const btn4 = this.container.querySelector('#type-4cut') as HTMLButtonElement | null;

    if (btn3) {
      const active = this.selectedFrameType === '3cut';
      btn3.classList.toggle('active', active);
      btn3.setAttribute('aria-selected', String(active));
    }
    if (btn4) {
      const active = this.selectedFrameType === '4cut';
      btn4.classList.toggle('active', active);
      btn4.setAttribute('aria-selected', String(active));
    }
  }

  private async generateFrame(): Promise<void> {
    if (this.isGenerating) return;

    const promptInput = this.container.querySelector('#prompt') as HTMLTextAreaElement;
    const generateBtn = this.container.querySelector('#generate-btn') as HTMLButtonElement;
    const btnText = generateBtn?.querySelector('.ai-btn-text') as HTMLElement;
    const loaderSpan = generateBtn?.querySelector('#loader') as HTMLElement;

    const prompt = promptInput?.value?.trim();
    if (!prompt) {
      alert('프롬프트를 입력해주세요.');
      return;
    }

    this.isGenerating = true;
    generateBtn.disabled = true;
    if (btnText) btnText.style.display = 'none';
    if (loaderSpan) loaderSpan.style.display = 'inline-flex';

    try {
      const imageDataUrl = await this.callOpenAIAPI(prompt);

      const previewBox = this.container.querySelector('#preview-box') as HTMLElement;
      previewBox.innerHTML = `
        <img src="${imageDataUrl}" alt="Generated frame" class="ai-preview-image" />
      `;

      const confirmBtn = this.container.querySelector('#confirm-btn') as HTMLButtonElement;
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.dataset.imageUrl = imageDataUrl;
        // ✅ 현재 선택값 저장
        confirmBtn.dataset.frameType = this.selectedFrameType;
      }

      if (btnText) btnText.style.display = 'inline';
      if (loaderSpan) loaderSpan.style.display = 'none';
      generateBtn.disabled = false;
      this.isGenerating = false;
    } catch (error) {
      console.error('프레임 생성 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      alert(`프레임 생성에 실패했습니다.\n\n${errorMessage}`);

      if (btnText) btnText.style.display = 'inline';
      if (loaderSpan) loaderSpan.style.display = 'none';
      generateBtn.disabled = false;
      this.isGenerating = false;
    }
  }

  private async callOpenAIAPI(prompt: string): Promise<string> {
    const apiKey = (import.meta.env.VITE_OPENAI_API_KEY as string) || '';
    if (!apiKey) throw new Error('VITE_OPENAI_API_KEY가 없습니다.');

    const enhancedPrompt = `
고품질 풍경 사진을 생성해주세요. 
사용자가 원하는 장면: ${prompt}

이미지 요구사항:
- 자연스럽고 살아있는 풍경/배경
- 높은 수준의 구성과 색감
- 영화 같은 분위기의 조명
- 실제 풍경 사진처럼 자연스러움
- 축제, 행사, 풍경, 도시 배경 중심

스타일:
- 생생한 색감
- 영화 포스터 같은 감성
- 실제로 존재하는 공간처럼 리얼함
- 자연스러운 풍경과 조화로운 조명

기술사양:
- 고해상도 풍경/배경 사진
- 자연스러운 조명과 그림자
- 깊이감 있는 구성
    `.trim();

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        style: 'natural',
        response_format: 'b64_json'
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API 오류: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) throw new Error('API 응답에 b64_json이 없습니다.');

    return `data:image/png;base64,${b64}`;
  }

  private confirmFrame(): void {
    const confirmBtn = this.container.querySelector('#confirm-btn') as HTMLButtonElement;
    const imageUrl = confirmBtn?.dataset.imageUrl as string;
    const frameType = (confirmBtn?.dataset.frameType as '3cut' | '4cut') || this.selectedFrameType;

    if (!imageUrl) {
      alert('생성된 프레임이 없습니다.');
      return;
    }

    this.onFrameGenerated(imageUrl, frameType);
  }
}
