/* ============================================================
   TECHFEST 2030 // 3D INTERACTIVE ENGINE (Three.js r128 + GSAP)
   ============================================================ */

(function () {
  'use strict';

  /* ─── REGISTER GSAP ─────────────────────────── */
  gsap.registerPlugin(ScrollTrigger);

  /* ─── STATE ─────────────────────────────────── */
  const state = {
    progress: 0,        // 0 to 1 scroll progress
    currentZone: 0,     // 0: Hero, 1: Events, 2: Timeline, 3: CTA
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    raycaster: new THREE.Raycaster(),
    mouseVec: new THREE.Vector2(),
    hoveredObj: null
  };

  /* ─── UTILS ─────────────────────────────────── */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ─── LOADER ─────────────────────────────────── */
  let loadedPct = 0;
  const loadInterval = setInterval(() => {
    loadedPct += Math.floor(Math.random() * 15) + 5;
    if (loadedPct >= 100) {
      loadedPct = 100;
      clearInterval(loadInterval);
      setTimeout(hideLoader, 300);
    }
    const fill = $('#loader-fill');
    const txt = $('#loader-pct');
    if (fill) fill.style.width = loadedPct + '%';
    if (txt) txt.textContent = loadedPct + '%';
  }, 60);

  function hideLoader() {
    const loader = $('#loader');
    if (!loader) return;
    gsap.to(loader, {
      opacity: 0,
      duration: 0.8,
      onComplete: () => {
        loader.style.display = 'none';
        init3DScene();
        initScroll();
        initInteractions();
        initCountdown();
        initTerminal();
        initModal();
        initCursor();
      }
    });
  }

  /* ─── THREE.JS SCENE SETUP ───────────────────── */
  let scene, camera, renderer;
  let coreGroup, neuralNet, eventPadsGroup, gridHelper;
  let eventPadMeshes = [];

  function init3DScene() {
    const canvas = $('#scene');
    if (!canvas) return;

    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000005, 0.035);

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 12);

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x00f0ff, 0.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f0ff, 1.2);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xff00ff, 0.8);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x00f0ff, 2, 20);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // Build 3D Objects
    buildCoreObject();
    buildNeuralNet();
    buildEventPads();
    buildGrid();

    // Window Resize
    window.addEventListener('resize', onWindowResize);

    // Mouse Movement Tracking
    window.addEventListener('mousemove', onMouseMove);

    // Render Loop
    animate();
  }

  /* ─── OBJECT 1: CYBORG CORE (Central Sphere + Rings) ────── */
  function buildCoreObject() {
    coreGroup = new THREE.Group();

    // Inner Core Icosahedron
    const coreGeo = new THREE.IcosahedronGeometry(2.2, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x001122,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.35,
      roughness: 0.2,
      metalness: 0.9,
      wireframe: true
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.name = 'coreSphere';
    coreGroup.add(coreMesh);

    // Inner Glowing Solid Sphere
    const innerGeo = new THREE.SphereGeometry(1.4, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.15
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerMesh);

    // Ring 1 (Cyan Wireframe Ring)
    const ring1Geo = new THREE.TorusGeometry(3.6, 0.03, 16, 100);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.8
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    ring1.name = 'ring1';
    coreGroup.add(ring1);

    // Ring 2 (Magenta Wireframe Ring)
    const ring2Geo = new THREE.TorusGeometry(4.4, 0.02, 16, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0xff00ff,
      emissive: 0xff00ff,
      emissiveIntensity: 0.8
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    ring2.name = 'ring2';
    coreGroup.add(ring2);

    // Ring 3 (Outer Cyan Dash Ring)
    const ring3Geo = new THREE.TorusGeometry(5.2, 0.015, 16, 100);
    const ring3Mat = new THREE.MeshStandardMaterial({ color: 0x00f0ff });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.x = -Math.PI / 6;
    coreGroup.add(ring3);

    coreGroup.position.set(0, 0, 0);
    scene.add(coreGroup);
  }

  /* ─── OBJECT 2: NEURAL NODE NETWORK ─────────────────────── */
  function buildNeuralNet() {
    neuralNet = new THREE.Group();
    const count = 140;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const cyan = new THREE.Color(0x00f0ff);
    const magenta = new THREE.Color(0xff00ff);

    for (let i = 0; i < count; i++) {
      const radius = 6 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const mix = Math.random();
      const col = cyan.clone().lerp(magenta, mix);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.7
    });

    const particles = new THREE.Points(geometry, material);
    neuralNet.add(particles);

    // Connecting lines between nearby nodes
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.08
    });
    const lineGeo = new THREE.BufferGeometry();
    const linePos = [];

    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 4.5) {
          linePos.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
          linePos.push(positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]);
        }
      }
    }

    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    neuralNet.add(lines);

    scene.add(neuralNet);
  }

  /* ─── OBJECT 3: EVENT HOLOGRAPHIC PADS ──────────────────── */
  function buildEventPads() {
    eventPadsGroup = new THREE.Group();
    eventPadsGroup.position.set(-6, 0, -15); // Positioned in Zone 1 (Matrix)

    const padConfigs = [
      { name: 'Neural Hackathon', track: 'neural-hackathon', pos: [-3, 2, 0], color: 0x00f0ff },
      { name: 'Bionic Labs',       track: 'bionic-labs',       pos: [3, 2, 0],  color: 0xff00ff },
      { name: 'Dark Web Quest',    track: 'dark-web-quest',    pos: [-3, -2, 0], color: 0x00f0ff },
      { name: 'Esports Nexus',     track: 'esports-nexus',     pos: [3, -2, 0], color: 0x00ffff }
    ];

    padConfigs.forEach(cfg => {
      const padGroup = new THREE.Group();
      padGroup.position.set(...cfg.pos);

      // Outer Hexagonal / Box Frame
      const boxGeo = new THREE.BoxGeometry(2.4, 1.4, 0.1);
      const boxMat = new THREE.MeshStandardMaterial({
        color: 0x000011,
        emissive: cfg.color,
        emissiveIntensity: 0.25,
        roughness: 0.3,
        metalness: 0.8,
        wireframe: true
      });
      const boxMesh = new THREE.Mesh(boxGeo, boxMat);
      boxMesh.userData = { track: cfg.track, name: cfg.name, isPad: true };
      padGroup.add(boxMesh);
      eventPadMeshes.push(boxMesh);

      // Inner Glowing Core
      const coreGeo = new THREE.OctahedronGeometry(0.4);
      const coreMat = new THREE.MeshBasicMaterial({ color: cfg.color, wireframe: true });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.name = 'padCore';
      padGroup.add(coreMesh);

      eventPadsGroup.add(padGroup);
    });

    scene.add(eventPadsGroup);
  }

  /* ─── OBJECT 4: FLOOR GRID ──────────────────────────────── */
  function buildGrid() {
    const size = 60;
    const divisions = 60;
    gridHelper = new THREE.GridHelper(size, divisions, 0x00f0ff, 0x002233);
    gridHelper.position.y = -8;
    gridHelper.material.opacity = 0.25;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
  }

  /* ─── RESIZE ────────────────────────────────────────────── */
  function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /* ─── MOUSE ─────────────────────────────────────────────── */
  function onMouseMove(e) {
    state.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    state.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    state.mouseVec.x = state.mouse.targetX;
    state.mouseVec.y = state.mouse.targetY;
  }

  /* ─── ANIMATION LOOP ────────────────────────────────────── */
  function animate() {
    requestAnimationFrame(animate);

    // Smooth mouse interpolation
    state.mouse.x += (state.mouse.targetX - state.mouse.x) * 0.05;
    state.mouse.y += (state.mouse.targetY - state.mouse.y) * 0.05;

    // Rotate core
    if (coreGroup) {
      coreGroup.rotation.y += 0.005;
      coreGroup.rotation.x += 0.002;

      const r1 = coreGroup.getObjectByName('ring1');
      const r2 = coreGroup.getObjectByName('ring2');
      if (r1) r1.rotation.z += 0.01;
      if (r2) r2.rotation.z -= 0.008;
    }

    // Rotate neural network slightly
    if (neuralNet) {
      neuralNet.rotation.y += 0.001;
    }

    // Spin event pad cores
    if (eventPadsGroup) {
      eventPadsGroup.children.forEach(padGroup => {
        const core = padGroup.getObjectByName('padCore');
        if (core) {
          core.rotation.x += 0.02;
          core.rotation.y += 0.03;
        }
      });
    }

    // Mouse parallax on camera offset
    if (camera) {
      camera.position.x += (state.mouse.x * 0.5 - camera.position.x) * 0.05;
      camera.position.y += (state.mouse.y * 0.5 - camera.position.y) * 0.05;
    }

    // Raycasting for interactive 3D pads
    if (camera && eventPadMeshes.length) {
      state.raycaster.setFromCamera(state.mouseVec, camera);
      const intersects = state.raycaster.intersectObjects(eventPadMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (state.hoveredObj !== hit) {
          if (state.hoveredObj) state.hoveredObj.material.emissiveIntensity = 0.25;
          state.hoveredObj = hit;
          hit.material.emissiveIntensity = 1.0;
          document.body.style.cursor = 'pointer';
        }
      } else {
        if (state.hoveredObj) {
          state.hoveredObj.material.emissiveIntensity = 0.25;
          state.hoveredObj = null;
          document.body.style.cursor = 'default';
        }
      }
    }

    renderer.render(scene, camera);
  }

  /* ─── SCROLL DRIVER (GSAP CAMERA JOURNEY) ──────────────── */
  function initScroll() {
    // Camera Keyframes along scroll progress (0 to 1)
    // Zone 0 (0.00 - 0.25): Hero — Camera at (0, 0, 12), looking at Core (0, 0, 0)
    // Zone 1 (0.25 - 0.55): Events — Camera moves to (-6, 0, -5), looking at Event Pads (-6, 0, -15)
    // Zone 2 (0.55 - 0.80): Timeline — Camera moves to (6, 2, -28), looking at Timeline Core (0, 0, -30)
    // Zone 3 (0.80 - 1.00): CTA — Camera zooms deep into Core (0, 0, -45)

    const overlays = [
      $('#ov-hero'),
      $('#ov-events'),
      $('#ov-timeline'),
      $('#ov-cta')
    ];

    function setZone(zoneIndex) {
      if (state.currentZone === zoneIndex) return;
      state.currentZone = zoneIndex;

      // Update overlay visibility
      overlays.forEach((ov, idx) => {
        if (!ov) return;
        if (idx === zoneIndex) {
          ov.classList.add('active');
        } else {
          ov.classList.remove('active');
        }
      });

      // Update nav link underline
      $$('.nav-links a').forEach(link => {
        const z = parseInt(link.dataset.zone, 10);
        link.style.color = (z === zoneIndex) ? 'var(--white)' : '';
      });
    }

    ScrollTrigger.create({
      trigger: '#scroll-driver',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;
        state.progress = p;

        // Camera path positions
        if (p < 0.25) {
          // Zone 0: Hero
          setZone(0);
          const t = p / 0.25;
          gsap.to(camera.position, {
            x: gsap.utils.interpolate(0, -3, t),
            y: gsap.utils.interpolate(0, 0, t),
            z: gsap.utils.interpolate(12, 5, t),
            duration: 0.1, overwrite: 'auto'
          });
        } else if (p < 0.55) {
          // Zone 1: Matrix / Events
          setZone(1);
          const t = (p - 0.25) / 0.30;
          gsap.to(camera.position, {
            x: gsap.utils.interpolate(-3, -6, t),
            y: gsap.utils.interpolate(0, 0, t),
            z: gsap.utils.interpolate(5, -7, t),
            duration: 0.1, overwrite: 'auto'
          });
        } else if (p < 0.80) {
          // Zone 2: Timeline
          setZone(2);
          const t = (p - 0.55) / 0.25;
          gsap.to(camera.position, {
            x: gsap.utils.interpolate(-6, 5, t),
            y: gsap.utils.interpolate(0, 2, t),
            z: gsap.utils.interpolate(-7, -20, t),
            duration: 0.1, overwrite: 'auto'
          });
        } else {
          // Zone 3: CTA
          setZone(3);
          const t = (p - 0.80) / 0.20;
          gsap.to(camera.position, {
            x: gsap.utils.interpolate(5, 0, t),
            y: gsap.utils.interpolate(2, 0, t),
            z: gsap.utils.interpolate(-20, -38, t),
            duration: 0.1, overwrite: 'auto'
          });
        }
      }
    });

    // Nav bar compact transition
    window.addEventListener('scroll', () => {
      const nav = $('#nav');
      if (!nav) return;
      if (window.scrollY > 50) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    });

    // Nav link click smooth scroll to zone
    $$('[data-zone]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const z = parseInt(el.dataset.zone, 10);
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const targets = [0, 0.32, 0.65, 0.95];
        const targetScroll = targets[z] * scrollHeight;
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      });
    });

    $('#btn-explore')?.addEventListener('click', (e) => {
      e.preventDefault();
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: 0.32 * scrollHeight, behavior: 'smooth' });
    });
  }

  /* ─── INTERACTION LISTENERS (Clicking 3D Pads) ─────────── */
  function initInteractions() {
    window.addEventListener('click', () => {
      if (state.hoveredObj) {
        const track = state.hoveredObj.userData.track;
        if (track) openModal(track);
      }
    });

    // Event row hover highlights matching 3D pad
    $$('.event-row').forEach(row => {
      row.addEventListener('click', () => {
        openModal(row.dataset.track);
      });
    });
  }

  /* ─── COUNTDOWN ─────────────────────────────────────────── */
  function initCountdown() {
    const target = new Date('2026-12-16T09:00:00+05:30').getTime();
    function update() {
      const diff = target - Date.now();
      if (diff <= 0) return;
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      const pad = n => String(n).padStart(2, '0');
      const elD = $('#cd-days'), elH = $('#cd-hours'), elM = $('#cd-mins'), elS = $('#cd-secs');
      if (elD) elD.textContent = pad(d);
      if (elH) elH.textContent = pad(h);
      if (elM) elM.textContent = pad(m);
      if (elS) elS.textContent = pad(s);
    }
    update();
    setInterval(update, 1000);
  }

  /* ─── MODAL ─────────────────────────────────────────────── */
  function openModal(track) {
    const modal = $('#modal');
    if (!modal) return;
    modal.classList.add('open');
    const select = $('#reg-track');
    if (select && track) select.value = track;
  }

  function closeModal() {
    const modal = $('#modal');
    if (modal) modal.classList.remove('open');
  }

  function initModal() {
    $$('.trigger-modal').forEach(b => b.addEventListener('click', e => { e.preventDefault(); openModal(); }));
    $('#modal-close')?.addEventListener('click', closeModal);
    $('#modal')?.addEventListener('click', e => { if (e.target === $('#modal')) closeModal(); });

    $('#reg-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const name = $('#reg-name')?.value;
      const email = $('#reg-email')?.value;
      if (!name || !email) return;

      const box = $('.modal-box');
      if (box) {
        box.innerHTML = `
          <button class="modal-close" id="modal-close"><i class="fa-solid fa-xmark"></i></button>
          <div class="modal-tag">3D Pass Confirmed</div>
          <h2 class="modal-title" style="font-size:22px;">Terminal Access<br>Granted.</h2>
          <p style="font-family:var(--font-mono);font-size:11px;color:var(--muted);line-height:1.8;margin-bottom:24px;">
            Operator: <span style="color:var(--white);">${name}</span><br>
            Neural Endpoint: <span style="color:var(--white);">${email}</span><br>
            Pass ID: <span style="color:var(--cyan);">#TF3D-${Math.random().toString(36).substr(2,6).toUpperCase()}</span>
          </p>
          <button class="btn-submit" id="modal-done">CLOSE TERMINAL</button>
        `;
        $('#modal-close')?.addEventListener('click', closeModal);
        $('#modal-done')?.addEventListener('click', closeModal);
      }
    });
  }

  /* ─── TERMINAL ──────────────────────────────────────────── */
  function initTerminal() {
    const term = $('#terminal');
    const input = $('#terminal-cmd-input');
    const output = $('#terminal-output');
    if (!term || !input || !output) return;

    const toggle = () => term.classList.toggle('open');
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); toggle(); }
      if (e.key === 'Escape' && term.classList.contains('open')) closeModal();
    });

    const cmds = {
      help: () => `Commands: <span class="t-c">events</span> · <span class="t-c">status</span> · <span class="t-c">register</span> · <span class="t-c">clear</span>`,
      events: () => `01 Neural Hackathon ($75k)<br>02 Bionic Labs ($50k)<br>03 Dark Web Quest ($35k)<br>04 Esports Nexus ($25k)`,
      status: () => `[3D KERNEL OK] WebGL2 active. Scene nodes: 140. FPS: 60.`,
      register: () => { term.classList.remove('open'); openModal(); return `Opening registration...`; },
      clear: () => { output.innerHTML = ''; return null; }
    };

    input.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      const cmd = input.value.trim().toLowerCase();
      input.value = '';
      if (!cmd) return;

      const pLine = document.createElement('div');
      pLine.innerHTML = `<span class="t-c">cyber-os:~$</span> ${cmd}`;
      output.appendChild(pLine);

      const fn = cmds[cmd];
      const res = fn ? fn() : `<span class="t-e">Unknown command: ${cmd}</span>. Type 'help'.`;
      if (res) {
        const rLine = document.createElement('div');
        rLine.innerHTML = res;
        rLine.style.marginBottom = '6px';
        output.appendChild(rLine);
      }
      output.scrollTop = output.scrollHeight;
    });
  }

  /* ─── CURSOR ────────────────────────────────────────────── */
  function initCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const dot = $('#cursor-dot');
    const ring = $('#cursor-ring');
    if (!dot || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    function tick() {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(tick);
    }
    tick();

    $$('a, button, .event-row').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
  }

})();
