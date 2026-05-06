function renderFlareCard(block) {
  const { item, badge_text, title_override } = block;
  const nombre = title_override || item.name;
  const precio = formatPrecio(item.price);

  const tagsHtml = (item.tags || []).slice(0, 3)
    .map(t => `<span class="fc-tag">${escHtml(t)}</span>`)
    .join('');

  const imgHtml = item.image_url
    ? `<img src="${item.image_url}" alt="${escHtml(nombre)}" loading="lazy">`
    : `<div class="card-placeholder" style="height:320px">
         <span class="card-placeholder-name">${escHtml(nombre)}</span>
       </div>`;

  return `
    <div class="block-card block-flare-card block--full"
         data-item-id="${item.id}"
         data-block-type="flare_card"
         role="button" tabindex="0"
         aria-label="${escHtml(nombre)}">
      <div class="fc-img-wrap">${imgHtml}</div>
      <div class="fc-flare" aria-hidden="true"></div>
      <div class="fc-shimmer" aria-hidden="true"></div>
      <div class="fc-overlay" aria-hidden="true"></div>
      <div class="fc-accent" aria-hidden="true"></div>
      ${badge_text ? `<span class="card-badge">${escHtml(badge_text)}</span>` : ''}
      <div class="fc-content">
        ${tagsHtml ? `<div class="fc-tags">${tagsHtml}</div>` : ''}
        <div class="fc-name">${escHtml(nombre)}</div>
        ${item.description ? `<p class="fc-desc">${escHtml(item.description)}</p>` : ''}
        <div class="fc-price">${precio}</div>
      </div>
    </div>
  `;
}

function initFlareCards() {
  const cards = document.querySelectorAll('.block-flare-card');
  if (!cards.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      let delay = 0;
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        setTimeout(() => entry.target.classList.add('fc-visible'), delay);
        delay += 80;
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }
  );

  cards.forEach(card => {
    io.observe(card);

    const shimmer = card.querySelector('.fc-shimmer');
    if (!shimmer) return;

    function paintShimmer(x, y, intensity) {
      shimmer.style.background =
        `radial-gradient(ellipse 72% 58% at ${x}% ${y}%,` +
        ` rgba(200,150,42,${intensity}) 0%,` +
        ` rgba(200,150,42,${(intensity * 0.22).toFixed(2)}) 44%,` +
        ` transparent 70%)`;
    }

    card.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      const r = card.getBoundingClientRect();
      const x = +((e.clientX - r.left) / r.width * 100).toFixed(1);
      const y = +((e.clientY - r.top) / r.height * 100).toFixed(1);
      shimmer.style.transition = 'none';
      shimmer.style.opacity = '1';
      paintShimmer(x, y, 0.34);
    });

    card.addEventListener('pointerleave', e => {
      if (e.pointerType === 'touch') return;
      shimmer.style.transition = 'opacity 0.5s ease';
      shimmer.style.opacity = '0';
    });

    card.addEventListener('touchstart', e => {
      const t = e.touches[0];
      const r = card.getBoundingClientRect();
      const x = +((t.clientX - r.left) / r.width * 100).toFixed(1);
      const y = +((t.clientY - r.top) / r.height * 100).toFixed(1);
      shimmer.style.transition = 'opacity 0.12s ease';
      shimmer.style.opacity = '1';
      paintShimmer(x, y, 0.46);
    }, { passive: true });

    card.addEventListener('touchend', () => {
      shimmer.style.transition = 'opacity 0.65s ease';
      shimmer.style.opacity = '0';
    });

    // Click abre el modal propio
    card.addEventListener('click', () => {
      const itemId = card.dataset.itemId;
      if (itemId) abrirFlareModal(itemId);
    });
  });
}

// ── FLARE MODAL ─────────────────────────────────────────────────────────────

let _flareItemsMap = {};
let _flareOpen = false;

function iniciarFlareModal() {
  if (document.getElementById('flare-modal')) return;

  document.body.insertAdjacentHTML('beforeend', `
    <div id="flare-modal" class="fm" aria-hidden="true" role="dialog" aria-modal="true">
      <div class="fm-image-zone" id="fm-image-zone">
        <img class="fm-img" id="fm-img" src="" alt="">
        <div class="fm-sweep" aria-hidden="true"></div>
        <div class="fm-img-overlay" aria-hidden="true"></div>
        <div class="fm-img-accent" aria-hidden="true"></div>
      </div>
      <div class="fm-panel" id="fm-panel">
        <div class="fm-handle" aria-hidden="true"></div>
        <button class="fm-close" id="fm-close" aria-label="Cerrar">&#x2715;</button>
        <div class="fm-body" id="fm-body"></div>
      </div>
    </div>
  `);

  document.getElementById('fm-close').addEventListener('click', cerrarFlareModal);
  document.getElementById('fm-image-zone').addEventListener('click', cerrarFlareModal);

  // Swipe up en el panel para cerrar
  const panel = document.getElementById('fm-panel');
  let startY = 0;

  panel.addEventListener('touchstart', e => {
    startY = e.touches[0].clientY;
  }, { passive: true });

  panel.addEventListener('touchmove', e => {
    const dy = e.touches[0].clientY - startY;
    if (dy > 0 && panel.scrollTop === 0) {
      document.getElementById('flare-modal').style.transform = `translateY(${Math.min(dy * 0.4, 80)}px)`;
    }
  }, { passive: true });

  panel.addEventListener('touchend', e => {
    const dy = e.changedTouches[0].clientY - startY;
    const modal = document.getElementById('flare-modal');
    modal.style.transform = '';
    if (dy > 72) cerrarFlareModal();
  }, { passive: true });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && _flareOpen) cerrarFlareModal();
  });
}

function registrarFlareItems(blocks) {
  blocks.forEach(b => {
    if (b.item) _flareItemsMap[b.item.id] = b.item;
  });
}

function abrirFlareModal(itemId) {
  const item = _flareItemsMap[itemId];
  if (!item) return;

  const modal  = document.getElementById('flare-modal');
  const img    = document.getElementById('fm-img');
  const sweep  = modal.querySelector('.fm-sweep');
  const body   = document.getElementById('fm-body');

  // Imagen
  img.src = item.image_url || '';
  img.alt = item.name;

  // Cuerpo
  const tagsHtml = (item.tags || []).length
    ? `<div class="fm-tags">${item.tags.map(t => `<span class="fm-tag">${escHtml(t)}</span>`).join('')}</div>`
    : '';
  const alergenosHtml = (item.alergenos || []).length
    ? `<p class="fm-alergenos"><span class="fm-label">Contiene:</span> ${item.alergenos.map(escHtml).join(', ')}</p>`
    : '';
  const caloriasHtml = item.calorias
    ? `<p class="fm-calorias">${item.calorias} kcal</p>`
    : '';
  const horarioHtml = (item.disponible_desde && item.disponible_hasta)
    ? `<p class="fm-horario">Disponible ${item.disponible_desde.slice(0,5)} – ${item.disponible_hasta.slice(0,5)}</p>`
    : '';

  body.innerHTML = `
    <div class="fm-name">${escHtml(item.name)}</div>
    <div class="fm-price">${formatPrecio(item.price)}</div>
    ${item.description ? `<p class="fm-desc">${escHtml(item.description)}</p>` : ''}
    ${tagsHtml}
    ${alergenosHtml}
    ${caloriasHtml}
    ${horarioHtml}
  `;

  // Reset sweep y abrir
  sweep.classList.remove('fm-sweep--run');
  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('fm--open');
  document.body.style.overflow = 'hidden';
  _flareOpen = true;

  // Flare sweep dispara después de que el modal baja
  setTimeout(() => sweep.classList.add('fm-sweep--run'), 320);
}

function cerrarFlareModal() {
  const modal = document.getElementById('flare-modal');
  if (!modal) return;
  modal.classList.remove('fm--open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  _flareOpen = false;

  setTimeout(() => {
    modal.querySelector('.fm-sweep')?.classList.remove('fm-sweep--run');
  }, 450);
}
