PORTFOLIO COMPLETE v2
======================

이번 버전은 "압축 풀기 → portfolio_complete_v2 폴더 → index.html 더블클릭" 기준으로 제작했습니다.

[중요]
이전 ZIP은 변경 파일만 들어 있어서 assets/css/main.css 등 기존 파일이 빠졌습니다.
이번 ZIP은 아래 전체 구조를 모두 포함합니다.

portfolio_complete_v2/
├─ index.html
├─ projects.html
├─ project.html
├─ about.html
├─ assets/
│  ├─ css/
│  │  ├─ common.css
│  │  ├─ main.css
│  │  ├─ projects.css
│  │  ├─ project.css
│  │  ├─ about.css
│  │  └─ responsive.css
│  ├─ js/
│  │  ├─ main.js
│  │  ├─ projects.js
│  │  └─ project.js
│  └─ images/
│     └─ 로컬 확인용 샘플 SVG 이미지
└─ data/
   └─ projects-data.js

------------------------------------------------------------
1. 로컬에서 바로 실행
------------------------------------------------------------

index.html을 더블클릭하면 됩니다.

기존처럼 fetch('data/projects.json')을 사용하지 않습니다.
Chrome에서 file:// 로 열 때 JSON fetch가 차단되는 문제를 피하기 위해
data/projects-data.js가 window.PORTFOLIO_PROJECTS 배열을 직접 제공합니다.

따라서 Live Server 없이도:
- 메인 레코드 회전
- 카테고리 변경
- 프로젝트 패널
- PROJECTS 필터
- PROJECT 상세
- Contribution
- PREV / NEXT
가 작동합니다.

------------------------------------------------------------
2. 실제 작업물 데이터 교체
------------------------------------------------------------

data/projects-data.js만 수정하면 됩니다.

프로젝트 한 개 기본 구조:

{
  id: "project-id",
  title: "PROJECT TITLE",
  category: "web",
  categoryLabel: "WEB DESIGN",
  type: "Website",
  year: "2026",
  role: "Design / Publishing",
  platform: "Cafe24",

  thumbnail: "assets/images/thumbnail.jpg",
  cover: "assets/images/cover.jpg",

  description: "프로젝트 개요",

  contribution: [
    { label: "PLANNING", value: "70%" },
    { label: "DESIGN", value: "100%" },
    { label: "PUBLISHING", value: "100%" }
  ],

  challenge: "해결해야 했던 문제",
  approach: "문제를 해결한 방식",

  keyWorks: [
    "Responsive",
    "Cafe24 Custom",
    "UI Design"
  ],

  images: [
    "assets/images/detail-01.jpg",
    "assets/images/detail-02.jpg"
  ]
}

category 값:
- web
- ecommerce
- detail
- graphic

------------------------------------------------------------
3. 이미지
------------------------------------------------------------

실제 이미지 파일을 assets/images 안에 넣고
projects-data.js의 경로만 변경하면 됩니다.

현재 들어 있는 SVG는 "사이트가 깨지지 않고 바로 열리는지" 확인하기 위한
로컬 테스트용 샘플 이미지입니다.

------------------------------------------------------------
4. 반영 내용
------------------------------------------------------------

- 기존 메인 레코드 콘셉트 유지
- 금빛 암부 / Canvas 보케 유지
- 스크롤 카테고리 회전 유지
- 레코드 클릭 → 우측 패널 가로 확장 유지
- 패널 카드에 순번 / 역할 / 플랫폼 / VIEW 추가
- VIEW ALL에 카테고리 작업물 수 추가
- PROJECTS 필터별 개수 표시
- PROJECTS 썸네일 CSS 누락 수정
- 상세페이지 Contribution 섹션 추가
- 기여도 퍼센트 바 추가
- Challenge / Approach / Key Works 추가
- 상세 갤러리 순번 추가
- PREV / ALL / NEXT 추가
- ABOUT 페이지 추가
- 모바일 SWIPE TO ROTATE 추가
- 로컬 file:// 실행 대응
