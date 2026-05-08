/**
 * Holo Card Engine
 * Holographic trading card: 3D tilt, rainbow shine, glare, ease-back.
 * Adapted from CodePen — multiple instances, touch support, no jQuery.
 */

function iniciarHoloCards(contenedor) {
  contenedor.querySelectorAll('.block-holo-card').forEach(blockCard => {
    const wrap  = blockCard.querySelector('.holo-wrap');
    const inner = blockCard.querySelector('.holo-inner');
    if (!wrap || !inner) return;

    // ── Utilidades (igual que el original) ───────────────────────────────────
    const round  = (v, p = 3) => parseFloat(v.toFixed(p));
    const clamp  = (v, lo = 0, hi = 100) => Math.min(Math.max(v, lo), hi);
    const adjust = (v, fLo, fHi, tLo, tHi) =>
      round(tLo + ((tHi - tLo) * (v - fLo)) / (fHi - fLo));
    const ease   = x => x < 0.5 ? 4*x*x*x : 1 - Math.pow(-2*x + 2, 3) / 2;

    // ── Ease animado ─────────────────────────────────────────────────────────
    let easer = null;
    function easedFunc(ms, onProgress, onComplete) {
      const start = performance.now();
      let canceled = false;
      (function loop() {
        if (canceled) return;
        const t = (performance.now() - start) / ms;
        onProgress(ease(Math.min(t, 1)));
        if (t < 1) requestAnimationFrame(loop);
        else if (onComplete) onComplete();
      })();
      return { cancel() { canceled = true; } };
    }

    // ── Actualizar variables CSS en el wrapper ────────────────────────────────
    function cardUpdate(px, py) {
      const cx = px - 50;
      const cy = py - 50;
      const vars = {
        '--pointer-x':            `${px}%`,
        '--pointer-y':            `${py}%`,
        '--background-x':         `${adjust(px, 0, 100, 35, 65)}%`,
        '--background-y':         `${adjust(py, 0, 100, 35, 65)}%`,
        '--pointer-from-center':   clamp(Math.sqrt(cy*cy + cx*cx) / 50, 0, 1),
        '--pointer-from-top':      py / 100,
        '--pointer-from-left':     px / 100,
        '--rotate-x':             `${round(-(cx / 5))}deg`,
        '--rotate-y':             `${round(cy  / 4)}deg`,
      };
      for (const [k, v] of Object.entries(vars)) wrap.style.setProperty(k, v);
    }

    // ── Posición del puntero relativa al inner ───────────────────────────────
    function ptrPos(e) {
      const r = inner.getBoundingClientRect();
      const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? (r.left + r.width  / 2);
      const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? (r.top  + r.height / 2);
      return {
        px: clamp(((clientX - r.left) / r.width)  * 100, 0, 100),
        py: clamp(((clientY - r.top)  / r.height) * 100, 0, 100),
      };
    }

    // ── Activar / desactivar ─────────────────────────────────────────────────
    function activate() {
      if (easer) { easer.cancel(); easer = null; }
      inner.classList.add('active');
      wrap.classList.add('active');
      wrap.style.setProperty('--card-opacity', 1);
    }

    function deactivate(fromPx = 50, fromPy = 50) {
      easer = easedFunc(
        1000,
        p => cardUpdate(
          adjust(p, 0, 1, fromPx, 50),
          adjust(p, 0, 1, fromPy, 50)
        ),
        () => {
          inner.classList.remove('active');
          wrap.classList.remove('active');
          wrap.style.setProperty('--card-opacity', 0);
        }
      );
    }

    // ── Eventos de puntero (mouse + stylus) ──────────────────────────────────
    inner.addEventListener('pointerenter', activate);
    inner.addEventListener('pointermove',  e => {
      const { px, py } = ptrPos(e);
      cardUpdate(px, py);
    });
    inner.addEventListener('pointerleave', e => {
      const { px, py } = ptrPos(e);
      deactivate(px, py);
    });

    // ── Touch ────────────────────────────────────────────────────────────────
    inner.addEventListener('touchstart', e => {
      activate();
      const { px, py } = ptrPos(e);
      cardUpdate(px, py);
    }, { passive: true });

    inner.addEventListener('touchmove', e => {
      const { px, py } = ptrPos(e);
      cardUpdate(px, py);
    }, { passive: true });

    inner.addEventListener('touchend', () => deactivate(), { passive: true });

    // ── Animación de entrada (sweep desde esquina al centro) ─────────────────
    cardUpdate(78, 22);
    setTimeout(() => {
      easer = easedFunc(
        2800,
        p => cardUpdate(adjust(p, 0, 1, 78, 50), adjust(p, 0, 1, 22, 50)),
        () => {}
      );
    }, 600);
  });
}
