/**
 * Magic Card Engine
 * Canvas-based enchanted card: particles, flowing lines, hue-glow, click bursts.
 * Adapted for La Princesa — dark gold theme, multiple instances, touch support.
 */

// ─── PER-INSTANCE STATE ──────────────────────────────────────────────────────

function crearInstancia(canvas) {
  const ctx = canvas.getContext('2d');

  // Dimensiones — se sincronizan con el contenedor
  let W = canvas.offsetWidth  || 340;
  let H = canvas.offsetHeight || 260;
  canvas.width  = W;
  canvas.height = H;

  // Imagen de fondo
  const imgSrc = canvas.dataset.image || '';
  let bgImage = null;
  if (imgSrc) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { bgImage = img; };
    img.src = imgSrc;
  }

  // Texto
  const nombre = canvas.dataset.name  || '';
  const precio = canvas.dataset.price || '';

  // Puntero (cursor / touch)
  let px = W / 2, py = H / 2;  // posición actual
  let isPointerOver = false;

  // Hue base gold ≈ 40°; varía con ángulo del puntero
  let currentHue = 40;
  let targetHue  = 40;

  // ── PARTÍCULAS ────────────────────────────────────────────────────────────
  const NUM_PARTICLES = 55;
  const particles = [];

  for (let i = 0; i < NUM_PARTICLES; i++) {
    particles.push(nuevaParticula(W, H));
  }

  function nuevaParticula(w, h, x, y) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.22 + Math.random() * 0.45;
    return {
      x: x ?? Math.random() * w,
      y: y ?? Math.random() * h,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 1.6 + Math.random() * 3.1,
      alpha: 0.46 + Math.random() * 0.46,
      alphaDir: Math.random() > 0.5 ? 1 : -1,
      alphaSpeed: 0.005 + Math.random() * 0.008,
      hueOffset: (Math.random() - 0.5) * 40,
      life: 1,
      maxLife: 180 + Math.random() * 240,
      age: 0,
    };
  }

  // ── LÍNEAS ────────────────────────────────────────────────────────────────
  const NUM_LINES = 10;
  const lines = [];

  for (let i = 0; i < NUM_LINES; i++) {
    lines.push(nuevaLinea(W, H));
  }

  function nuevaLinea(w, h) {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      length: 60 + Math.random() * 120,
      angle: Math.random() * Math.PI * 2,
      speed: 0.004 + Math.random() * 0.007,
      waveAmp: 14 + Math.random() * 22,
      waveFreq: 0.04 + Math.random() * 0.04,
      waveOffset: Math.random() * Math.PI * 2,
      alpha: 0.07 + Math.random() * 0.11,
      hueOffset: (Math.random() - 0.5) * 40,
    };
  }

  // ── EFECTOS DE CLICK ──────────────────────────────────────────────────────
  const clickEffects = [];

  function agregarClickEffect(x, y) {
    // Anillo expansivo
    clickEffects.push({ type: 'ring', x, y, r: 0, maxR: 60, alpha: 0.8, hue: currentHue });
    // Partículas de burst
    const numBurst = 12;
    for (let i = 0; i < numBurst; i++) {
      const angle = (i / numBurst) * Math.PI * 2;
      const speed = 1.5 + Math.random() * 2.5;
      clickEffects.push({
        type: 'burst',
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 2.5,
        alpha: 0.9,
        hue: currentHue + (Math.random() - 0.5) * 40,
      });
    }
    // Líneas radiales
    const numRays = 8;
    for (let i = 0; i < numRays; i++) {
      const angle = (i / numRays) * Math.PI * 2;
      clickEffects.push({
        type: 'ray',
        x, y,
        angle,
        len: 0,
        maxLen: 30 + Math.random() * 40,
        alpha: 0.6,
        hue: currentHue,
      });
    }
  }

  // ── SHAKE DE TARJETA ──────────────────────────────────────────────────────
  let shakeFrames = 0;
  const parentCard = canvas.closest('.block-card');

  function shake() {
    if (!parentCard) return;
    shakeFrames = 12;
  }

  // ── RENDER ────────────────────────────────────────────────────────────────

  function drawBackground() {
    // Imagen de fondo
    if (bgImage) {
      // Mantener aspect-ratio cubriendo el canvas (object-fit: cover)
      const ir = bgImage.naturalWidth / bgImage.naturalHeight;
      const cr = W / H;
      let sw, sh, sx, sy;
      if (ir > cr) {
        sh = bgImage.naturalHeight; sw = sh * cr;
        sx = (bgImage.naturalWidth - sw) / 2; sy = 0;
      } else {
        sw = bgImage.naturalWidth; sh = sw / cr;
        sx = 0; sy = (bgImage.naturalHeight - sh) / 2;
      }
      ctx.globalAlpha = 1;
      ctx.drawImage(bgImage, sx, sy, sw, sh, 0, 0, W, H);

      // Overlay oscuro para que los efectos sean visibles
      ctx.globalAlpha = 0.42;
      ctx.fillStyle = '#0C0804';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    } else {
      // Sin imagen: fondo sólido
      ctx.fillStyle = '#0C0804';
      ctx.fillRect(0, 0, W, H);
    }
  }

  function drawGlow() {
    if (!isPointerOver) return;
    const grad = ctx.createRadialGradient(px, py, 0, px, py, 90);
    grad.addColorStop(0, `hsla(${currentHue}, 90%, 65%, 0.18)`);
    grad.addColorStop(1, `hsla(${currentHue}, 80%, 40%, 0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  function drawLines() {
    lines.forEach(l => {
      ctx.save();
      ctx.globalAlpha = l.alpha;
      ctx.strokeStyle = `hsl(${currentHue + l.hueOffset}, 85%, 60%)`;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      const steps = 20;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const lx = l.x + Math.cos(l.angle) * l.length * t;
        const ly = l.y + Math.sin(l.angle) * l.length * t
                       + Math.sin(t * l.waveFreq * l.length + l.waveOffset) * l.waveAmp;
        i === 0 ? ctx.moveTo(lx, ly) : ctx.lineTo(lx, ly);
      }
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawParticles() {
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha * (1 - p.age / p.maxLife);
      ctx.shadowColor = `hsl(${currentHue + p.hueOffset}, 90%, 70%)`;
      ctx.shadowBlur = p.size * 1.8;
      ctx.fillStyle = `hsl(${currentHue + p.hueOffset}, 85%, 75%)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawClickEffects() {
    for (let i = clickEffects.length - 1; i >= 0; i--) {
      const e = clickEffects[i];

      if (e.type === 'ring') {
        ctx.save();
        ctx.globalAlpha = e.alpha;
        ctx.strokeStyle = `hsl(${e.hue}, 90%, 65%)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        e.r += 3;
        e.alpha -= 0.035;
        if (e.alpha <= 0) clickEffects.splice(i, 1);

      } else if (e.type === 'burst') {
        ctx.save();
        ctx.globalAlpha = e.alpha;
        ctx.fillStyle = `hsl(${e.hue}, 90%, 65%)`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        e.x += e.vx; e.y += e.vy;
        e.vy += 0.06;            // gravedad suave
        e.alpha -= 0.038;
        e.size  *= 0.97;
        if (e.alpha <= 0) clickEffects.splice(i, 1);

      } else if (e.type === 'ray') {
        ctx.save();
        ctx.globalAlpha = e.alpha;
        ctx.strokeStyle = `hsl(${e.hue}, 90%, 70%)`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(e.x, e.y);
        ctx.lineTo(
          e.x + Math.cos(e.angle) * e.len,
          e.y + Math.sin(e.angle) * e.len
        );
        ctx.stroke();
        ctx.restore();
        e.len += 4;
        e.alpha -= 0.055;
        if (e.alpha <= 0) clickEffects.splice(i, 1);
      }
    }
  }

  function drawText() {
    // Gradiente de sombra inferior
    const shadowGrad = ctx.createLinearGradient(0, H * 0.45, 0, H);
    shadowGrad.addColorStop(0, 'rgba(0,0,0,0)');
    shadowGrad.addColorStop(1, 'rgba(0,0,0,0.82)');
    ctx.fillStyle = shadowGrad;
    ctx.fillRect(0, 0, W, H);

    // Nombre
    ctx.save();
    ctx.font = `300 ${Math.round(W * 0.072)}px 'Cormorant Garamond', serif`;
    ctx.fillStyle = '#F0E8D8';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 8;
    ctx.textAlign = 'left';
    ctx.fillText(nombre, 14, H - (precio ? 36 : 18));
    ctx.restore();

    // Precio
    if (precio) {
      ctx.save();
      ctx.font = `normal ${Math.round(W * 0.058)}px 'Bebas Neue', sans-serif`;
      ctx.fillStyle = `hsl(${currentHue}, 70%, 62%)`;
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = 6;
      ctx.textAlign = 'left';
      ctx.fillText(precio, 14, H - 14);
      ctx.restore();
    }
  }

  // ── UPDATE ────────────────────────────────────────────────────────────────

  function updateHue() {
    // Hue basado en ángulo del puntero desde el centro de la tarjeta
    if (isPointerOver) {
      const dx = px - W / 2, dy = py - H / 2;
      const angle = Math.atan2(dy, dx);           // -π a π
      targetHue = 40 + (angle / Math.PI) * 30;   // 10-70°, gold range
    } else {
      targetHue = 40;
    }
    currentHue += (targetHue - currentHue) * 0.06;
  }

  function updateParticles() {
    particles.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;
      p.age++;

      // Pulso de alpha
      p.alpha += p.alphaDir * p.alphaSpeed;
      if (p.alpha > 0.92 || p.alpha < 0.20) p.alphaDir *= -1;

      // Wrap en bordes
      if (p.x < -4) p.x = W + 4;
      if (p.x > W + 4) p.x = -4;
      if (p.y < -4) p.y = H + 4;
      if (p.y > H + 4) p.y = -4;

      // Reciclar si muy veja
      if (p.age >= p.maxLife) {
        particles[idx] = nuevaParticula(W, H);
      }
    });
  }

  function updateLines() {
    lines.forEach(l => {
      l.angle += l.speed;
      l.waveOffset += 0.015;
      // Mover suavemente por el canvas
      l.x += Math.cos(l.angle) * 0.3;
      l.y += Math.sin(l.angle) * 0.3;
      // Wrap
      if (l.x < -l.length) l.x = W + l.length;
      if (l.x > W + l.length) l.x = -l.length;
      if (l.y < -l.length) l.y = H + l.length;
      if (l.y > H + l.length) l.y = -l.length;
    });
  }

  function updateShake() {
    if (shakeFrames > 0 && parentCard) {
      const s = Math.sin(shakeFrames * 1.2) * (shakeFrames / 12) * 3;
      parentCard.style.transform = `translateX(${s}px)`;
      shakeFrames--;
      if (shakeFrames === 0) parentCard.style.transform = '';
    }
  }

  // ── LOOP ──────────────────────────────────────────────────────────────────

  let rafId = null;
  let running = false;

  function loop() {
    if (!running) return;
    rafId = requestAnimationFrame(loop);

    ctx.clearRect(0, 0, W, H);

    updateHue();
    updateParticles();
    updateLines();
    updateShake();

    drawBackground();
    drawGlow();
    drawLines();
    drawParticles();
    drawClickEffects();
    drawText();
  }

  function iniciar() {
    running = true;
    loop();
  }

  function detener() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
  }

  // ── REDIMENSIONAR ─────────────────────────────────────────────────────────

  function redimensionar() {
    W = canvas.offsetWidth  || 340;
    H = canvas.offsetHeight || 260;
    canvas.width  = W;
    canvas.height = H;
  }

  // ── EVENTOS ───────────────────────────────────────────────────────────────

  function getCanvasPos(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  // Mouse
  canvas.addEventListener('mousemove', e => {
    const pos = getCanvasPos(e.clientX, e.clientY);
    px = pos.x; py = pos.y;
    isPointerOver = true;
  });
  canvas.addEventListener('mouseleave', () => {
    isPointerOver = false;
  });
  canvas.addEventListener('click', e => {
    const pos = getCanvasPos(e.clientX, e.clientY);
    agregarClickEffect(pos.x, pos.y);
    shake();
  });

  // Touch
  canvas.addEventListener('touchstart', e => {
    const t = e.touches[0];
    const pos = getCanvasPos(t.clientX, t.clientY);
    px = pos.x; py = pos.y;
    isPointerOver = true;
    agregarClickEffect(pos.x, pos.y);
    shake();
  }, { passive: true });
  canvas.addEventListener('touchmove', e => {
    const t = e.touches[0];
    const pos = getCanvasPos(t.clientX, t.clientY);
    px = pos.x; py = pos.y;
  }, { passive: true });
  canvas.addEventListener('touchend', () => {
    isPointerOver = false;
  }, { passive: true });

  return { iniciar, detener, redimensionar };
}

// ─── INICIALIZACIÓN GLOBAL ───────────────────────────────────────────────────

const _instancias = new Map(); // canvas → instancia

function iniciarMagicCards(contenedor) {
  contenedor.querySelectorAll('.magic-canvas').forEach(canvas => {
    if (_instancias.has(canvas)) return; // ya inicializada
    const inst = crearInstancia(canvas);
    _instancias.set(canvas, inst);
    inst.iniciar();
  });
}

// Redimensionar todo si el viewport cambia
window.addEventListener('resize', () => {
  _instancias.forEach((inst, canvas) => {
    inst.redimensionar();
  });
}, { passive: true });
