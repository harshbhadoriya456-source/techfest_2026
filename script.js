/* ============================================================
   TECHFEST 2030 // CYBORG — SCRIPT ENGINE
   Purposeful motion with GSAP + ScrollTrigger
   ============================================================ */

(function () {
  'use strict';

  /* ─── GSAP REGISTER ─────────────────────────── */
  gsap.registerPlugin(ScrollTrigger);

  /* ─── UTILITIES ─────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── LOADER ─────────────────────────────────── */
  window.addEventListener('load', () => {
    const loader = $('#loader');
    if (!loader) return;
    setTimeout(() => {
      gsap.to(loader, {
        opacity: 0,
        duration: 0.6,
        onComplete: () => { loader.style.display = 'none'; initAll(); }
      });
    }, 900);
  });

  /* ─── INIT ALL ───────────────────────────────── */
  function initAll() {
    initCursor();
    initNav();
    initMobileMenu();
    initHeroEntrance();
    initCanvas();
    initScrollReveals();
    initEventHovers();
    initTimeline();
    initCountdown();
    initModal();
    initTerminal();
    initAudioToggle();
  }

  /* ─── CUSTOM CURSOR ──────────────────────────── */
  function initCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const dot = $('#cursor-dot');
    const ring = $('#cursor-ring');
    if (!dot || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    const tickRing = () => {
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(tickRing);
    };
    tickRing();

    $$('a, button, .event-item, .ecosystem-partner').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('expanded'));
      el.addEventListener('mouseleave', () => ring.classList.remove('expanded'));
    });
  }

  /* ─── NAVIGATION ─────────────────────────────── */
  function initNav() {
    const nav = $('#nav');
    if (!nav) return;
    const onScroll = () => {
      if (window.scrollY > 60) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ─── MOBILE MENU ────────────────────────────── */
  function initMobileMenu() {
    const burger = $('#nav-hamburger');
    const panel = $('#mobile-panel');
    if (!burger || !panel) return;

    burger.addEventListener('click', () => {
      const open = panel.classList.toggle('open');
      burger.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    $$('.close-panel').forEach(el => {
      el.addEventListener('click', () => {
        panel.classList.remove('open');
        burger.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && panel.classList.contains('open')) {
        panel.classList.remove('open');
        burger.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ─── HERO ENTRANCE ──────────────────────────── */
  function initHeroEntrance() {
    if (prefersReducedMotion) {
      $$('.hero-system-label, .hero-ctas, #hero-meta, .t-inner').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo('#hero-label', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.7, delay: 0.2 })
      .fromTo('.t-system', { y: '110%' }, { y: '0%', duration: 0.8 }, '-=0.3')
      .fromTo('#hero-main', { y: '110%' }, { y: '0%', duration: 1, ease: 'expo.out' }, '-=0.5')
      .fromTo('.t-state .t-inner', { y: '110%' }, { y: '0%', duration: 0.8 }, '-=0.6')
      .fromTo('#hero-meta', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.3')
      .fromTo('#hero-ctas', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.4')
      .fromTo('#hero-countdown', { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.8 }, '-=0.8');

    // Hero image parallax
    const heroImg = $('#hero-img');
    if (heroImg) {
      gsap.to(heroImg, {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }
  }

  /* ─── NEURAL MESH CANVAS ─────────────────────── */
  function initCanvas() {
    const canvas = $('#bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, nodes = [], mouse = { x: -999, y: -999 };
    const N = 60, LINK_DIST = 140;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < N; i++) {
      nodes.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5
      });
    }

    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

    function draw() {
      ctx.clearRect(0, 0, W, H);
      nodes.forEach(n => {
        // Mouse repulsion
        const dx = n.x - mouse.x, dy = n.y - mouse.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          n.vx += (dx / d) * 0.4;
          n.vy += (dy / d) * 0.4;
        }
        n.vx *= 0.98;
        n.vy *= 0.98;
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.5)';
        ctx.fill();
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.12 * (1 - dist / LINK_DIST)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ─── SCROLL REVEALS ─────────────────────────── */
  function initScrollReveals() {
    if (prefersReducedMotion) {
      $$('.reveal').forEach(el => el.classList.add('visible'));
      return;
    }

    $$('.reveal').forEach((el, i) => {
      gsap.fromTo(el,
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true
          },
          delay: (i % 4) * 0.07
        }
      );
    });
  }

  /* ─── EVENT HOVER (supplemental JS logic) ────── */
  function initEventHovers() {
    $$('.event-item').forEach(item => {
      item.addEventListener('click', () => {
        const track = item.dataset.event;
        openModal(track);
      });
    });
  }

  /* ─── TIMELINE ANIMATION ─────────────────────── */
  function initTimeline() {
    const progress = $('#timeline-progress');
    const entries = $$('.timeline-entry');
    if (!progress || !entries.length) return;

    if (prefersReducedMotion) {
      entries.forEach(e => e.classList.add('visible'));
      if (progress) progress.style.transform = 'scaleY(1)';
      return;
    }

    gsap.to(progress, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '#timeline-body',
        start: 'top 70%',
        end: 'bottom 30%',
        scrub: 0.5
      }
    });

    entries.forEach((entry, i) => {
      gsap.to(entry, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: entry,
          start: 'top 80%',
          once: true
        },
        delay: i * 0.15,
        onComplete: () => entry.classList.add('visible')
      });
    });
  }

  /* ─── COUNTDOWN ──────────────────────────────── */
  function initCountdown() {
    const target = new Date('2026-12-16T09:00:00+05:30').getTime();
    const ids = ['count-days', 'count-hours', 'count-mins', 'count-secs'];

    function pad(n) { return String(n).padStart(2, '0'); }

    function update() {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        ids.forEach(id => { const el = $(('#' + id)); if (el) el.textContent = '00'; });
        return;
      }
      const days  = Math.floor(diff / 86400000);
      const hrs   = Math.floor((diff % 86400000) / 3600000);
      const mins  = Math.floor((diff % 3600000) / 60000);
      const secs  = Math.floor((diff % 60000) / 1000);

      [days, hrs, mins, secs].forEach((v, i) => {
        const el = document.getElementById(ids[i]);
        if (el) el.textContent = pad(v);
      });
    }
    update();
    setInterval(update, 1000);
  }

  /* ─── MODAL ──────────────────────────────────── */
  function openModal(track) {
    const modal = $('#modal');
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Pre-select track if known
    const trackSelect = $('#reg-track');
    if (trackSelect && track) {
      const opt = trackSelect.querySelector(`option[value="${track}"]`);
      if (opt) trackSelect.value = track;
    }

    setTimeout(() => { const input = $('#reg-name'); if (input) input.focus(); }, 300);
  }

  function closeModal() {
    const modal = $('#modal');
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function initModal() {
    // Open triggers
    $$('.trigger-modal').forEach(el => el.addEventListener('click', e => { e.preventDefault(); openModal(null); }));

    // Close
    const closeBtn = $('#modal-close');
    const modal = $('#modal');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modal) modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal && modal.classList.contains('open')) closeModal();
    });

    // Form submission
    const form = $('#reg-form');
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const name = $('#reg-name')?.value?.trim();
        const email = $('#reg-email')?.value?.trim();
        if (!name || !email) return;

        const passId = '#TF-' + Math.random().toString(36).substr(2, 6).toUpperCase();
        const output = $('#terminal-output');

        // Show confirmation in modal
        const box = $('.modal-box');
        if (box) {
          box.innerHTML = `
            <button class="modal-close" id="modal-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-tag">Registration Confirmed</div>
            <h2 class="modal-title" style="font-size:22px;">Synchronization<br>Confirmed.</h2>
            <p style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);line-height:1.8;margin-bottom:24px;">
              Operator: <span style="color:var(--text-primary)">${name}</span><br>
              Endpoint: <span style="color:var(--text-primary)">${email}</span><br>
              Pass ID: <span style="color:var(--cyan)">${passId}</span><br>
              Track: <span style="color:var(--text-primary)">${$('#reg-track')?.options[$('#reg-track')?.selectedIndex]?.text}</span>
            </p>
            <button class="btn-modal-submit" id="modal-close">CLOSE TERMINAL</button>
          `;
          // Re-attach close
          $$('#modal-close').forEach(btn => btn.addEventListener('click', closeModal));
        }

        // Log to terminal
        if (output) {
          const line = document.createElement('div');
          line.innerHTML = `<span class="t-cyan">>> </span>Registration confirmed: ${name} / ${passId}`;
          output.appendChild(line);
        }
      });
    }
  }

  /* ─── TERMINAL ───────────────────────────────── */
  function initTerminal() {
    const term = $('#terminal');
    const input = $('#terminal-cmd-input');
    const output = $('#terminal-output');
    if (!term || !input || !output) return;

    const openTerminal = () => {
      term.classList.add('open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => input.focus(), 150);
    };
    const closeTerminal = () => {
      term.classList.remove('open');
      document.body.style.overflow = '';
    };

    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); openTerminal(); }
      if (e.key === 'Escape' && term.classList.contains('open')) closeTerminal();
    });

    term.addEventListener('click', e => { if (e.target === term) closeTerminal(); });

    // Also attach to any nav terminal buttons
    $$('.open-terminal-btn').forEach(btn => btn.addEventListener('click', openTerminal));

    const cmds = {
      help: () => `Available: <span class="t-cyan">events</span> · <span class="t-cyan">status</span> · <span class="t-cyan">date</span> · <span class="t-cyan">register</span> · <span class="t-cyan">clear</span>`,
      events: () => `01 Neural Hackathon (Dec 16–18)<br>02 Bionic Labs (Dec 17)<br>03 Dark Web Quest (Dec 17–18)<br>04 Esports Nexus (Dec 18)`,
      status: () => `[SYS OK] All nodes functional. Neural latency: 0.02ms. Uptime: 99.98%.`,
      date: () => `Target launch: <span class="t-cyan">December 16, 2026 — Neo-City Hub</span>`,
      register: () => { closeTerminal(); openModal(null); return `Opening registration terminal...`; },
      clear: () => {
        output.innerHTML = '';
        return null;
      }
    };

    input.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      const val = input.value.trim().toLowerCase();
      input.value = '';
      if (!val) return;

      const promptLine = document.createElement('div');
      promptLine.innerHTML = `<span class="t-prompt">cyber-os:~$</span> ${val}`;
      output.appendChild(promptLine);

      const fn = cmds[val];
      let result;
      if (fn) {
        result = fn();
      } else {
        result = `<span style="color:#e55">Command not found:</span> ${val}. Type <span class="t-cyan">help</span>.`;
      }

      if (result !== null && result !== undefined) {
        const respLine = document.createElement('div');
        respLine.innerHTML = result;
        respLine.style.color = 'var(--text-muted)';
        respLine.style.marginBottom = '8px';
        output.appendChild(respLine);
      }
      output.scrollTop = output.scrollHeight;
    });
  }

  /* ─── AUDIO SYNTHESIZER ──────────────────────── */
  function initAudioToggle() {
    const btn = $('#audio-toggle');
    const icon = $('#audio-icon');
    if (!btn) return;

    let ctx = null;
    let enabled = false;

    btn.addEventListener('click', () => {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      enabled = !enabled;
      if (icon) icon.className = enabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
      if (enabled) playTone(ctx, 440, 0.05, 0.1);
    });

    // Subtle click feedback
    document.addEventListener('click', e => {
      if (!enabled || !ctx) return;
      if (e.target.closest('button, a, .event-item')) {
        playTone(ctx, 660, 0.03, 0.06);
      }
    });
  }

  function playTone(ctx, freq, vol, dur) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + dur);
    } catch(e) {}
  }

})();
