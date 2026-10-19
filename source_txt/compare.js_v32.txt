/* =========================================================
   01. Scale the supplied live website to each comparison thumbnail.
   ========================================================= */
(() => {
 const previews=[...document.querySelectorAll('.comparison-live')];
 function fit(){previews.forEach(node=>{const frame=node.querySelector('iframe');node.style.setProperty('--compare-scale',node.getBoundingClientRect().width/1600);frame.style.height='1000px';});}
 previews.forEach(node=>{const frame=node.querySelector('iframe');frame.addEventListener('load',()=>node.classList.add('is-ready'));});
 if('ResizeObserver'in window){const observer=new ResizeObserver(fit);previews.forEach(node=>observer.observe(node));}
 window.addEventListener('resize',fit);fit();
})();
