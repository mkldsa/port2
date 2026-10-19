LUNE 성형외과 웹사이트 V15 — 연출컷 중심 원페이지 전체 교체본

사용 방법
압축을 모두 해제한 뒤 index.html을 브라우저에서 여세요.
HTML·CSS·JS·이미지·폰트 폴더를 함께 유지해야 합니다.
외부 네트워크 없이 사용할 수 있는 정적 사이트입니다.

이번 변경
첫 화면의 고정 스크롤 구간, 세 장면 전환, 장면 선택 막대를 제거했습니다.
휠·터치를 가로채거나 전체 화면에 스크롤을 붙잡아 두는 동작이 없습니다.
한 장의 메인 사진 → 이벤트 → 성형 안내 → 상담 안내 → 상담 과정 → 상담 진입으로 이어집니다.
상단 메뉴에서 원하는 섹션으로 바로 이동할 수 있습니다.
코·눈·리프팅 탭을 제거하고 새 연출 사진 세 장을 펼쳐 보여줍니다.
코성형 상세 페이지의 사진도 새 사진으로 교체했습니다.
스크롤 효과는 짧은 등장 모션, 진행 표시, 현재 섹션 표시로 제한했습니다.

사진과 화질
일반 사진 5종을 새 연출컷으로 교체했습니다.
화이트에 은은한 블루·핑크를 더하고, 머리와 얼굴이 잘리지 않는 원본 구도를 유지합니다.
사진에 확대 줌이나 블러 효과를 적용하지 않았습니다.
새 PNG는 생성된 원본 파일을 재압축하거나 확대하지 않고 복사했습니다.

assets/images/campaign-v15-hero.png — 1254 × 1254px, 최대 표시 너비 626px
assets/images/campaign-v15-nose.png — 1024 × 1536px, 코성형 상세 최대 480px
assets/images/campaign-v15-eyes.png — 1024 × 1536px
assets/images/campaign-v15-lifting.png — 1024 × 1536px
assets/images/campaign-v15-consult.png — 1536 × 1024px, 최대 표시 너비 720px

전달받은 프로모션 6종
썸네일 3개와 상세 이미지 3개를 모두 사용하며 V14 원본 파일과 동일한 바이트를 유지합니다.
가을 리프팅 상세: 3583 × 18750px / 300PPI
봄 이벤트 상세: 3583 × 26517px / 300PPI
웨딩 상세: 3583 × 22992px / 300PPI
상세 페이지는 PC에서 너비 860px, 모바일에서는 화면 너비에 맞춰 표시합니다.
썸네일은 전체 구도를 유지하고 원래 제공된 파일을 그대로 사용합니다.
웨딩 썸네일은 제공본이 546 × 472px이므로 고밀도 화면의 세부 선명도에는 한계가 있습니다.

디자인과 조작
본문 최소 16px / 밝은 화이트 중심 / 절제된 포인트 컬러
모바일 메뉴 / 키보드 포커스 순환 / ESC 닫기 / 상담창 / 맨 위로 이동
동작 줄이기 설정에서는 등장 모션과 부드러운 스크롤을 끕니다.
파비콘은 기존 디자인을 유지하며 모든 페이지에 연결했습니다.

주요 파일
index.html — 원페이지 메인
css/editorial.css — 메인 PC 스타일
css/editorial_responsive.css — 메인 MO 스타일
js/editorial.js — 메뉴·상담창·가벼운 스크롤 효과
css/home.css, home_responsive.css — 공통 스타일
css/subpage.css, responsive.css — 상세 스타일
js/main.js — 기존 서브 페이지 동작
source_txt — 전체 HTML/CSS/JS와 내용이 동일한 .txt 소스
favicon.ico / assets/brand/favicon.svg / assets/brand/apple-touch-icon.png
image_originals/EDITORIAL_PROMPTS_V15.txt — 새 사진의 제작 지시문과 실제 크기

페이지
index.html / events.html / event-lifting.html / event-spring.html / event-bridal.html / detail-rhinoplasty.html
event-rhinoplasty.html, event-eyelid.html은 이전 링크 호환용 봄 이벤트 페이지입니다.

검수
HTML 8개 경로·내부 앵커·중복 ID·대체 텍스트·상담창 이름 연결을 확인했습니다.
프로모션 원본 6개와 새 PNG 5개의 파일 바이트를 비교했습니다.
실제 이미지 크기, 새 사진 표시 폭, 파비콘, JS 구문, CSS 경로·괄호 구조를 확인했습니다.
브라우저 실동작·시각 검수는 이번 환경에서 수행하지 못했습니다.

제작 정보
가상 브랜드 디자인 작업이며 진료 정보와 가격은 디자인 시안의 설정입니다.
상담 폼은 입력 확인용으로 서버 전송이나 실제 예약 접수는 연결되어 있지 않습니다.
