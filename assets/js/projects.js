(() => {
  const listEl = document.getElementById('projectList');
  const filtersEl = document.getElementById('projectFilters');
  const countEl = document.getElementById('projectsCount');
  const summaryEl = document.getElementById('projectsSummary');
  const labelEl = document.getElementById('projectArchiveLabel');

  const all = Array.isArray(window.PORTFOLIO_PROJECTS)
    ? window.PORTFOLIO_PROJECTS
    : [];

  const labels = {
    all:'ALL',
    web:'WEB DESIGN',
    ecommerce:'SHOP DESIGN',
    detail:'DETAIL PAGE',
    graphic:'GRAPHIC DESIGN'
  };

  function esc(value){
    return String(value ?? '')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#039;');
  }

  function card(p){
    return `
      <a class="archive-card" href="project.html?id=${encodeURIComponent(p.id)}">
        <div class="project-thumb">
          <img src="${esc(p.thumbnail)}" alt="${esc(p.imageAlt || p.title)}">
        </div>

        <h2>${esc(p.title)}</h2>

        <div class="archive-meta">
          ${p.number ? `<span>${esc(p.number)}</span><span>·</span>` : ''}
          <span>${esc(p.categoryLabel)}</span>
          <span>·</span>
          <span>${esc(p.type)}</span>
          <span class="archive-meta__view">VIEW PROJECT ↗</span>
        </div>
      </a>
    `;
  }

  const counts = all.reduce((acc,p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const cats = ['all',...new Set(all.map(p => p.category))];

  filtersEl.innerHTML = cats.map(c => {
    const count = c === 'all' ? all.length : (counts[c] || 0);

    return `
      <button class="filter-btn" type="button" data-category="${esc(c)}">
        ${esc(labels[c] || c)}
        <span class="filter-count">${String(count).padStart(2,'0')}</span>
      </button>
    `;
  }).join('');

  if(summaryEl){
    summaryEl.textContent = 'WEB / SHOP DESIGN / DETAIL / GRAPHIC · ORIGINAL PORT2 ARCHIVE';
  }

  function render(category){
    const list = category === 'all'
      ? all
      : all.filter(p => p.category === category);

    listEl.innerHTML = list.map(card).join('');

    [...filtersEl.children].forEach(btn => {
      btn.classList.toggle('is-active',btn.dataset.category === category);
    });

    if(countEl){
      countEl.textContent = `${String(list.length).padStart(2,'0')} WORKS`;
    }

    if(labelEl){
      labelEl.textContent = category === 'all'
        ? 'ALL PROJECTS'
        : (labels[category] || category);
    }

    const url = new URL(location.href);
    if(category === 'all') url.searchParams.delete('category');
    else url.searchParams.set('category',category);

    try{
      history.replaceState(null,'',url.href);
    }catch(e){}
  }

  filtersEl.addEventListener('click',e => {
    const btn = e.target.closest('button');
    if(btn) render(btn.dataset.category);
  });

  const requested = new URLSearchParams(location.search).get('category');
  render(cats.includes(requested) ? requested : 'all');
})();
