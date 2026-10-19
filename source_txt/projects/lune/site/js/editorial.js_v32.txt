/* V15: one continuous page, light reveal only, no pinned campaign controller. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const header = $('#siteHeader');
  const menu = $('#menuBtn');
  const panel = $('#mobilePanel');
  const main = $('#main');
  const footer = $('.site-footer');
  const modal = $('#consultModal');
  const form = $('#consultForm');
  const success = $('#formSuccess');
  const topButton = $('#backToTop');
  let menuOverflow = '';
  let modalOverflow = '';
  let opener = null;

  /* Only an open menu or dialog temporarily locks the background page. */
  const setMenu = (open, restoreFocus = true) => {
    if (open) menuOverflow = document.body.style.overflow;
    panel.classList.toggle('is-open', open);
    panel.inert = !open;
    panel.setAttribute('aria-hidden', String(!open));
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    header.classList.toggle('menu-is-open', open);
    $('.desktop-nav').inert = open;
    $('.consult-btn').inert = open;
    main.inert = open;
    footer.inert = open;
    topButton.inert = open;
    document.body.style.overflow = open ? 'hidden' : menuOverflow;
    const bars = menu.querySelectorAll('i');
    bars[0].style.transform = open ? 'translateY(3.5px) rotate(45deg)' : '';
    bars[1].style.transform = open ? 'translateY(-3.5px) rotate(-45deg)' : '';
    if (open) panel.querySelector('a').focus();
    else if (restoreFocus) menu.focus();
  };
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  panel.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    setMenu(false, false);
    const target = $(link.hash);
    if (target) {
      target.tabIndex = -1;
      target.focus({preventScroll: true});
    }
  }));
  addEventListener('keydown', event => {
    if (menu.getAttribute('aria-expanded') !== 'true') return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setMenu(false);
    }
    if (event.key === 'Tab') {
      const items = [$('.site-header .brand'), menu, ...panel.querySelectorAll('a,button')];
      const index = items.indexOf(document.activeElement);
      if ((event.shiftKey && index === 0) || (!event.shiftKey && index === items.length - 1)) {
        event.preventDefault();
        items[event.shiftKey ? items.length - 1 : 0].focus();
      }
    }
  });

  const openModal = target => {
    opener = panel.contains(target) ? menu : target;
    if (menu.getAttribute('aria-expanded') === 'true') setMenu(false, false);
    form.reset();
    form.style.display = 'grid';
    success.style.display = 'none';
    const treatment = target.dataset.treatment;
    if (treatment && [...form.elements.treatment.options].some(option => option.value === treatment)) {
      form.elements.treatment.value = treatment;
    }
    modalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    modal.showModal();
  };
  $$('[data-open-consult]').forEach(button => button.addEventListener('click', event => {
    event.preventDefault();
    openModal(button);
  }));
  $('#modalClose').addEventListener('click', () => modal.close());
  modal.addEventListener('click', event => {
    const rect = modal.getBoundingClientRect();
    if (event.target === modal && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) modal.close();
  });
  modal.addEventListener('close', () => {
    document.body.style.overflow = modalOverflow;
    opener?.focus();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    form.style.display = 'none';
    success.style.display = 'block';
    success.tabIndex = -1;
    success.focus();
  });

  /* Scroll position drives only the thin reading line and navigation marker. */
  const progress = $('#readingProgress');
  const links = $$('.desktop-nav a');
  const navigation = links.map(link => ({link, section: $(link.hash)}));
  let frame = 0;
  const updateScroll = () => {
    frame = 0;
    const y = window.scrollY;
    const maximum = Math.max(1, root.scrollHeight - innerHeight);
    let current = null;
    navigation.forEach(item => {
      if (item.section.getBoundingClientRect().top <= Math.max(130, innerHeight * .32)) current = item.link;
    });
    progress.style.transform = `scaleX(${Math.max(0, Math.min(1, y / maximum))})`;
    header.classList.toggle('is-scrolled', y > 8);
    topButton.hidden = y < 700;
    links.forEach(link => {
      if (link === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  const queueUpdate = () => {
    if (!frame) frame = requestAnimationFrame(updateScroll);
  };
  addEventListener('scroll', queueUpdate, {passive: true});
  addEventListener('resize', queueUpdate, {passive: true});
  addEventListener('pageshow', queueUpdate);
  addEventListener('load', queueUpdate, {once: true});
  topButton.addEventListener('click', () => window.scrollTo({top: 0, behavior: reduced.matches ? 'instant' : 'smooth'}));

  /* Gentle one-time reveals; the page is fully visible without JavaScript. */
  let observer = null;
  const configureReveal = () => {
    observer?.disconnect();
    root.classList.remove('editorial-motion');
    if (reduced.matches || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }), {threshold: 0, rootMargin: '0px 0px -24px 0px'});
    $$('[data-reveal]').forEach(element => observer.observe(element));
    root.classList.add('editorial-motion');
  };
  reduced.addEventListener('change', configureReveal);
  configureReveal();
  updateScroll();
})();
