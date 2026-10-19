/* 01. Initialization and motion preferences */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hero=$('.hero'), header=$('#siteHeader'), panel=$('#mobilePanel'), menu=$('#menuBtn');
  const modal=$('#consultModal'), form=$('#consultForm'), success=$('#formSuccess');
  let opener=null;
  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('motion-ready');
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting) entry.target.classList.add('is-visible');
      
    }),{threshold:0,rootMargin:'0px 0px -50px 0px'});
    document.querySelectorAll('.reveal-section,.reveal').forEach(el=>observer.observe(el));
  }
  requestAnimationFrame(()=>requestAnimationFrame(()=>hero?.classList.add('is-ready')));
  /* 02. Header, progress and hero parallax */
  let lastY=scrollY, queued=false;
  const updateScroll=()=>{
    const y=scrollY,max=document.documentElement.scrollHeight-innerHeight;
    const progress=$('.page-progress span');
    if(progress) progress.style.width=`${max?y/max*100:0}%`;
    header?.classList.toggle('is-scrolled',y>20);
    if(!panel?.classList.contains('is-open')){
      if(y>180&&y>lastY+4) header?.classList.add('is-hidden');
      else if(y<lastY-4||y<180) header?.classList.remove('is-hidden');
    }
    $('#heroVisual img')?.style.setProperty('--scrollY',`${reduced.matches?0:Math.min(y*.025,12)}px`);
    lastY=y;queued=false;
  };
  addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(updateScroll)}},{passive:true});
  updateScroll();
  /* 03. Mobile navigation and keyboard focus */
  const setMenu=open=>{
    if(!panel||!menu)return;
    panel.classList.toggle('is-open',open);panel.inert=!open;
    panel.setAttribute('aria-hidden',String(!open));menu.setAttribute('aria-expanded',String(open));
    menu.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');
    document.body.style.overflow=open?'hidden':'';header?.classList.remove('is-hidden');
    const bars=menu.querySelectorAll('i');
    bars[0].style.transform=open?'translateY(3px) rotate(45deg)':'';
    bars[1].style.transform=open?'translateY(-3px) rotate(-45deg)':'';
    if(open)panel.querySelector('a')?.focus();else menu.focus();
  };
  if(panel)panel.inert=true;
  menu?.addEventListener('click',()=>setMenu(!panel.classList.contains('is-open')));
  panel?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  addEventListener('keydown',e=>{
    if(!panel?.classList.contains('is-open'))return;
    if(e.key==='Escape')setMenu(false);
    if(e.key==='Tab'){
      const items=[menu,...panel.querySelectorAll('a,button')];const i=items.indexOf(document.activeElement);
      if((e.shiftKey&&i===0)||(!e.shiftKey&&i===items.length-1)){e.preventDefault();items[e.shiftKey?items.length-1:0].focus()}
    }
  });
  addEventListener('resize',()=>{if(innerWidth>1050&&panel?.classList.contains('is-open'))setMenu(false)});
  document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
    const filter=button.dataset.filter;let count=0;
    document.querySelectorAll('[data-filter]').forEach(x=>{const active=x===button;x.classList.toggle('is-active',active);x.setAttribute('aria-pressed',String(active))});
    document.querySelectorAll('.event-list-body .event-card').forEach(card=>{card.hidden=filter!=='전체'&&card.dataset.category!==filter;if(!card.hidden)count++});
    const label=document.querySelector('#eventResultCount');if(label)label.textContent=count;
  }));
  /* 04. Native touch gallery and button controls */
  const gallery=$('.surgery-track-wrap'),prev=$('#surgeryPrev'),next=$('#surgeryNext');
  const syncGallery=()=>{
    if(!gallery)return;const max=gallery.scrollWidth-gallery.clientWidth;
    if(prev)prev.disabled=gallery.scrollLeft<=2;if(next)next.disabled=gallery.scrollLeft>=max-2;
  };
  const slide=direction=>{
    if(!gallery)return;const card=$('.surgery-card'),gap=parseFloat(getComputedStyle($('#surgeryTrack')).gap);
    gallery.scrollBy({left:direction*(card.getBoundingClientRect().width+gap),behavior:reduced.matches?'instant':'smooth'});
  };
  prev?.addEventListener('click',()=>slide(-1));next?.addEventListener('click',()=>slide(1));
  gallery?.addEventListener('scroll',syncGallery,{passive:true});addEventListener('resize',syncGallery);syncGallery();
  /* 05. Demo consultation — no network submission */
  const openModal=e=>{
    e.preventDefault();opener=e.currentTarget;
    if(panel?.classList.contains('is-open'))setMenu(false);
    form?.reset();const selected=e.currentTarget.dataset.treatment;if(selected&&form)form.querySelector('select').value=selected;if(form)form.style.display='grid';if(success)success.style.display='none';modal?.showModal();
  };
  document.querySelectorAll('[data-open-consult],[data-treatment-consult]').forEach(el=>el.addEventListener('click',openModal));
  $('#modalClose')?.addEventListener('click',()=>modal.close());
  modal?.addEventListener('click',e=>{
    const r=modal.getBoundingClientRect();
    if(e.target===modal&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))modal.close();
  });
  modal?.addEventListener('close',()=>opener?.focus());
  form?.addEventListener('submit',e=>{
    e.preventDefault();form.style.display='none';success.style.display='block';success.tabIndex=-1;success.focus();
  });
})();
