(() => {
  const root = document.getElementById('projectDetail');
  const all = Array.isArray(window.PORTFOLIO_PROJECTS)
    ? window.PORTFOLIO_PROJECTS
    : [];

  const id = new URLSearchParams(location.search).get('id');
  const foundIndex = all.findIndex(x => String(x.id) === String(id));
  const currentIndex = foundIndex >= 0 ? foundIndex : 0;
  const p = all[currentIndex];

  function esc(value){
    return String(value ?? '')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#039;');
  }

  function contributionHTML(items){
    return (items || []).map((item,index) => `
      <div class="contribution-row contribution-row--text">
        <span class="contribution-row__no">${String(index+1).padStart(2,'0')}</span>
        <strong class="contribution-row__label">${esc(item.label)}</strong>
        <span class="contribution-row__value">${esc(item.value || '')}</span>
      </div>
    `).join('');
  }

  if(!p){
    root.innerHTML = '<p>등록된 프로젝트가 없습니다.</p>';
    return;
  }

  root.classList.toggle('is-narrow-project', p.layout === 'narrow');
  document.title = `${p.title} — YOON SEOK HEE`;

  const prev = all[(currentIndex - 1 + all.length) % all.length] || p;
  const next = all[(currentIndex + 1) % all.length] || p;
  const contributions = Array.isArray(p.contribution) ? p.contribution : [];
  const keyWorks = Array.isArray(p.keyWorks) ? p.keyWorks : [];

  root.innerHTML = `
    <section class="detail-hero">
      <div>
        <span class="section-label">${esc(p.number || p.categoryLabel)}</span>
        <h1>${esc(p.title)}</h1>
      </div>

      <div class="detail-meta">
        <div class="meta-item">
          <span>TYPE</span>
          <strong>${esc(p.type || '-')}</strong>
        </div>

        <div class="meta-item">
          <span>PROJECT</span>
          <strong>${esc(p.number || '-')}</strong>
        </div>

        <div class="meta-item">
          <span>CATEGORY</span>
          <strong>${esc(p.categoryLabel || '-')}</strong>
        </div>

        <div class="meta-item">
          <span>TOOLS</span>
          <strong>${esc(p.tools || '-')}</strong>
        </div>
      </div>
    </section>

    <img class="detail-cover" src="${esc(p.cover)}" alt="${esc(p.imageAlt || p.title)} 대표 이미지">

    ${p.externalLink ? `
      <div class="detail-external-wrap">
        <a class="detail-external-link" href="${esc(p.externalLink)}" target="_blank" rel="noopener noreferrer">
          VISIT LIVE SITE <span>↗</span>
        </a>
      </div>
    ` : ''}

    <section class="detail-copy">
      <h2>${esc(p.overviewTitle || 'OVERVIEW')}</h2>
      <p>${esc(p.description || '')}</p>
    </section>

    <section class="detail-insights">
      <div class="detail-insights-head">
        <h2>Contribution</h2>
        <p>
          ${esc(
            p.contributionNote ||
            '원본 포트폴리오의 TYPE 정보에 명시된 작업 범위를 기준으로 정리했습니다.'
          )}
        </p>
      </div>

      ${contributions.length ? `
        <div class="contribution-list">
          ${contributionHTML(contributions)}
        </div>
      ` : ''}

      ${(p.workPoint || keyWorks.length) ? `
        <div class="detail-thinking-grid">
          ${p.workPoint ? `
            <article class="detail-thinking detail-thinking--wide">
              <span>01 / ${esc(p.workPointTitle || 'WORK POINT')}</span>
              <h3>${esc(p.workPointTitle || 'Work Point')}</h3>
              <p>${esc(p.workPoint)}</p>
            </article>
          ` : ''}

          ${keyWorks.length ? `
            <article class="detail-thinking detail-thinking--wide">
              <span>02 / TOOLS</span>
              <h3>Tools & Workflow</h3>
              <div class="key-work-list">
                ${keyWorks.map(v => `<em>${esc(v)}</em>`).join('')}
              </div>
            </article>
          ` : ''}
        </div>
      ` : ''}
    </section>

    <section class="detail-gallery">
      ${(p.images || []).map((src,index) => `
        <figure>
          <img
            src="${esc(src)}"
            alt="${esc(p.imageAlt || p.title)} ${index+1}"
            loading="${index === 0 ? 'eager' : 'lazy'}"
            decoding="async"
          >
          <figcaption>
            <span>PROJECT VIEW</span>
            <span>${String(index+1).padStart(2,'0')} / ${String((p.images || []).length).padStart(2,'0')}</span>
          </figcaption>
        </figure>
      `).join('')}
    </section>

    <nav class="detail-project-nav" aria-label="다른 프로젝트 보기">
      <a href="project.html?id=${encodeURIComponent(prev.id)}">
        <small>← PREV PROJECT</small>
        <strong>${esc(prev.title)}</strong>
      </a>

      <a class="detail-project-nav__all" href="projects.html">
        ALL PROJECTS
      </a>

      <a href="project.html?id=${encodeURIComponent(next.id)}">
        <small>NEXT PROJECT →</small>
        <strong>${esc(next.title)}</strong>
      </a>
    </nav>
  `;
})();
