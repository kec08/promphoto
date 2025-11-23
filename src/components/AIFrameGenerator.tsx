export class AIFrameGenerator {
  private container: HTMLElement;
  private onFrameGenerated: (frameImageUrl: string, frameType: '3cut' | '4cut') => void;
  private onBack: () => void;
  private isGenerating = false;

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
          <!-- 왼쪽: 프롬프트 입력 -->
          <section class="ai-input-section">
            <div class="ai-input-inner">
              <h2>프롬프트 입력</h2>
              <p class="ai-description">
                생성하고 싶은 프레임의 스타일을 설명해주세요. 
                프롬프트에 자동으로 포토프레임이 적용됩니다.
              </p>

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

          <!-- 오른쪽: 생성 결과 프리뷰 (세로 인생네컷 크기) -->
          <section class="ai-preview-section">
            <div class="ai-preview-inner">
              <div class="ai-preview-box" id="preview-box">
                <div class="ai-preview-empty">
                  <svg width="48" height="48" viewBox="0 0 64 74" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="previewGradient" x1="31.5738" x2="31.5738" y1="0" y2="63.1442">
                        <stop stopColor="#FF5356" />
                        <stop offset="0.524038" stopColor="#FF31D2" />
                        <stop offset="1" stopColor="#6505D2" />
                      </linearGradient>
                    </defs>
                  </svg>
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
  }

  private setupEventListeners(): void {
    // 뒤로가기
    const backBtn = this.container.querySelector('#back-btn') as HTMLButtonElement;
    backBtn?.addEventListener('click', () => this.onBack());

    // 문자 수 카운트
    const promptInput = this.container.querySelector('#prompt') as HTMLTextAreaElement;
    const charCurrent = this.container.querySelector('#char-current') as HTMLElement;
    
    promptInput?.addEventListener('input', () => {
      charCurrent.textContent = String(Math.min(promptInput.value.length, 500));
      promptInput.value = promptInput.value.substring(0, 500);
    });

    // 생성 버튼
    const generateBtn = this.container.querySelector('#generate-btn') as HTMLButtonElement;
    generateBtn?.addEventListener('click', () => this.generateFrame());

    // 확인 버튼
    const confirmBtn = this.container.querySelector('#confirm-btn') as HTMLButtonElement;
    confirmBtn?.addEventListener('click', () => this.confirmFrame());
  }

  private async generateFrame(): Promise<void> {
    if (this.isGenerating) return;

    const promptInput = this.container.querySelector('#prompt') as HTMLTextAreaElement;
    const frameTypeSelect = this.container.querySelector('#frame-type') as HTMLSelectElement;
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
      // OpenAI API 호출
      const imageUrl = await this.callOpenAIAPI(prompt);
      
      // 프리뷰 표시
      const previewBox = this.container.querySelector('#preview-box') as HTMLElement;
      previewBox.innerHTML = `
        <img src="${imageUrl}" alt="Generated frame" class="ai-preview-image" />
      `;

      // 확인 버튼 활성화
      const confirmBtn = this.container.querySelector('#confirm-btn') as HTMLButtonElement;
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.dataset.imageUrl = imageUrl;
        confirmBtn.dataset.frameType = frameTypeSelect?.value || '3cut';
      }

      // 생성 버튼 리셋
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
    if (!apiKey) {
      throw new Error(`
      `.trim());
    }

    const enhancedPrompt = `
고품질 풍경 사진을 생성해주세요. 
사용자가 원하는 장면: ${prompt}

이미지 요구사항:
- 자연스럽고 살아있는 풍경/배경
- 따뜻하고 매력적인 분위기
- 사진작가 수준의 구성과 색감
- 영화 같은 분위기의 조명
- 실제 풍경 사진처럼 자연스러움
- 축제, 행사, 풍경, 도시 배경 중심

스타일:
- 따뜻하고 생생한 색감
- 영화 포스터 같은 감성
- 실제로 존재하는 공간처럼 리얼함

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
        response_format: 'url',
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API 오류: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    if (!data.data || !data.data[0] || !data.data[0].url) {
      throw new Error('API 응답에 이미지 URL이 없습니다.');
    }
    return data.data[0].url;
  }

  private confirmFrame(): void {
    const confirmBtn = this.container.querySelector('#confirm-btn') as HTMLButtonElement;
    const imageUrl = confirmBtn?.dataset.imageUrl as string;
    const frameType = (confirmBtn?.dataset.frameType as '3cut' | '4cut') || '3cut';

    if (!imageUrl) {
      alert('생성된 프레임이 없습니다.');
      return;
    }

    this.onFrameGenerated(imageUrl, frameType);
  }
}
