/* =========================================================
   01. VISUAL COMPOSITIONS — actual pages and supplied project assets
   ========================================================= */
(() => {
 const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const chrome=label=>`<div class="preview-chrome" aria-hidden="true"><i></i><i></i><i></i><span>${e(label)}</span></div>`;
 function artwork(p){
  if(p.id==='lune')return `<div class="preview-wall visual-lune"><div class="website-preview">${chrome('LUNE · WEBSITE')}<div class="live-preview"><img class="preview-fallback" src="${e(p.thumbnail)}" alt="LUNE 메인 비주얼"><iframe data-preview-src="projects/lune/site/index.html" title="LUNE 홈페이지 화면 미리보기" tabindex="-1" aria-hidden="true" loading="lazy" inert></iframe></div></div><div class="poster-stack" aria-hidden="true"><img src="projects/lune/site/assets/images/promotion-spring-thumbnail.jpg" alt=""><img src="projects/lune/site/assets/images/promotion-lifting-thumbnail.jpg" alt=""></div></div>`;
  if(p.id==='korweb')return `<div class="preview-wall visual-korweb"><div class="website-preview">${chrome('KORiNKLE · WEBSITE')}<div class="website-capture"><img src="projects/korweb/main.jpg" alt="코링클 홈페이지 실제 메인 화면"></div></div></div>`;
  if(p.id==='lune-promotions')return `<div class="promotion-wall"><figure><img src="projects/lune/site/assets/images/promotion-lifting-thumbnail.jpg" alt="가을 리프팅 프로모션"><figcaption>AUTUMN</figcaption></figure><figure><img src="projects/lune/site/assets/images/promotion-spring-thumbnail.jpg" alt="봄 뷰티 프로모션"><figcaption>SPRING</figcaption></figure><figure><img src="projects/lune/site/assets/images/promotion-bridal-thumbnail.jpg" alt="웨딩 뷰티 프로모션"><figcaption>BRIDAL</figcaption></figure></div>`;
  if(p.heroImages?.length)return window.Portfolio.heroes(p,'featured-hero-trio');
  return `<div class="preview-wall visual-generic"><div class="website-preview">${chrome(p.title)}<div class="website-capture"><img src="${e(p.thumbnail||p.cover)}" alt="${e(p.imageAlt||p.title)}"></div></div></div>`;
 }
 function slide(p,i,mode='focus',slot='off'){return `<article class="showcase-slide art-${e(p.id)}" data-project="${e(p.id)}" data-slot="${slot}" ${slot==='off'?'hidden':''}><a class="showcase-art" href="project.html?id=${encodeURIComponent(p.id)}" aria-label="${e(p.title)} 프로젝트 보기">${artwork(p)}</a></article>`;}
 function caption(p,i,total){return `<div class="caption-project"><p>${e(p.categoryLabel||p.featureKicker)}</p><h3>${e(p.title)}</h3><span class="caption-role">${e(p.role||p.creditSummary)}${p.projectKind?' · 개인 프로젝트':''}</span></div><a class="caption-open" href="project.html?id=${encodeURIComponent(p.id)}">프로젝트 보기 <span aria-hidden="true">↗</span></a>`;}
 function selector(p,i,active){return `<button type="button" class="showcase-selector" data-select="${i}" aria-pressed="${active}">${e(p.title)}</button>`;}
 window.PortfolioShowcase={slide,caption,selector};
 const stage=document.getElementById('showcase-stage'),captionRoot=document.getElementById('showcase-caption'),switches=document.getElementById('showcase-switches'),section=document.getElementById('selected-work');
 if(!stage||!captionRoot||!switches||!section||!window.Portfolio)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mode=document.body.dataset.layout||'focus';
 const play=document.getElementById('showcase-play'),count=document.getElementById('showcase-count'),announce=document.getElementById('showcase-announcement');
 const interval=5000;let items=[],active=0,timer=0,cleanup=0,paused=reduced.matches,keyboard=false,visible=true,entered=!document.body.classList.contains('intro-active'),catalog='';
 function fitFrames(){stage.querySelectorAll('.live-preview').forEach(node=>{const w=node.getBoundingClientRect().width;if(!w)return;const frame=node.querySelector('iframe'),scale=w/1600;node.style.setProperty('--preview-scale',scale);frame.style.height=Math.max(700,Math.round(node.getBoundingClientRect().height/scale))+'px';});}
 function loadVisibleFrames(){stage.querySelectorAll('.showcase-slide:not([hidden]) iframe[data-preview-src]').forEach(frame=>{if(!frame.getAttribute('src')){frame.addEventListener('load',()=>frame.parentElement.classList.add('is-ready'),{once:true});frame.setAttribute('src',frame.dataset.previewSrc);}});requestAnimationFrame(fitFrames);}
 function updatePlay(){play.setAttribute('aria-pressed',String(paused));play.setAttribute('aria-label',paused?'자동 전환 재생':'자동 전환 일시정지');play.innerHTML=paused?'<span aria-hidden="true">▷</span> 재생':'<span aria-hidden="true">Ⅱ</span> 일시정지';}
 function schedule(){clearTimeout(timer);section.classList.remove('is-running');const running=!paused&&!keyboard&&visible&&entered&&!document.hidden&&items.length>1;const bar=document.getElementById('showcase-progress');if(bar){bar.style.animation='none';void bar.offsetWidth;if(running)bar.style.animation='selector-cycle '+interval+'ms linear both';}if(running){section.classList.add('is-running');timer=setTimeout(()=>show(active+1,false),interval);}}
 function show(index,manual=false){
  if(!items.length)return;clearTimeout(cleanup);const previous=active;active=(index+items.length)%items.length;
  [...stage.children].forEach((node,i)=>{
   let slot='off';if(i===active)slot='active';else if(mode==='gallery'&&i===(active-1+items.length)%items.length)slot='previous';else if(mode==='gallery'&&i===(active+1)%items.length)slot='next';
   node.classList.remove('is-exiting');node.dataset.slot=slot;node.hidden=slot==='off';
   if(mode==='focus'&&i===previous&&previous!==active){node.hidden=false;node.classList.add('is-exiting');}
  });
  if(mode==='focus'&&previous!==active)cleanup=setTimeout(()=>{[...stage.children].forEach((node,i)=>{if(i!==active){node.hidden=true;node.classList.remove('is-exiting');}});},650);
  captionRoot.innerHTML=caption(items[active],active,items.length);switches.querySelectorAll('[data-select]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===active)));count.textContent=String(active+1).padStart(2,'0')+' / '+String(items.length).padStart(2,'0');if(manual)announce.textContent=items[active].title;loadVisibleFrames();schedule();document.dispatchEvent(new Event('portfolio:showcasechange'));
 }
 let frameObserver;
 function populate(){const fresh=Portfolio.projects.filter(p=>p.featured).sort((a,b)=>(a.featuredOrder??99)-(b.featuredOrder??99));const key=JSON.stringify(fresh);if(key===catalog)return;catalog=key;items=fresh;if(!items.length){section.hidden=true;clearTimeout(timer);return;}section.hidden=false;stage.innerHTML=items.map((p,i)=>slide(p,i,mode,i===0?'active':mode==='gallery'&&i===items.length-1?'previous':mode==='gallery'&&i===1?'next':'off')).join('');switches.innerHTML=items.map((p,i)=>selector(p,i,i===0)).join('');active=0;show(0);if('ResizeObserver'in window){frameObserver?.disconnect();frameObserver=new ResizeObserver(fitFrames);frameObserver.observe(stage);}}
 document.getElementById('showcase-prev').addEventListener('click',()=>show(active-1,true));document.getElementById('showcase-next').addEventListener('click',()=>show(active+1,true));
 switches.addEventListener('click',event=>{const button=event.target.closest('[data-select]');if(button)show(Number(button.dataset.select),true);});play.addEventListener('click',()=>{paused=!paused;if(!paused)keyboard=false;updatePlay();schedule();});
 stage.addEventListener('click',event=>{if(mode!=='gallery')return;const card=event.target.closest('.showcase-slide');if(card&&['previous','next'].includes(card.dataset.slot)){event.preventDefault();show(active+(card.dataset.slot==='next'?1:-1),true);}});
 // Mouse hover and mouse clicks do not stop automatic rotation. Keyboard reading does.
 const readingTarget=target=>target&&section.contains(target)&&!target.closest('.showcase-introduction')&&target.matches(':focus-visible');
 section.addEventListener('focusin',event=>{if(readingTarget(event.target)){keyboard=true;schedule();}});section.addEventListener('focusout',()=>requestAnimationFrame(()=>{keyboard=!!readingTarget(document.activeElement);schedule();}));
 section.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();show(active+(event.key==='ArrowRight'?1:-1),true);}});
 let touch=null;stage.addEventListener('touchstart',event=>{touch=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY}:null;},{passive:true});stage.addEventListener('touchend',event=>{if(!touch)return;const t=event.changedTouches[0],dx=t.clientX-touch.x,dy=t.clientY-touch.y;touch=null;if(Math.abs(dx)>48&&Math.abs(dy)<40)show(active+(dx<0?1:-1),true);},{passive:true});
 document.addEventListener('portfolio:entered',()=>{entered=true;loadVisibleFrames();schedule();});document.addEventListener('portfolio:intro',()=>{entered=false;schedule();});document.addEventListener('visibilitychange',schedule);window.addEventListener('resize',fitFrames);
 reduced.addEventListener('change',()=>{if(reduced.matches)paused=true;updatePlay();schedule();});
 if('IntersectionObserver'in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.12}).observe(section);
 populate();Portfolio.ready.then(populate);updatePlay();
})();
