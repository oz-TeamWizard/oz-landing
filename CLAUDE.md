# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 작업할 때 필요한 가이드를 제공합니다.

## 프로젝트 개요

**mealStack**은 개인 맞춤형 단백질 섭취량 계산과 식단 계획을 제공하는 한국 피트니스 영양 웹 애플리케이션입니다. 이 앱은 사용자의 목표(벌크업, 린벌크업, 컷팅, 유지)에 따라 단백질 요구량을 계산하고 쇼핑 리스트와 함께 맞춤형 식단을 생성합니다.

## 아키텍처

### 프론트엔드 구조
- **단일 페이지 애플리케이션**: 순수 HTML/CSS/JavaScript로 구축
- **main.html**: HTML 구조, 임베디드 CSS 스타일, JavaScript 로직을 포함한 완전한 애플리케이션
- **스타일링**: 다크 테마를 위한 커스텀 CSS 변수와 함께 Bootstrap 5.3.3, Tailwind CSS, Font Awesome 아이콘 사용
- **디자인**: 빨간 강조색(`--primary-red: #dc2626`)과 글라스모피즘 효과를 가진 다크 테마

### 백엔드 통합
- **appscript.js**: 이메일 구독 및 데이터 저장을 처리하는 Google Apps Script 백엔드
- **API 엔드포인트**: 크로스 오리진 요청을 위한 CORS 처리와 함께 Google Apps Script에 배포
- **데이터 저장**: 사용자 구독 데이터를 저장하기 위해 Google Sheets를 자동으로 생성

### 핵심 기능
- **단백질 계산기**: 체중, 피트니스 목표, 활동 수준에 따른 일일 단백질 필요량 계산
- **식단 계획**: 과학적 기반의 매크로 밸런싱 알고리즘을 통한 식단 생성
- **음식 선호도**: 사용자 선호도(육류, 해산물, 식물성)에 따른 식단 조정
- **쇼핑 통합**: 재료 구매를 위한 쿠팡(한국 이커머스) 직접 링크 제공
- **이메일 구독**: 도시락 배송 서비스 출시 전 알림을 위한 사용자 이메일 수집

## 개발 명령어

### 애플리케이션 실행
```bash
# 웹 브라우저에서 main.html 열기 - 빌드 과정 불필요
open main.html
# 또는
python -m http.server 8000  # 로컬 개발 서버용
```

### Google Apps Script 배포
```bash
# appscript.js를 Google Apps Script에 배포
# 1. script.google.com 접속
# 2. 새 프로젝트 생성
# 3. Code.gs를 appscript.js 내용으로 교체
# 4. 공개 액세스로 웹 앱으로 배포
```

## 주요 기술적 특징

### 영양 알고리즘
- **과학적 식단 데이터**: 각 피트니스 목표에 대한 정확한 매크로 계산을 포함한 사전 정의된 식단
- **적응형 식단 계획**: `adaptMealsByPreference()` 함수로 식이 선호도에 따른 음식 교체
- **매크로 밸런싱**: `balanceMealMacrosIteratively()` 함수로 목표 다량영양소 비율 달성을 위한 댐핑 팩터가 적용된 반복 알고리즘
- **단백질 계산**: 목표별 체중당 단백질 비율 (벌크업: 2.2g/kg, 컷팅: 2.4g/kg 등)

### 사용자 인터페이스
- **인터랙티브 폼**: 실시간 검증을 포함한 다단계 단백질 계산
- **커스텀 아코디언**: 부드러운 애니메이션을 가진 확장 가능한 식단 섹션
- **이미지 캡처**: 식단을 이미지로 저장하기 위한 `html2canvas` 통합
- **소셜 공유**: 클립보드 대체 기능이 있는 네이티브 Web Share API

### 데이터 처리
- **이메일 통합**: 로딩 상태와 오류 처리를 포함한 `sendSubscriptionEmail()` 함수
- **로컬 저장소**: `lastCalculationResult`에 저장되는 세션 기반 계산 결과
- **Google Sheets API**: Apps Script를 통한 자동 스프레드시트 생성 및 데이터 지속성

## 설정

### CSS 커스텀 속성
```css
--primary-red: #dc2626;
--dark-bg: #111111;
--card-bg: rgba(38, 38, 38, 0.6);
--text-light: #f0f0f0;
--border-color: rgba(255, 255, 255, 0.1);
```

### API 설정
- main.html에서 배포된 Google Apps Script URL로 `EMAIL_API_URL` 업데이트
- Apps Script는 첫 실행 시 Google Sheets 저장소를 자동으로 초기화

## 외부 의존성
- Bootstrap 5.3.3 (CSS 프레임워크)
- Tailwind CSS (유틸리티 클래스)
- Font Awesome 6.0.0 (아이콘)
- Inter & Pretendard 폰트 (한국어 타이포그래피)
- html2canvas 1.4.1 (이미지 캡처)

## 한국어 현지화
- 모든 UI 텍스트가 한국어
- 한국 음식 항목 및 측정 단위
- 한국 이커머스(쿠팡)와의 통합
- Pretendard 폰트 대체가 있는 한국어 타이포그래피