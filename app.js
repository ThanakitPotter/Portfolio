/* ==================== app.js (FULL) ==================== */
(() => {
  const d = document, w = window;

  /* Year in footer */
  const y = d.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();

  /* Page fade in */
  d.addEventListener('DOMContentLoaded', () => {
    d.body.classList.add('is-ready');
  });

  /* Scroll progress bar */
  const bar = d.getElementById('scrollbar') || (() => {
    const b = d.createElement('div'); b.id = 'scrollbar'; d.body.appendChild(b); return b;
  })();
  const updateBar = () => {
    const h = d.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = max > 0 ? (w.scrollY / max) * 100 : 0;
    bar.style.width = p + '%';
  };
  w.addEventListener('scroll', updateBar, { passive: true });
  w.addEventListener('resize', updateBar);
  updateBar();

  /* Scroll reveal */
  const reveals = [...d.querySelectorAll('.reveal, .card')];
  if ('IntersectionObserver' in w) {
    const io = new IntersectionObserver(es => {
      es.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-in'));
  }

  /* Animate skill bars */
  const skillCards = [...d.querySelectorAll('.card:has(.skill-levels)')];
  if ('IntersectionObserver' in w) {
    const io2 = new IntersectionObserver(es => {
      es.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('skills-in'); io2.unobserve(e.target); }
      });
    }, { threshold: 0.35 });
    skillCards.forEach(card => io2.observe(card));
  } else {
    skillCards.forEach(card => card.classList.add('skills-in'));
  }

  /* 3D tilt (skip touch & reduced-motion) */
  const prefersReduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = 'ontouchstart' in w || navigator.maxTouchPoints > 0;
  if (!prefersReduce && !isTouch) {
    const tiltEls = [...d.querySelectorAll('.tilt')];
    const strength = 10;
    tiltEls.forEach(el => {
      el.addEventListener('mousemove', (ev) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2 + w.scrollY;
        const dx = (ev.pageX - cx) / (r.width / 2);
        const dy = (ev.pageY - cy) / (r.height / 2);
        el.style.transform = `rotateX(${(-dy * strength).toFixed(2)}deg) rotateY(${(dx * strength).toFixed(2)}deg) translateZ(0)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* Scroll-spy for same-page anchors (index) */
  const menuLinks = [...d.querySelectorAll('.menu a[href^="#"]')];
  if (menuLinks.length) {
    const map = {};
    menuLinks.forEach(a => { const id = a.hash.slice(1); const sec = d.getElementById(id); if (sec) map[id] = a; });
    const setActive = id => { Object.values(map).forEach(a => a.classList.remove('is-active')); map[id]?.classList.add('is-active'); };
    const spy = new IntersectionObserver(es => {
      const vis = es.filter(e => e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if (vis) setActive(vis.target.id);
    }, { threshold: 0.55 });
    Object.keys(map).forEach(id => spy.observe(d.getElementById(id)));
  }

  /* ===== Mobile nav toggle (fixed dropdown + overflow lock) ===== */
  (() => {
    const nav = d.querySelector('.site-nav');
    const toggle = d.getElementById('navToggle');
    const menu = d.getElementById('primaryMenu');
    if (!nav || !toggle || !menu) return;

    const root = d.documentElement;

    const close = () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      root.classList.remove('nav-open');
    };
    const open = () => {
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      root.classList.add('nav-open');
    };

    toggle.addEventListener('click', () => {
      if (nav.classList.contains('is-open')) close(); else open();
    });

    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    w.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    w.addEventListener('resize', () => { if (w.innerWidth > 860) close(); });
    d.addEventListener('click', e => {
      if (!nav.classList.contains('is-open')) return;
      if (!menu.contains(e.target) && !toggle.contains(e.target)) close();
    }, true);
  })();

  /* ===== Showcase modal (persist tab + animated switch + a11y focus + fallback) ===== */
  (() => {
    const modal  = d.getElementById('showcase-modal');
    const dialog = modal?.querySelector('.modal__dialog');
    const btnProjects = d.getElementById('tabbtn-projects');
    const btnCerts    = d.getElementById('tabbtn-certs');
    const panelProjects = d.getElementById('tab-projects');
    const panelCerts    = d.getElementById('tab-certs');
    const goProj = d.getElementById('btnGoProjects');
    const goCert = d.getElementById('btnGoCerts');

    const setBtns = (isProj) => {
      btnProjects?.classList.toggle('is-active', isProj);
      btnProjects?.setAttribute('aria-selected', isProj ? 'true' : 'false');
      btnCerts?.classList.toggle('is-active', !isProj);
      btnCerts?.setAttribute('aria-selected', !isProj ? 'true' : 'false');
      if (goProj) goProj.hidden = !isProj;
      if (goCert) goCert.hidden =  isProj;
    };

    const focusHeading = (panel) => {
      const h = panel?.querySelector('h2');
      if (!h) return;
      if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex','-1');
      h.focus({ preventScroll: true });
    };

    const setTab = (name, {focus=true, animate=true} = {}) => {
      const isProj = name === 'projects';
      const from = isProj ? panelCerts : panelProjects;
      const to   = isProj ? panelProjects : panelCerts;

      setBtns(isProj);

      // show target
      if (to) {
        to.hidden = false;
        to.classList.add('is-active');
        if (animate) {
          to.classList.remove('anim-out');
          to.classList.add('anim-in');
          to.addEventListener('animationend', () => {
            to.classList.remove('anim-in');
          }, { once:true });
        }
      }
      // hide previous
      if (from && from !== to) {
        if (animate) {
          from.classList.remove('anim-in');
          from.classList.add('anim-out');
          from.addEventListener('animationend', () => {
            from.classList.remove('anim-out','is-active');
            from.hidden = true;
          }, { once:true });
        } else {
          from.classList.remove('is-active');
          from.hidden = true;
        }
      }

      try { localStorage.setItem('showcaseTab', name); } catch(e){}

      if (focus) focusHeading(to);
    };

    const openModal = (initialTab) => {
      if (!modal){ location.href = 'projects.html'; return; } // fallback
      if (!initialTab) {
        const saved = (localStorage.getItem('showcaseTab') || 'projects');
        initialTab = (saved === 'certs') ? 'certs' : 'projects';
      }
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden','false');
      setTab(initialTab, {focus:true, animate:false});
      dialog?.focus();
    };

    const closeModal = () => {
      if (!modal) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden','true');
    };

    // Open from buttons
    d.querySelectorAll('[data-modal-open]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        openModal(btn.dataset.openTab || undefined);
      });
    });

    // Tabs click
    btnProjects?.addEventListener('click', () => setTab('projects', {focus:true}));
    btnCerts?.addEventListener('click',    () => setTab('certs',    {focus:true}));

    // Close behaviors
    d.querySelectorAll('[data-modal-close]').forEach(el => {
      el.addEventListener('click', () => closeModal());
    });
    d.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
    d.addEventListener('mousedown', e => {
      const ov = e.target.closest('.modal__overlay');
      if (ov && modal?.classList.contains('is-open')) closeModal();
    });
  })();
})();
