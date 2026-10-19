/* =========================================================
   01. PROJECT DATA — same projects/<id>/project.json registration
   ========================================================= */
(() => {
 const legacy=Array.isArray(window.PORTFOLIO_PROJECTS)?window.PORTFOLIO_PROJECTS:[];
 const snapshot=Array.isArray(window.PORTFOLIO_SNAPSHOT)?window.PORTFOLIO_SNAPSHOT:[];
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const url=v=>{const s=String(v||'').trim();return /^(?:javascript|data|vbscript):/i.test(s)?'':s;};
 const strip=v=>String(v||'').replace(/<br\s*\/?\s*>/gi,' ').replace(/<[^>]*>/g,'').trim();
 function asset(v,folder){
  const s=url(v);if(!s)return '';
  if(/^(?:https?:)?\/\//i.test(s)||s.startsWith('#'))return s;
  if(/^(?:projects|images|assets)\//.test(s))return s;
  return new URL(s,'https://portfolio.invalid/projects/'+folder+'/').pathname.slice(1);
 }
 function normalize(raw,folder){
  const base=legacy.find(p=>p.id===folder)||{};
  const cats=Array.isArray(raw.category)?raw.category.map(x=>String(x).toLowerCase()):[String(raw.category||'').toLowerCase()];
  const category=['detail','graphic','ecommerce'].find(x=>cats.includes(x))||base.category||(cats.includes('web')?'web':'web');
  const images=Array.isArray(raw.images)?raw.images.map(x=>asset(x,folder)):[...(base.images||[])];
  if(!Array.isArray(raw.images)&&raw.mainImage){const main=asset(raw.mainImage,folder);if(images.length)images[0]=main;else images.push(main);}
  const variants=(raw.variants||[]).map(v=>({...v,image:asset(v.image,folder)}));
  const p={...base,...raw,id:folder,title:strip(raw.projectName||base.title||raw.title||folder),originalTitle:strip(raw.title||base.originalTitle||''),category,
   categoryLabel:raw.categoryLabel||base.categoryLabel||({web:'WEB DESIGN',detail:'DETAIL DESIGN',graphic:'PROMOTION DESIGN',ecommerce:'SHOP DESIGN'}[category]),
   description:raw.overviewText??raw.description??base.description??'',workPoint:raw.workPointText??raw.workPoint??base.workPoint??'',
   originalImages:(raw.originalImages||[]).map(v=>asset(v,folder)),thumbnail:asset(raw.thumbnail||base.thumbnail,folder),cover:asset(raw.cover||raw.thumbnail||base.cover||raw.mainImage,folder),
   websiteImage:asset(raw.websiteImage||raw.thumbnail||raw.mainImage||base.thumbnail,folder),
   heroImages:(raw.heroImages||[]).map(v=>({...v,image:asset(v.image,folder)})),
   externalLink:asset(raw.link??raw.externalLink??base.externalLink,folder),images:[...new Set(images)],variants,
   relatedLinks:(raw.relatedLinks||[]).map(v=>({...v,url:asset(v.url,folder)})),
   keyWorks:raw.keyWorks||base.keyWorks||String(raw.tools||'').split(' · ').filter(Boolean),
   contribution:raw.contribution||base.contribution||[],creditSummary:raw.creditSummary||raw.role||base.creditSummary||raw.type||'',
   imageAlt:raw.imageAlt||base.imageAlt||raw.projectName||folder,layout:raw.layout||base.layout||'wide'};
  if(variants.length&&!raw.images)p.images=[];
  return p;
 }
 const projects=snapshot.length?snapshot.map(v=>normalize(v.data,v.folder)):[...legacy];
 const heroes=(p,extra='')=>`<div class="hero-trio detail-image-trio ${extra}" role="img" aria-label="${esc(p.title)} · ${esc(p.heroImages.map(v=>v.label).join(' · '))}">${p.heroImages.map(v=>`<figure class="hero-card"><div class="image-hero" style="--detail-art-bg:${/^#[0-9a-f]{6}$/i.test(v.background||'')?v.background:'#f4f6fc'}"><img src="${esc(url(v.image))}" width="${Number(v.width)||70}" height="${Number(v.height)||150}" alt="${esc(v.label)} 이미지형 상세페이지 메인 히어로" loading="lazy" decoding="async"></div><figcaption>${esc(v.label).replace('버터향김치','버터향<wbr>김치').replace('스윗불고기','스윗<wbr>불고기').replace('&amp;','<wbr>&amp;')}</figcaption></figure>`).join('')}</div>`;
 /* Website cards link directly to the live site; unregistered sites open their saved screen. */
 const isWebsite=p=>['web','ecommerce'].includes(p.category);
 const siteAction=p=>{
  if(!isWebsite(p))return null;
  const href=url(p.externalLink);if(href)return {href,label:'사이트 보기'};
  const image=url(p.websiteImage||p.cover||p.thumbnail);return image?{href:image,label:'화면 보기'}:null;
 };
 const visual=p=>p.heroImages?.length?`<div class="ysh-project-visual archive-image archive-hero-previews">${heroes(p,'archive-hero-trio')}</div>`:`<div class="ysh-project-visual archive-image${isWebsite(p)?' archive-website':''}"><img src="${esc(url(isWebsite(p)?p.websiteImage||p.thumbnail||p.cover:p.thumbnail||p.cover))}" alt="${esc(isWebsite(p)?p.title+' 웹사이트 화면':p.imageAlt||p.title)}" loading="lazy" decoding="async"></div>`;
 const card=p=>{
  const action=siteAction(p);
  return `<article class="work-card${action?' web-work-card':''}" data-project-id="${esc(p.id)}"><a class="work-card-link" href="project.html?id=${encodeURIComponent(p.id)}">${visual(p)}<div class="card-meta"><span>${esc(p.categoryLabel||p.category)}</span><span aria-hidden="true">↗</span></div><h3>${esc(p.title)}</h3><p class="card-role">${esc(p.creditSummary||p.role||p.type)}</p></a>${action?`<a class="site-visit card-site-link" href="${esc(action.href)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(p.title+' '+action.label+' (새 창)')}">${esc(action.label)} <span aria-hidden="true">↗</span></a>`:''}</article>`;
 };
 const matches=(p,c,q)=>{const term=q.trim().toLocaleLowerCase();return(c==='all'||p.category===c)&&(!term||[p.title,p.originalTitle,p.categoryLabel,p.role,p.tools].join(' ').toLocaleLowerCase().includes(term));};
 const api=window.Portfolio={projects,esc,url,visual,heroes,card,isWebsite,siteAction,matches,normalize,loadErrors:[]};
 api.ready=(async()=>{
  if(!/^https?:$/.test(location.protocol))return projects;
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),6000);
  try{
   const response=await fetch('projects/projects.json',{signal:controller.signal,cache:'no-cache'});if(!response.ok)throw new Error('Project list unavailable');
   const list=await response.json();if(!Array.isArray(list))throw new Error('Project list must be an array');
   const ids=[...new Set(list.map(v=>typeof v==='string'?v:v.id).filter(v=>/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(v)))];
   const results=await Promise.all(ids.map(async id=>{try{const r=await fetch('projects/'+encodeURIComponent(id)+'/project.json',{signal:controller.signal,cache:'no-cache'});if(!r.ok)throw new Error(id);return normalize(await r.json(),id);}catch(e){api.loadErrors.push(id);return projects.find(p=>p.id===id)||null;}}));
   projects.splice(0,projects.length,...results.filter(Boolean));
  }catch(e){api.loadErrors.push('projects/projects.json');}finally{clearTimeout(timer);}
  document.dispatchEvent(new Event('portfolio:projectsready'));return projects;
 })();
})();
