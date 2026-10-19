/* =========================================================
   02. ALL WORKS — categories / search / incremental display
   ========================================================= */
(() => {
 const {projects,card,matches}=window.Portfolio;
 const list=document.getElementById('work-list');
 const more=document.getElementById('load-more');
 const search=document.getElementById('work-search');
 const filters=[...document.querySelectorAll('[data-work-filter]')];
 const step=12;let category='all',limit=step;
 function render(){
  const found=projects.filter(p=>matches(p,category,search.value));
  const shown=found.slice(0,limit);
  list.innerHTML=shown.map(card).join('');
  document.getElementById('archive-total').textContent=projects.length;
  document.getElementById('archive-result').textContent=`${found.length}개 작업 · ${shown.length}개 표시`;
  document.getElementById('archive-empty').hidden=found.length>0;
  more.hidden=limit>=found.length;
  more.innerHTML=`작업 더 보기 <span>${found.length-shown.length}개 남음 ＋</span>`;
 }
 filters.forEach(button=>button.addEventListener('click',()=>{
  category=button.dataset.workFilter;limit=step;
  filters.forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
  render();
 }));
 search.addEventListener('input',()=>{limit=step;render();});
 more.addEventListener('click',()=>{
  const before=list.querySelectorAll('.work-card').length;
  limit+=step;render();
  const firstNew=list.querySelectorAll('.work-card-link')[before];
  if(firstNew)firstNew.focus({preventScroll:true});
 });
 document.querySelectorAll('[data-project-open]').forEach(button=>button.addEventListener('click',()=>{
  location.href='project.html?id='+encodeURIComponent(button.dataset.projectOpen);
 }));
 render();window.Portfolio.ready.then(render);
})();
