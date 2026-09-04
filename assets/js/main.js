(() => {
  const categories = [
    {
      id:'profile',
      no:'00',
      label:'ABOUT ME',
      desc:'브랜드 디자인부터 웹 퍼블리싱, 카페24 및 워드프레스 운영까지 실제 서비스 기반으로 작업하고 있습니다.',
      kind:'profile'
    },
    {
      id:'web',
      no:'01',
      label:'WEB DESIGN',
      desc:'웹사이트 기획 · 디자인 · 퍼블리싱'
    },
    {
      id:'ecommerce',
      no:'02',
      label:'E-COMMERCE',
      desc:'브랜드 이커머스 · 카페24 · 쇼핑 경험'
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
      desc:'브랜딩 · 편집 · 비주얼 그래픽'
    }
  ];

  const projects = Array.isArray(window.PORTFOLIO_PROJECTS)
    ? window.PORTFOLIO_PROJECTS
    : [];

  const body = document.body;
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


  let activeIndex = 1;
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
    return `
      <a class="home-work-card" href="project.html?id=${encodeURIComponent(p.id)}">
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
    const list = isProfile ? [] : projects.filter(p => p.category === cat.id).slice(0,2);
    const total = isProfile ? 1 : projects.filter(p => p.category === cat.id).length;

    const apply = () => {
      homeSelectedWorks.classList.toggle('is-profile', isProfile);
      homeSelectedCategory.textContent = isProfile ? 'YOON SEOK HEE' : cat.label;
      homeSelectedCount.textContent = isProfile ? '00' : String(total).padStart(2,'0');

      if(isProfile){
        homeSelectedAll.href = 'about.html';
        homeSelectedAll.innerHTML = 'VIEW FULL PROFILE <span>↗</span>';
        homeSelectedList.innerHTML = `
          <div class="home-profile-card">
            <span class="home-profile-role">WEB DESIGNER / PUBLISHER</span>
            <p>
              브랜드 디자인부터 웹 퍼블리싱,
              카페24 및 워드프레스 운영까지
              실제 서비스 기반으로 작업하고 있습니다.
            </p>

            <div class="home-profile-skills">
              <span>FIGMA</span>
              <span>PHOTOSHOP</span>
              <span>CAFE24</span>
              <span>WORDPRESS</span>
              <span>HTML / CSS / JS</span>
            </div>
          </div>
        `;

        if(recordHoverText){
          recordHoverText.textContent = 'VIEW FULL PROFILE';
        }
      }else{
        homeSelectedAll.href = `projects.html?category=${encodeURIComponent(cat.id)}`;
        homeSelectedAll.innerHTML = 'VIEW ALL PROJECTS <span>↗</span>';
        homeSelectedList.innerHTML = list.length
          ? list.map(sideCardHTML).join('')
          : '<p class="home-work-empty">등록된 작업물이 없습니다.</p>';

        if(recordHoverText){
          recordHoverText.textContent = `VIEW ALL ${cat.label}`;
        }
      }
    };

    if(!animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      apply();
      return;
    }

    homeSelectedWorks.getAnimations().forEach(a => a.cancel());

    homeSelectedWorks.animate(
      [
        { opacity:1, transform:'translateY(0)' },
        { opacity:0, transform:'translateY(-12px)' }
      ],
      {
        duration:180,
        easing:'cubic-bezier(.4,0,.6,1)',
        fill:'forwards'
      }
    ).finished.then(() => {
      apply();

      homeSelectedWorks.animate(
        [
          { opacity:0, transform:'translateY(18px)' },
          { opacity:1, transform:'translateY(0)' }
        ],
        {
          duration:500,
          easing:'cubic-bezier(.16,.86,.22,1)',
          fill:'both'
        }
      );

      [...homeSelectedList.querySelectorAll('.home-work-card')].forEach((card,i) => {
        card.animate(
          [
            { opacity:0, transform:'translateY(14px)' },
            { opacity:1, transform:'translateY(0)' }
          ],
          {
            duration:500,
            delay:80 + i*80,
            easing:'cubic-bezier(.16,.86,.22,1)',
            fill:'both'
          }
        );
      });
    }).catch(() => {
      apply();
    });
  }

  /* =====================================================
     CATEGORY ORBIT
  ====================================================== */
  function renderOrbit(){
    orbit.innerHTML = '';

    const radius = 51.8;
    const angles = [-42, -21, 0, 21, 42];

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

    if(cat && cat.kind === 'profile'){
      return;
    }

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
      PREVIEW PANEL OPEN:
      프로젝트 패널 내부의 기본 wheel / trackpad 스크롤을 그대로 허용한다.
      이전 버전은 여기서 먼저 preventDefault()를 실행해
      .preview-grid의 overflow-y:auto가 있어도 스크롤이 막혔다.
    */
    if(panel.classList.contains('is-open')){
      return;
    }

    /*
      HOME CLOSED STATE:
      이때만 브라우저 기본 스크롤을 막고 wheel을 레코드 회전에 사용한다.
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
    return window.matchMedia('(max-width:640px)').matches;
  }

  function syncGuide(){
    if(isMobile()){
      guideActionOne.textContent = 'SWIPE RECORD';
      
      
      
    }else{
      
      
      
      
    }
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
      for(let i=0;i<112;i++) particles.push(makeParticle('far'));
      for(let i=0;i<26;i++) particles.push(makeParticle('mid'));
      for(let i=0;i<8;i++) particles.push(makeParticle('near'));
    }

    function resize(){
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1,rect.width);
      height = Math.max(1,rect.height);
      dpr = Math.min(window.devicePixelRatio || 1,2);

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

      requestAnimationFrame(frame);
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
  selectCategory(1,false,null);
  requestAnimationFrame(animateRecord);
  startIntro();
})();
