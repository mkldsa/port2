(() => {
  const categories = [
    {
      id:'profile',
      no:'00',
      label:'ABOUT ME',
      desc:'디자인과 퍼블리싱을 연결해 실제 운영 화면까지 구현합니다.',
      kind:'profile'
    },
    {
      id:'web',
      no:'01',
      label:'WEB DESIGN',
      desc:'웹사이트 기획 · UI 디자인 · 반응형 퍼블리싱'
    },
    {
      id:'ecommerce',
      no:'02',
      label:'SHOP DESIGN',
      desc:'카페24 기반 쇼핑 경험 · 운영형 웹디자인'
    },
    {
      id:'detail',
      no:'03',
      label:'DETAIL PAGE',
      desc:'제품 강점을 구조화하는 상세페이지 디자인'
    },
    {
      id:'graphic',
      no:'04',
      label:'GRAPHIC DESIGN',
      desc:'브랜딩 · 편집 · 프로모션 비주얼'
    },
    {
      id:'kmong',
      no:'05',
      label:'KMONG',
      desc:'웹디자인 · 퍼블리싱 외주 및 작업 의뢰',
      kind:'external',
      url:'https://kmong.com/gig/608596'
    }
  ];

  const projects = Array.isArray(window.PORTFOLIO_PROJECTS)
    ? window.PORTFOLIO_PROJECTS
    : [];

  const body = document.body;
  const entryScreen = document.getElementById('entryScreen');
  const entryStage = document.getElementById('entryStage');
  const hero = document.querySelector('.hero');
  const record = document.getElementById('record');
  const recordButton = document.getElementById('recordButton');
  const orbit = document.getElementById('categoryOrbit');
  const recordStage = document.getElementById('recordStage');

  const heroIndex = document.getElementById('heroIndex');
  const heroTitle = document.getElementById('heroTitle');
  const heroDescription = document.getElementById('heroDescription');

  const panel = document.getElementById('previewPanel');
  const previewTitle = document.getElementById('previewTitle');
  const previewGrid = document.getElementById('previewGrid');
  const previewClose = document.getElementById('previewClose');
  const previewMore = document.getElementById('previewMore');
  const previewCount = document.getElementById('previewCount');

  const homeSelectedWorks = document.getElementById('homeSelectedWorks');
  const homeSelectedCategory = document.getElementById('homeSelectedCategory');
  const homeSelectedCount = document.getElementById('homeSelectedCount');
  const homeSelectedList = document.getElementById('homeSelectedList');
  const homeSelectedAll = document.getElementById('homeSelectedAll');
  const recordHoverText = document.getElementById('recordHoverText');

  const recordUiLabel = document.getElementById('recordUiLabel');
  const recordUiIndex = document.getElementById('recordUiIndex');
  const recordUiCategory = document.getElementById('recordUiCategory');

  /*
    Right sidebar input isolation:
    - wheel/touch gesture stays inside the sidebar
    - prevents bubbling into the global LP wheel controller
  */
  if(homeSelectedWorks){
    homeSelectedWorks.addEventListener('wheel', e => {
      e.stopPropagation();
    }, { passive:true });

    homeSelectedWorks.addEventListener('touchmove', e => {
      e.stopPropagation();
    }, { passive:true });
  }


  let activeIndex = 0;
  let wheelLock = false;
  let accumulatedWheel = 0;

  let recordRotation = 0;
  const baseSpinVelocity = 4.2;
  let rotationDirection = 1;
  let spinVelocity = baseSpinVelocity;
  let spinImpulse = 0;
  let lastFrame = performance.now();
  let userInteracted = false;
  let copySwapTimer = null;
  let copyTransitionToken = 0;

  /* 커서 위치 기반 LP 반사광.
     target → current로 보간해서 포인터를 즉시 붙잡지 않고 표면 위를 미끄러지듯 따라간다. */
  const recordHoverLight = {
    targetX:50,
    targetY:50,
    x:50,
    y:50,
    mirrorX:50,
    mirrorY:50,
    targetStrength:0,
    strength:0
  };

  function esc(value){
    return String(value ?? '')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#039;');
  }

  let entryOpened = false;

  function isEntryGateActive(){
    return body.classList.contains('is-entry-gate');
  }

  function openEntryGate(){
    if(entryOpened || !isEntryGateActive()) return;
    entryOpened = true;

    body.classList.add('is-entry-opening');

    /*
      1) 대문 타이포가 먼저 빠지고
      2) 약간의 시간차 뒤 레코드 메인 intro가 시작된다.
    */
    window.setTimeout(() => {
      body.classList.remove('is-entry-gate');
      startIntro();
    }, 460);

    window.setTimeout(() => {
      body.classList.add('is-entry-complete');
      body.classList.remove('is-entry-opening');

      if(entryScreen){
        entryScreen.setAttribute('aria-hidden','true');
      }
    }, 1050);
  }

  /* =====================================================
     ENTRY SEQUENCE
  ====================================================== */
  function startIntro(){
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if(reduced){
      body.classList.remove('is-intro-loading');
      body.classList.add('is-intro-ready','is-intro-complete');
      return;
    }

    /* 첫 진입에서 LP 자체에 짧은 관성을 준다. */
    spinImpulse += rotationDirection * 128;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        body.classList.remove('is-intro-loading');
        body.classList.add('is-intro-ready');

        window.setTimeout(() => {
          if(!userInteracted) hero.classList.add('show-scroll-guides');
        }, 1420);

        window.setTimeout(() => {
          body.classList.add('is-intro-complete');
        }, 2350);

        window.setTimeout(() => {
          hero.classList.remove('show-scroll-guides');
        }, 6100);
      });
    });
  }

  function markInteracted(){
    if(userInteracted) return;
    userInteracted = true;
    hero.classList.add('has-user-interacted');
    hero.classList.remove('show-scroll-guides');
  }

  /* =====================================================
     PROJECT CARDS
  ====================================================== */
  function cardHTML(p, index){
    const meta = p.tools || p.role || p.type || '';

    return `
      <a class="project-card" href="project.html?id=${encodeURIComponent(p.id)}">
        <div class="project-thumb">
          <img src="${esc(p.thumbnail)}" alt="${esc(p.imageAlt || p.title)} 프로젝트 미리보기">
        </div>

        <span class="project-card-index">${esc(p.number || String(index + 1).padStart(2,'0'))}</span>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.type || '')}</p>

        <div class="project-card-meta">
          <span>${esc(meta)}</span>
          <b>VIEW ↗</b>
        </div>
      </a>
    `;
  }

  function sideCardHTML(p,index){
    const hierarchyClass = index === 0 ? 'is-featured' : 'is-secondary';

    return `
      <a class="home-work-card ${hierarchyClass}" href="project.html?id=${encodeURIComponent(p.id)}">
        <div class="home-work-thumb">
          <img src="${esc(p.thumbnail)}" alt="${esc(p.imageAlt || p.title)} 프로젝트 미리보기">
          <span class="home-work-index">${String(index+1).padStart(2,'0')}</span>
        </div>

        <div class="home-work-copy">
          <span>${esc(p.number || p.categoryLabel || '')}</span>
          <strong>${esc(p.title)}</strong>
          <small>${esc(p.creditSummary || p.type || '')}</small>
        </div>

        <span class="home-work-arrow">↗</span>
      </a>
    `;
  }

  function updateSidePreview(cat,animate=true){
    if(!homeSelectedWorks || !homeSelectedList) return;

    const isProfile = cat.kind === 'profile';
    const isExternal = cat.kind === 'external';

    const categoryProjects = (isProfile || isExternal)
      ? []
      : projects.filter(p => p.category === cat.id);

    const total = isProfile || isExternal ? 1 : categoryProjects.length;

    const apply = () => {
      homeSelectedWorks.classList.toggle('is-profile', isProfile);
      homeSelectedWorks.classList.toggle('is-external', isExternal);

      if(isProfile){
        homeSelectedCategory.textContent = 'YOON SEOK HEE';
        homeSelectedCount.textContent = '00';

        homeSelectedAll.href = 'about.html';
        homeSelectedAll.removeAttribute('target');
        homeSelectedAll.removeAttribute('rel');
        homeSelectedAll.innerHTML = 'VIEW FULL PROFILE <span>↗</span>';

        homeSelectedList.innerHTML = `
          <div class="home-profile-card">

            <div class="home-profile-intro home-profile-animate">
              <div class="home-profile-photo-wrap">
                <img
                  class="home-profile-photo"
                  src="./images/profile_seokhee.png"
                  alt="윤석희 증명사진"
                  width="300"
                  height="400"
                >
              </div>

              <div class="home-profile-identity">
                <span class="home-profile-role">WEB DESIGNER / PUBLISHER</span>
                <strong class="home-profile-name">YOON SEOK HEE</strong>
                <small class="home-profile-summary">
                  디자인과 퍼블리싱을 함께 다루며,
                  화면을 실제 서비스로 완성합니다.
                </small>
              </div>
            </div>

            <div class="home-profile-body home-profile-animate">
              <p>
                웹사이트와 랜딩페이지, 쇼핑몰, 상세페이지,
                그래픽 작업까지 목적에 맞게 설계하고 구현합니다.
                퍼블리싱은 HTML/CSS/JS 기반 반응형과 인터랙션 작업까지 대응합니다.
              </p>
            </div>

            <div class="home-profile-career-grid home-profile-animate">
              <article>
                <span>CAREER</span>
                <strong>2025.07 — PRESENT</strong>
                <small>WEB DESIGNER / PUBLISHER</small>
              </article>

              <article>
                <span>ROLE</span>
                <strong>DESIGN + PUBLISHING</strong>
                <small>기획 의도를 화면으로 설계하고 실제 동작까지 구현</small>
              </article>
            </div>

            <section class="home-profile-services home-profile-animate">
              <span class="home-profile-section-label">AVAILABLE WORK</span>

              <div>
                <b>WEBSITE</b>
                <b>LANDING PAGE</b>
                <b>SHOP / CAFE24</b>
                <b>DETAIL PAGE</b>
                <b>WORDPRESS</b>
                <b>GRAPHIC DESIGN</b>
              </div>
            </section>

            <div class="home-profile-meta home-profile-animate">
              <div class="home-profile-meta-row">
                <span>PUBLISHING</span>
                <p>HTML / CSS / JS · RESPONSIVE · INTERACTION · MAINTENANCE</p>
              </div>

              <div class="home-profile-meta-row">
                <span>TOOLS</span>
                <p>FIGMA · PHOTOSHOP · ILLUSTRATOR · CAFE24 · WORDPRESS · VS CODE</p>
              </div>
            </div>

          </div>
        `;

        if(recordHoverText){
          recordHoverText.textContent = 'VIEW FULL PROFILE';
        }
        return;
      }

      if(isExternal){
        homeSelectedCategory.textContent = 'KMONG';
        homeSelectedCount.textContent = '05';

        homeSelectedAll.href = cat.url;
        homeSelectedAll.target = '_blank';
        homeSelectedAll.rel = 'noopener noreferrer';
        homeSelectedAll.innerHTML = 'OPEN KMONG SERVICE <span>↗</span>';

        homeSelectedList.innerHTML = `
          <a
            class="home-kmong-card home-profile-animate"
            href="${cat.url}"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div class="home-kmong-image">
              <img
                src="./images/kmong_service.png"
                alt="윤석희 크몽 서비스 페이지"
                loading="lazy"
              >
              <span>KMONG / SERVICE</span>
            </div>

            <div class="home-kmong-copy">
              <span class="home-kmong-eyebrow">FREELANCE / REQUEST</span>
              <strong>웹·상세·홈페이지<br>디자인 & 퍼블리싱</strong>

              <p>
                웹사이트, 랜딩페이지, 쇼핑몰, 상세페이지 제작과
                반응형 퍼블리싱 및 운영 수정 작업을 의뢰할 수 있습니다.
              </p>

              <div class="home-kmong-services">
                <span>WEB</span>
                <span>LANDING</span>
                <span>DETAIL</span>
                <span>CAFE24</span>
                <span>WORDPRESS</span>
              </div>

              <span class="home-kmong-open">VIEW KMONG SERVICE ↗</span>
            </div>
          </a>
        `;

        if(recordHoverText){
          recordHoverText.textContent = 'OPEN KMONG';
        }
        return;
      }

      homeSelectedCategory.textContent = cat.label;
      homeSelectedCount.textContent = String(total).padStart(2,'0');

      homeSelectedAll.href = `projects.html?category=${encodeURIComponent(cat.id)}`;
      homeSelectedAll.removeAttribute('target');
      homeSelectedAll.removeAttribute('rel');
      homeSelectedAll.innerHTML = 'VIEW ALL PROJECTS <span>↗</span>';

      homeSelectedList.innerHTML = categoryProjects.length
        ? categoryProjects.map(sideCardHTML).join('')
        : '<p class="home-work-empty">등록된 작업물이 없습니다.</p>';

      if(recordHoverText){
        recordHoverText.textContent = `VIEW ALL ${cat.label}`;
      }
    };

    if(!animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      apply();
      homeSelectedWorks.scrollTop = 0;
      return;
    }

    homeSelectedWorks.getAnimations().forEach(a => a.cancel());

    homeSelectedWorks.animate(
      [
        { opacity:1, transform:'translateY(0)' },
        { opacity:0, transform:'translateY(-8px)' }
      ],
      {
        duration:140,
        easing:'cubic-bezier(.4,0,.6,1)',
        fill:'forwards'
      }
    ).finished.then(() => {
      apply();
      homeSelectedWorks.scrollTop = 0;

      homeSelectedWorks.animate(
        [
          { opacity:0, transform:'translateY(12px)' },
          { opacity:1, transform:'translateY(0)' }
        ],
        {
          duration:420,
          easing:'cubic-bezier(.16,.86,.22,1)',
          fill:'both'
        }
      );

      const revealItems = [
        ...homeSelectedList.querySelectorAll('.home-work-card'),
        ...homeSelectedList.querySelectorAll('.home-profile-animate')
      ];

      revealItems.forEach((item,i) => {
        item.animate(
          [
            { opacity:0, transform:'translateY(10px)' },
            { opacity:1, transform:'translateY(0)' }
          ],
          {
            duration:420,
            delay:55 + i*60,
            easing:'cubic-bezier(.16,.86,.22,1)',
            fill:'both'
          }
        );
      });
    }).catch(() => {
      apply();
      homeSelectedWorks.scrollTop = 0;
    });
  }

  /* =====================================================
     CATEGORY ORBIT
  ====================================================== */
  function renderOrbit(){
    orbit.innerHTML = '';

    const radius = 51.8;
    const angles = [-52, -31, -10, 11, 32, 53];

    categories.forEach((cat, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'category-btn';
      btn.dataset.index = i;
      btn.style.setProperty('--intro-order', i);
      btn.setAttribute('aria-label', `${cat.no || String(i).padStart(2,'0')} ${cat.label} 카테고리 선택`);
      btn.innerHTML = `
        <span class="category-main">
          <span class="category-no">${cat.no || String(i).padStart(2,'0')}</span>
          <span class="category-name">${cat.label}</span>
        </span>
        <small class="category-state">SELECTED</small>
      `;

      const angle = angles[i] * Math.PI / 180;
      const x = 50 + Math.cos(angle) * radius;
      const y = 50 + Math.sin(angle) * radius;

      btn.style.left = `${x}%`;
      btn.style.top = `${y}%`;
      btn.style.transform = 'translate(0,-50%)';

      btn.addEventListener('click', e => {
        e.stopPropagation();
        markInteracted();

        let diff = i - activeIndex;
        if(diff > categories.length / 2) diff -= categories.length;
        if(diff < -categories.length / 2) diff += categories.length;

        const direction = diff < 0 ? -1 : 1;
        selectCategory(i, true, direction);
      });

      orbit.appendChild(btn);
    });
  }

  function setRotationDirection(direction, addImpulse = true){
    rotationDirection = direction < 0 ? -1 : 1;
    spinVelocity = baseSpinVelocity * rotationDirection;

    if(addImpulse){
      /* 기존 impulse를 같은 방향으로 강제로 더하지 않고,
         현재 스크롤 방향으로 즉시 전환되게 한다. */
      spinImpulse *= .18;
      spinImpulse += rotationDirection * 118;
    }
  }

  function updateRecordUiLabel(){
    /* 중앙 라벨은 다시 고정형 LP 라벨로 복원.
       카테고리 정보는 좌측 타이틀/우측 orbit에서 표시한다. */
  }


  function animateHeroCategory(cat){
    const nextIndex = cat.no || String(activeIndex).padStart(2,'0');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const elements = [heroIndex, heroTitle, heroDescription];

    const updateText = () => {
      heroIndex.textContent = nextIndex;
      heroTitle.textContent = cat.label;
      heroDescription.textContent = cat.desc;
    };

    if(reduced || body.classList.contains('is-intro-loading')){
      updateText();
      return;
    }

    const token = ++copyTransitionToken;

    if(copySwapTimer){
      window.clearTimeout(copySwapTimer);
      copySwapTimer = null;
    }

    elements.forEach(el => {
      el.getAnimations().forEach(animation => animation.cancel());
    });

    heroIndex.animate(
      [
        { opacity:1, transform:'translateY(0)' },
        { opacity:0, transform:'translateY(-8px)' }
      ],
      {
        duration:170,
        easing:'cubic-bezier(.4,0,.6,1)',
        fill:'forwards'
      }
    );

    heroTitle.animate(
      [
        { opacity:1, transform:'translateY(0)', filter:'blur(0px)' },
        { opacity:0, transform:'translateY(-16px)', filter:'blur(1px)' }
      ],
      {
        duration:220,
        easing:'cubic-bezier(.4,0,.6,1)',
        fill:'forwards'
      }
    );

    heroDescription.animate(
      [
        { opacity:1, transform:'translateY(0)' },
        { opacity:0, transform:'translateY(-8px)' }
      ],
      {
        duration:180,
        easing:'cubic-bezier(.4,0,.6,1)',
        fill:'forwards'
      }
    );

    copySwapTimer = window.setTimeout(() => {
      if(token != copyTransitionToken) return;

      updateText();

      elements.forEach(el => {
        el.getAnimations().forEach(animation => animation.cancel());
      });

      heroIndex.animate(
        [
          { opacity:0, transform:'translateY(8px)' },
          { opacity:1, transform:'translateY(0)' }
        ],
        {
          duration:420,
          delay:10,
          easing:'cubic-bezier(.16,.86,.22,1)',
          fill:'both'
        }
      );

      heroTitle.animate(
        [
          { opacity:0, transform:'translateY(20px)', filter:'blur(1.5px)' },
          { opacity:1, transform:'translateY(0)', filter:'blur(0px)' }
        ],
        {
          duration:560,
          easing:'cubic-bezier(.16,.86,.22,1)',
          fill:'both'
        }
      );

      heroDescription.animate(
        [
          { opacity:0, transform:'translateY(10px)' },
          { opacity:1, transform:'translateY(0)' }
        ],
        {
          duration:460,
          delay:60,
          easing:'cubic-bezier(.16,.86,.22,1)',
          fill:'both'
        }
      );
    }, 195);
  }

  function selectCategory(index, addImpulse = true, direction = null){
    activeIndex = (index + categories.length) % categories.length;
    const cat = categories[activeIndex];

    if(cat && cat.id){
      body.dataset.currentCategory = cat.id;
    }

    if(direction !== null){
      setRotationDirection(direction, addImpulse);
    }else if(addImpulse){
      spinImpulse += rotationDirection * 82;
    }

    animateHeroCategory(cat);

    updateRecordUiLabel(cat);
    updateSidePreview(cat, addImpulse);

    [...orbit.children].forEach((el, i) => {
      el.classList.toggle('is-active', i === activeIndex);
    });

    if(panel.classList.contains('is-open')){
      renderPreview();
    }
  }

  function renderPreview(){
    const cat = categories[activeIndex];

    if(cat && (cat.kind === 'profile' || cat.kind === 'external')){ return; }

    const categoryProjects = projects.filter(p => p.category === cat.id);
    const list = categoryProjects.slice(0,4);

    previewTitle.textContent = cat.label;
    previewCount.textContent = String(categoryProjects.length).padStart(2,'0');

    previewGrid.innerHTML = list.length
      ? list.map(cardHTML).join('')
      : '<p style="grid-column:1/-1;color:#777">이 카테고리에 등록된 프로젝트가 없습니다.</p>';

    previewMore.href = `projects.html?category=${encodeURIComponent(cat.id)}`;
  }

  function openPreview(){
    markInteracted();

    const cat = categories[activeIndex];

    if(cat && cat.kind === 'profile'){
      window.location.href = 'about.html';
      return;
    }

    if(cat && cat.kind === 'external' && cat.url){
      window.open(cat.url, '_blank', 'noopener,noreferrer');
      return;
    }

    renderPreview();
    hero.classList.add('is-preview-open');
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden','false');
  }

  function closePreview(){
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden','true');
    hero.classList.remove('is-preview-open');
  }

  function rotateByWheel(direction){
    if(panel.classList.contains('is-open')) return;
    markInteracted();
    selectCategory(activeIndex + direction, true, direction);
  }

  window.addEventListener('wheel', e => {
    /*
      ENTRY GATE:
      첫 진입 상태에서는 wheel을 레코드 회전에 사용하지 않고
      입장 트리거로만 사용한다.
    */
    if(isEntryGateActive()){
      e.preventDefault();
      openEntryGate();
      return;
    }

    /*
      01. FULL PREVIEW PANEL
      열린 프로젝트 패널은 브라우저 기본 스크롤 사용.
    */
    if(panel.classList.contains('is-open')){
      return;
    }

    /*
      02. RIGHT HOME SIDEBAR
      SELECTED WORKS 영역 위에서 발생한 wheel / trackpad 입력은
      레코드 카테고리 회전에 절대 사용하지 않는다.
      브라우저 기본 스크롤을 그대로 허용한다.
    */
    if(homeSelectedWorks && e.target instanceof Element && e.target.closest('.home-selected-works')){
      return;
    }

    /*
      03. MAIN HERO AREA
      사이드바와 패널 바깥에서만 wheel을 LP 회전에 사용.
    */
    e.preventDefault();

    if(wheelLock) return;

    accumulatedWheel += e.deltaY;
    if(Math.abs(accumulatedWheel) < 55) return;

    const direction = accumulatedWheel > 0 ? 1 : -1;

    accumulatedWheel = 0;
    wheelLock = true;
    rotateByWheel(direction);

    window.setTimeout(() => {
      wheelLock = false;
    }, 720);
  }, { passive:false });

  window.addEventListener('keydown', e => {
    if(isEntryGateActive()){
      if(e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar'){
        e.preventDefault();
        openEntryGate();
      }
      return;
    }

    if(e.key === 'ArrowDown' || e.key === 'ArrowRight'){
      markInteracted();
      selectCategory(activeIndex + 1, true, 1);
    }

    if(e.key === 'ArrowUp' || e.key === 'ArrowLeft'){
      markInteracted();
      selectCategory(activeIndex - 1, true, -1);
    }

    if(e.key === 'Enter') openPreview();
    if(e.key === 'Escape') closePreview();
  });

  if(entryStage){
    entryStage.addEventListener('click', e => {
      if(isEntryGateActive()){
        e.preventDefault();
        openEntryGate();
      }
    });
  }

  recordButton.addEventListener('click', openPreview);
  previewClose.addEventListener('click', closePreview);

  document.addEventListener('pointerdown', e => {
    if(!panel.classList.contains('is-open')) return;

    const clickedInsidePanel = panel.contains(e.target);
    const clickedRecord = recordButton.contains(e.target);

    if(!clickedInsidePanel && !clickedRecord){
      closePreview();
    }
  });

  /* =====================================================
     TRUE POINTER LIGHT LISTENERS
     v5에서 누락됐던 실제 pointermove 연결.
  ====================================================== */
  function setRecordPointerTarget(e){
    if(hero.classList.contains('is-preview-open')){
      recordHoverLight.targetStrength = 0;
      return;
    }

    const rect = recordButton.getBoundingClientRect();
    if(!rect.width || !rect.height) return;

    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;

    const dx = nx - .5;
    const dy = ny - .5;
    const distance = Math.sqrt(dx*dx + dy*dy);

    recordHoverLight.targetX = Math.max(0, Math.min(100, nx * 100));
    recordHoverLight.targetY = Math.max(0, Math.min(100, ny * 100));

    /* 실제 원판 내부에서만 켜진다. */
    if(distance <= .495){
      const edge = Math.max(.70, 1 - Math.max(0, distance - .34) * 1.7);
      recordHoverLight.targetStrength = edge * .58;
    }else{
      recordHoverLight.targetStrength = 0;
    }
  }

  recordButton.addEventListener('pointerenter', e => {
    setRecordPointerTarget(e);
  }, { passive:true });

  recordButton.addEventListener('pointermove', e => {
    setRecordPointerTarget(e);
  }, { passive:true });

  recordButton.addEventListener('pointerleave', () => {
    recordHoverLight.targetStrength = 0;
  }, { passive:true });

  /* =====================================================
     MOBILE GUIDE + SWIPE
  ====================================================== */
  let touchStartX = 0;
  let touchStartY = 0;
  let touching = false;

  function isMobile(){
    return window.matchMedia('(max-width:900px)').matches;
  }

  function syncGuide(){
    /* v37: desktop/mobile 안내문은 CSS로 전환 */
  }

  syncGuide();
  window.addEventListener('resize', syncGuide, { passive:true });

  recordStage.addEventListener('touchstart', e => {
    if(!isMobile() || e.touches.length !== 1) return;

    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touching = true;
  }, { passive:true });

  recordStage.addEventListener('touchend', e => {
    if(!touching || !isMobile() || !e.changedTouches.length) return;

    touching = false;

    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;

    if(Math.max(Math.abs(dx),Math.abs(dy)) < 42) return;

    const horizontal = Math.abs(dx) >= Math.abs(dy);
    const next = horizontal ? dx < 0 : dy < 0;

    markInteracted();
    selectCategory(activeIndex + (next ? 1 : -1), true, next ? 1 : -1);
  }, { passive:true });

  /* =====================================================
     V3 CINEMATIC DEPTH CANVAS
     FAR / MID / NEAR를 서로 다른 속도·크기·궤적으로 움직이고,
     마우스는 직접 따라가지 않고 관성 카메라처럼 아주 미세하게 반응한다.
  ====================================================== */
  function initDepthCanvas(){
    const canvas = document.getElementById('depthCanvas');
    if(!canvas) return;

    const ctx = canvas.getContext('2d', { alpha:true });
    if(!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles = [];
    let last = performance.now();
    let lastPaint = 0;
    const depthFrameMs = 1000 / 30;

    const pointerTarget = { x:0, y:0 };
    const camera = { x:0, y:0 };

    function random(min,max){
      return min + Math.random() * (max-min);
    }

    function choice(values){
      return values[Math.floor(Math.random()*values.length)];
    }

    function makeParticle(depth){
      const far = depth === 'far';
      const mid = depth === 'mid';
      const near = depth === 'near';

      const kind = far
        ? choice(['pin','pin','pin','pin','dust'])
        : mid
          ? choice(['bokeh','bokeh','pin','dust'])
          : choice(['bokeh','bokeh','bokeh','mist','mist']);

      const radius = far
        ? random(.45,1.8)
        : mid
          ? random(4,19)
          : random(95,290);

      const speed = far
        ? random(.22,.78)
        : mid
          ? random(.9,2.7)
          : random(2.0,5.8);

      const direction = random(0,Math.PI*2);
      const px = near ? random(-width*.14,width*1.14) : random(0,width);
      const py = near ? random(-height*.18,height*1.18) : random(0,height);

      return {
        depth,
        kind,
        x:px,
        y:py,
        radius,
        vx:Math.cos(direction)*speed,
        vy:Math.sin(direction)*speed,
        alpha:far
          ? random(.14,.48)
          : mid
            ? random(.065,.22)
            : random(.018,.060),
        warm:Math.random() > .20,
        phase:random(0,Math.PI*2),
        pulseSpeed:far ? random(.10,.30) : mid ? random(.12,.36) : random(.07,.22),
        orbitSpeed:far ? random(.025,.08) : mid ? random(.035,.11) : random(.018,.060),
        orbitX:far ? random(2,7) : mid ? random(7,20) : random(42,115),
        orbitY:far ? random(2,6) : mid ? random(6,17) : random(34,92),
        depthFactor:far ? random(.8,1.8) : mid ? random(3.3,6.4) : random(22,38),
        dustLength:far ? random(4,11) : random(9,28),
        dustAngle:random(-.7,.7),
        blurFactor:far ? random(.15,.35) : mid ? random(.55,1.15) : random(.16,.25)
      };
    }

    function rebuild(){
      particles = [];
      for(let i=0;i<68;i++) particles.push(makeParticle('far'));
      for(let i=0;i<15;i++) particles.push(makeParticle('mid'));
      for(let i=0;i<4;i++) particles.push(makeParticle('near'));
    }

    function resize(){
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1,rect.width);
      height = Math.max(1,rect.height);
      dpr = Math.min(window.devicePixelRatio || 1,1.25);

      canvas.width = Math.round(width*dpr);
      canvas.height = Math.round(height*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);

      rebuild();
    }

    function wrap(p){
      const pad = p.radius*1.4 + p.dustLength + 20;

      if(p.x < -pad) p.x = width + pad;
      if(p.x > width + pad) p.x = -pad;
      if(p.y < -pad) p.y = height + pad;
      if(p.y > height + pad) p.y = -pad;
    }

    function drawPin(p,x,y,a){
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = p.warm ? '#f0d7a1' : '#f5f1e8';
      ctx.shadowColor = p.warm
        ? 'rgba(220,167,82,.48)'
        : 'rgba(255,255,255,.25)';
      ctx.shadowBlur = p.radius*5 + 2;
      ctx.beginPath();
      ctx.arc(x,y,p.radius,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    }

    function drawDust(p,x,y,a){
      const length = p.dustLength;
      const dx = Math.cos(p.dustAngle)*length*.5;
      const dy = Math.sin(p.dustAngle)*length*.5;

      const g = ctx.createLinearGradient(x-dx,y-dy,x+dx,y+dy);
      g.addColorStop(0,'rgba(225,190,126,0)');
      g.addColorStop(.5,p.warm
        ? `rgba(232,196,132,${a})`
        : `rgba(239,236,224,${a*.8})`);
      g.addColorStop(1,'rgba(225,190,126,0)');

      ctx.save();
      ctx.strokeStyle = g;
      ctx.lineWidth = Math.max(.6,p.radius*.34);
      ctx.filter = `blur(${p.depth === 'far' ? .25 : .7}px)`;
      ctx.beginPath();
      ctx.moveTo(x-dx,y-dy);
      ctx.lineTo(x+dx,y+dy);
      ctx.stroke();
      ctx.restore();
    }

    function drawBokeh(p,x,y,a){
      const r = p.radius;
      const g = ctx.createRadialGradient(
        x-r*.18,
        y-r*.20,
        Math.max(.5,r*.025),
        x,
        y,
        r
      );

      if(p.depth === 'near'){
        if(p.warm){
          g.addColorStop(0,`rgba(255,243,213,${a*.33})`);
          g.addColorStop(.24,`rgba(236,193,126,${a*.21})`);
          g.addColorStop(.54,`rgba(188,128,52,${a*.085})`);
          g.addColorStop(.78,`rgba(116,69,20,${a*.025})`);
          g.addColorStop(1,'rgba(70,40,12,0)');
        }else{
          g.addColorStop(0,`rgba(255,255,246,${a*.28})`);
          g.addColorStop(.30,`rgba(225,222,205,${a*.14})`);
          g.addColorStop(.72,`rgba(165,159,142,${a*.035})`);
          g.addColorStop(1,'rgba(145,140,125,0)');
        }
      }else if(p.warm){
        g.addColorStop(0,`rgba(255,246,220,${a*.74})`);
        g.addColorStop(.18,`rgba(243,207,145,${a*.43})`);
        g.addColorStop(.47,`rgba(194,137,60,${a*.17})`);
        g.addColorStop(.72,`rgba(122,75,25,${a*.045})`);
        g.addColorStop(1,'rgba(80,48,14,0)');
      }else{
        g.addColorStop(0,`rgba(255,255,248,${a*.62})`);
        g.addColorStop(.30,`rgba(230,227,211,${a*.28})`);
        g.addColorStop(.72,`rgba(177,171,151,${a*.05})`);
        g.addColorStop(1,'rgba(150,145,130,0)');
      }

      ctx.save();
      ctx.fillStyle = g;
      if(p.depth === 'near'){
        ctx.filter = `blur(${Math.max(18,r*p.blurFactor)}px)`;
      }else if(p.depth === 'mid'){
        ctx.filter = `blur(${Math.max(1.2,r*.075)}px)`;
      }else{
        ctx.filter = 'blur(.25px)';
      }
      ctx.beginPath();
      ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    }

    function drawMist(p,x,y,a){
      const r = p.radius*1.34;
      const g = ctx.createRadialGradient(x,y,0,x,y,r);
      g.addColorStop(0,`rgba(245,214,160,${a*.20})`);
      g.addColorStop(.30,`rgba(203,151,78,${a*.105})`);
      g.addColorStop(.62,`rgba(134,82,27,${a*.038})`);
      g.addColorStop(1,'rgba(55,32,9,0)');
      ctx.save();
      ctx.fillStyle = g;
      ctx.filter = `blur(${Math.max(28,r*.20)}px)`;
      ctx.beginPath();
      ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    }

    function drawAtmosphere(t){
      const gx = width*.60 + Math.sin(t*.000095)*width*.035 + camera.x*3;
      const gy = height*.52 + Math.cos(t*.000078)*height*.035 + camera.y*2;
      const radius = Math.max(width,height)*.46;

      const g = ctx.createRadialGradient(gx,gy,0,gx,gy,radius);
      g.addColorStop(0,'rgba(170,112,40,.068)');
      g.addColorStop(.38,'rgba(116,72,24,.027)');
      g.addColorStop(1,'rgba(50,30,10,0)');

      ctx.fillStyle = g;
      ctx.fillRect(0,0,width,height);

      const ex = width*(.07 + Math.sin(t*.000071)*.025);
      const ey = height*(.82 + Math.cos(t*.000064)*.035);
      const edge = ctx.createRadialGradient(ex,ey,0,ex,ey,width*.34);
      edge.addColorStop(0,'rgba(205,147,60,.040)');
      edge.addColorStop(1,'rgba(100,60,20,0)');
      ctx.fillStyle = edge;
      ctx.fillRect(0,0,width,height);
    }

    function updateCamera(){
      camera.x += (pointerTarget.x-camera.x)*.026;
      camera.y += (pointerTarget.y-camera.y)*.026;
    }

    function frame(now){
      requestAnimationFrame(frame);

      if(document.hidden || body.classList.contains('is-entry-gate')){
        last = now;
        return;
      }

      if(now - lastPaint < depthFrameMs) return;
      lastPaint = now;
      const dt = Math.min((now-last)/1000,.04);
      last = now;

      updateCamera();
      ctx.clearRect(0,0,width,height);
      drawAtmosphere(now);

      const seconds = now/1000;

      for(const p of particles){
        p.phase += dt*p.pulseSpeed;
        p.x += p.vx*dt;
        p.y += p.vy*dt;
        wrap(p);

        const orbitX = Math.sin(seconds*p.orbitSpeed + p.phase)*p.orbitX;
        const orbitY = Math.cos(seconds*p.orbitSpeed*.83 + p.phase*.91)*p.orbitY;
        const px = p.x + orbitX + camera.x*p.depthFactor;
        const py = p.y + orbitY + camera.y*p.depthFactor;

        const pulse = .58 + (Math.sin(p.phase)+1)*.21;
        const a = p.alpha*pulse;

        if(p.kind === 'pin') drawPin(p,px,py,a);
        if(p.kind === 'dust') drawDust(p,px,py,a);
        if(p.kind === 'bokeh') drawBokeh(p,px,py,a);
        if(p.kind === 'mist') drawMist(p,px,py,a);
      }

      
    }

    window.addEventListener('pointermove', e => {
      if(!width || !height) return;
      pointerTarget.x = ((e.clientX/width)-.5)*2;
      pointerTarget.y = ((e.clientY/height)-.5)*2;
    }, { passive:true });

    document.documentElement.addEventListener('mouseleave', () => {
      pointerTarget.x = 0;
      pointerTarget.y = 0;
    });

    resize();
    window.addEventListener('resize',resize,{ passive:true });
    requestAnimationFrame(frame);
  }

  try{
    initDepthCanvas();
  }catch(error){
    console.warn('Depth canvas disabled:',error);
  }

  /* =====================================================
     RECORD CONTINUOUS ROTATION
  ====================================================== */
  function animateRecord(now){
    if(document.hidden || body.classList.contains('is-entry-gate')){
      lastFrame = now;
      requestAnimationFrame(animateRecord);
      return;
    }

    const dt = Math.min((now-lastFrame)/1000,.05);
    lastFrame = now;

    recordRotation += (spinVelocity*dt) + (spinImpulse*dt);
    spinImpulse *= Math.pow(.085,dt);

    record.style.transform = `rotate(${recordRotation}deg)`;

    /* frame-rate 독립형 보간.
       커서보다 살짝 늦게 따라오므로 고정 spotlight가 아니라 LP 표면 반사처럼 느껴진다. */
    const follow = 1 - Math.exp(-18*dt);
    const fade = 1 - Math.exp(-16*dt);

    recordHoverLight.x += (recordHoverLight.targetX - recordHoverLight.x) * follow;
    recordHoverLight.y += (recordHoverLight.targetY - recordHoverLight.y) * follow;
    recordHoverLight.strength += (recordHoverLight.targetStrength - recordHoverLight.strength) * fade;

    recordHoverLight.mirrorX = 100 - recordHoverLight.x;
    recordHoverLight.mirrorY = 100 - recordHoverLight.y;

    recordButton.style.setProperty('--hover-x', `${recordHoverLight.x.toFixed(2)}%`);
    recordButton.style.setProperty('--hover-y', `${recordHoverLight.y.toFixed(2)}%`);
    recordButton.style.setProperty('--hover-mirror-x', `${recordHoverLight.mirrorX.toFixed(2)}%`);
    recordButton.style.setProperty('--hover-mirror-y', `${recordHoverLight.mirrorY.toFixed(2)}%`);
    recordButton.style.setProperty('--hover-strength', recordHoverLight.strength.toFixed(3));

    requestAnimationFrame(animateRecord);
  }

  renderOrbit();
  selectCategory(0,false,null);
  requestAnimationFrame(animateRecord);

  if(!isEntryGateActive()){
    startIntro();
  }
})();
