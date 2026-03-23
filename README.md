<div align="center">

# 📸 PromPhoto

**프롬프트 기반 AI 네컷 사진 제작 서비스**

프롬프트 한 줄로 나만의 프레임을 만들고, 브라우저에서 바로 촬영하세요.

<br/>

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Rolldown-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![OpenAI](https://img.shields.io/badge/DALL--E_3-API-412991?style=for-the-badge&logo=openai&logoColor=white)

</div>

---

## 💡 프로젝트 소개

**PromPhoto**는 사용자가 텍스트 프롬프트를 입력하면 AI가 네컷 프레임을 생성하고, 브라우저 카메라로 촬영한 뒤 최종 결과물을 다운로드할 수 있는 웹 서비스입니다.

> **상상 → 생성 → 촬영 → 편집 → 저장** 까지, 최소한의 단계로 완성하는 나만의 네컷 사진

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| **AI 프레임 생성** | DALL-E 3 API로 프롬프트 기반 1024×1024 HD 프레임 이미지 생성 |
| **자동 촬영** | WebRTC 카메라 접근 + 5초 카운트다운 자동 촬영 (총 8장) |
| **프레임 레이아웃** | 3컷(세로 스트립) / 4컷(2×2 그리드) 선택 지원 |
| **이미지 편집** | 밝기 · 대비 · 채도 슬라이더 조절 |
| **고해상도 내보내기** | DPR 2x Canvas 합성 → JPEG 다운로드 |

---

## 🛠️ 기술 스택

```
Frontend       React 19  ·  TypeScript 5.9
Build          Vite (Rolldown)
AI             OpenAI DALL-E 3 API
Camera         WebRTC MediaStream API
Image          Canvas 2D API
HTTP           Axios
Design         Figma
```

---

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── MainPage.tsx            # 메인 랜딩 페이지
│   ├── FrameSelection.tsx      # 프레임 타입 선택 (3컷/4컷/AI)
│   ├── AIFrameGenerator.tsx    # AI 프롬프트 입력 및 프레임 생성
│   ├── CameraGuidance.tsx      # 촬영 안내 페이지
│   ├── CameraCapture.tsx       # 자동 촬영 (카운트다운 + 8장 캡처)
│   ├── PhotoSelection.tsx      # 8장 중 3~4장 선택
│   └── PhotoEdit.tsx           # 필터 편집 및 최종 다운로드
├── services/
│   ├── CameraService.tsx       # WebRTC 카메라 제어
│   ├── FrameService.tsx        # Canvas 프레임 합성
│   └── ImageProcessing.tsx     # 픽셀 단위 필터 연산
├── App.tsx                     # 페이지 라우팅 및 상태 관리
└── styles.css                  # 전체 스타일링
```

---

## 🚀 시작하기

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일에 VITE_OPENAI_API_KEY 입력

# 개발 서버 실행
npm run dev
```

---

## 📷 사용자 흐름

```
메인 페이지
  └─ 프레임 선택 (3컷 / 4컷 / AI 생성)
       └─ [AI 선택 시] 프롬프트 입력 → 프레임 생성
            └─ 촬영 안내
                 └─ 자동 촬영 (5초 × 8장)
                      └─ 사진 선택 (8장 중 3~4장)
                           └─ 편집 (밝기/대비/채도)
                                └─ JPEG 다운로드
```

---

## 🔧 핵심 구현 사항

- **WebRTC** — `getUserMedia`로 전면 카메라(1280×720) 접근, 좌우반전(거울 모드) 적용
- **Canvas 캡처** — 비디오 프레임을 Canvas에 그린 뒤 JPEG 95% 품질로 인코딩
- **DALL-E 3 연동** — 시스템 프롬프트로 색감·조명을 제어, Base64 응답을 즉시 렌더링
- **고해상도 합성** — DPR 2x 캔버스에서 object-fit: cover 로직을 직접 구현하여 프레임 합성
- **필터 처리** — Canvas filter 속성 + 픽셀 단위 HSL 연산 병행

---

<div align="center">

Made with ❤️ by **KimEunChan**

</div>
