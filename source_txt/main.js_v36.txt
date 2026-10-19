/* =========================================================
   01. ENTRANCE → EXISTING INTRO → MAIN
   First visit gets the entrance; returning from work goes straight to the main.
   ========================================================= */
(() => {
 const arrival=document.getElementById('arrival'),intro=document.querySelector('.intro'),shell=document.getElementById('site-shell');
 if(!arrival||!intro||!shell)return;
 const enter=document.querySelector('.intro-enter'),skip=document.querySelector('.intro-skip'),replay=document.querySelector('.intro-replay'),arrivalSkip=document.getElementById('arrival-skip');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),storageKey='seokhee-portfolio-entered-v34';let state='arrival',timer=0;
 const cancel=()=>{clearTimeout(timer);timer=0;};
 function showIntro(){cancel();state='intro';arrival.hidden=true;intro.hidden=false;intro.inert=false;enter.disabled=false;intro.classList.remove('is-revealing');document.body.classList.remove('arrival-active');document.getElementById('intro-title').focus({preventScroll:true});}
 function arrive(){cancel();state='arrival';intro.hidden=false;intro.inert=true;enter.disabled=true;intro.classList.remove('is-leaving');shell.inert=true;shell.classList.remove('main-preview');document.body.classList.add('intro-active');document.dispatchEvent(new Event('portfolio:intro'));scrollTo({top:0,behavior:'instant'});if(reduced.matches){showIntro();return;}arrival.hidden=false;document.body.classList.add('arrival-active');intro.classList.add('is-revealing');arrival.focus({preventScroll:true});timer=setTimeout(showIntro,1600);}
 function finish(){cancel();state='main';arrival.hidden=true;intro.hidden=true;intro.inert=false;shell.inert=false;enter.disabled=false;intro.classList.remove('is-revealing','is-leaving');document.body.classList.remove('intro-active','arrival-active');shell.classList.remove('main-preview');try{sessionStorage.setItem(storageKey,'1');}catch{}document.getElementById('hero-title').focus({preventScroll:true});document.dispatchEvent(new Event('portfolio:entered'));}
 enter.addEventListener('click',()=>{if(state!=='intro')return;if(reduced.matches){finish();return;}state='main-transition';enter.disabled=true;shell.classList.add('main-preview');intro.classList.add('is-leaving');timer=setTimeout(finish,400);});
 arrivalSkip.addEventListener('click',()=>{if(state==='arrival')showIntro();});skip.addEventListener('click',finish);replay.addEventListener('click',arrive);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(state==='arrival')showIntro();else if(state!=='main')finish();}});
 reduced.addEventListener('change',()=>{if(reduced.matches){if(state==='arrival')showIntro();else if(state==='main-transition')finish();}});
 let seen=false;try{seen=sessionStorage.getItem(storageKey)==='1';}catch{}
 if(location.hash||seen){finish();if(location.hash)requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior:'auto'}));}else arrive();
})();
/* =========================================================
   02. FULL ARCHIVE — folders are the source, search and pagination stay intact
   ========================================================= */
(() => {
 if(!window.Portfolio)return;const {projects,card,matches}=window.Portfolio;
 const list=document.getElementById('work-list'),more=document.getElementById('load-more'),search=document.getElementById('work-search');if(!list||!more||!search)return;
 const filters=[...document.querySelectorAll('[data-work-filter]')];let category='all',limit=12;
 function render(){const found=projects.filter(p=>matches(p,category,search.value));list.innerHTML=found.slice(0,limit).map(card).join('');document.getElementById('archive-total').textContent=projects.length;document.getElementById('archive-result').textContent=`${found.length}개 작업 · ${Math.min(limit,found.length)}개 표시`;document.getElementById('archive-empty').hidden=!!found.length;more.hidden=limit>=found.length;more.innerHTML=`작업 더 보기 <span>${Math.max(0,found.length-limit)}개 남음 ＋</span>`;}
 filters.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.workFilter;limit=12;filters.forEach(other=>other.setAttribute('aria-pressed',String(other===button)));render();}));search.addEventListener('input',()=>{limit=12;render();});more.addEventListener('click',()=>{const before=list.querySelectorAll('.work-card').length;limit+=12;render();list.querySelectorAll('.work-card-link')[before]?.focus({preventScroll:true});});render();window.Portfolio.ready.then(render);
})();
/* =========================================================
   03. SCROLL REVEALS — content remains visible when JavaScript or motion is off
   ========================================================= */
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),reveals=document.querySelectorAll('.reveal');let started=false;
 if('IntersectionObserver'in window&&!reduced.matches)document.documentElement.classList.add('motion-ready');
 function start(){if(started)return;started=true;if(!('IntersectionObserver'in window)||reduced.matches){reveals.forEach(el=>el.classList.add('is-visible'));return;}const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('is-visible');}),{threshold:.06});reveals.forEach(el=>observer.observe(el));}
 document.addEventListener('portfolio:entered',start);if(!document.body.classList.contains('intro-active'))start();reduced.addEventListener('change',()=>{if(reduced.matches){document.documentElement.classList.remove('motion-ready');reveals.forEach(el=>el.classList.add('is-visible'));}});
})();
