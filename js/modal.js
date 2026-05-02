let _itemsMap  = {};   // id → item, populado al cargar la carta
let _modalOpen = false;

function iniciarModal() {
  // Insertar estructura en el DOM si no existe
  if (document.getElementById('modal-backdrop')) return;

  document.body.insertAdjacentHTML('beforeend', `
    <div id="modal-backdrop" class="modal-backdrop" role="dialog" aria-modal="true" aria-hidden="true">
    </div>
    <div id="modal-sheet" class="modal-sheet">
      <div class="modal-handle"></div>
      <button class="modal-close" id="modal-close-btn" aria-label="Cerrar">&#x2715;</button>
      <div id="modal-media" class="modal-media"></div>
      <div id="modal-body" class="modal-body"></div>
    </div>
  `);

  document.getElementById('modal-backdrop').addEventListener('click', cerrarModal);
  document.getElementById('modal-close-btn').addEventListener('click', cerrarModal);

  // Cerrar con swipe hacia abajo
  _iniciarSwipe();

  // Cerrar con tecla Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && _modalOpen) cerrarModal();
  });
}

// Registra el mapa de items para lookup rápido
function registrarItems(blocks) {
  _itemsMap = {};
  blocks.forEach(b => {
    if (b.item) _itemsMap[b.item.id] = b.item;
  });
}

// Delegación de clicks — small_card y large_card usan flip, el resto abre modal
document.addEventListener('click', e => {
  const card = e.target.closest('[data-item-id]');
  if (!card) return;
  if (card.classList.contains('block-small-card')) return;
  if (card.classList.contains('block-large-card')) return;
  abrirModal(card.dataset.itemId);
});

function abrirModal(itemId) {
  const item = _itemsMap[itemId];
  if (!item) return;

  _renderContenido(item);

  const backdrop = document.getElementById('modal-backdrop');
  const sheet    = document.getElementById('modal-sheet');

  backdrop.setAttribute('aria-hidden', 'false');
  backdrop.classList.add('open');
  sheet.classList.add('open');
  document.body.style.overflow = 'hidden';
  _modalOpen = true;

  // Scroll al top del sheet al abrir
  sheet.scrollTop = 0;
}

function cerrarModal() {
  const backdrop = document.getElementById('modal-backdrop');
  const sheet    = document.getElementById('modal-sheet');
  if (!backdrop || !sheet) return;

  backdrop.classList.remove('open');
  sheet.classList.remove('open');
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  _modalOpen = false;

  // Limpiar media con delay para que no se vea el flash al cerrar
  setTimeout(() => {
    const media = document.getElementById('modal-media');
    if (media) {
      const video = media.querySelector('video');
      if (video) { video.pause(); video.src = ''; }
      media.innerHTML = '';
    }
  }, 400);
}

function _renderContenido(item) {
  const media = document.getElementById('modal-media');
  const body  = document.getElementById('modal-body');

  // Media
  if (item.video_url) {
    media.innerHTML = `
      <video autoplay muted loop playsinline>
        <source src="${item.video_url}">
      </video>`;
  } else if (item.image_url) {
    media.innerHTML = `<img src="${item.image_url}" alt="${escHtml(item.name)}" loading="eager">`;
  } else {
    media.innerHTML = `
      <div class="modal-media-placeholder">
        <span>${escHtml(item.name)}</span>
      </div>`;
  }

  // Tags
  const tagsHtml = (item.tags || []).length
    ? `<div class="modal-tags">${item.tags.map(t => `<span class="modal-tag">${escHtml(t)}</span>`).join('')}</div>`
    : '';

  // Alérgenos
  const alergenosHtml = (item.alergenos || []).length
    ? `<div class="modal-alergenos"><strong>Contiene:</strong> ${item.alergenos.map(escHtml).join(', ')}</div>`
    : '';

  // Calorías
  const caloriasHtml = item.calorias
    ? `<div class="modal-calorias">${item.calorias} kcal</div>`
    : '';

  // Horario
  const horarioHtml = (item.disponible_desde && item.disponible_hasta)
    ? `<div class="modal-horario">Disponible ${item.disponible_desde.slice(0,5)} – ${item.disponible_hasta.slice(0,5)}</div>`
    : '';

  body.innerHTML = `
    <div class="modal-name">${escHtml(item.name)}</div>
    <div class="modal-price">${formatPrecio(item.price)}</div>
    ${item.description ? `<div class="modal-desc">${escHtml(item.description)}</div>` : ''}
    ${tagsHtml}
    ${alergenosHtml}
    ${caloriasHtml}
    ${horarioHtml}
  `;
}

// Swipe hacia abajo para cerrar
function _iniciarSwipe() {
  const sheet = document.getElementById('modal-sheet');
  let startY = 0;
  let isDragging = false;

  sheet.addEventListener('touchstart', e => {
    // Solo activar swipe si el sheet está en el top del scroll
    if (sheet.scrollTop > 0) return;
    startY = e.touches[0].clientY;
    isDragging = true;
  }, { passive: true });

  sheet.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const dy = e.touches[0].clientY - startY;
    if (dy > 0) {
      sheet.style.transform = `translateX(-50%) translateY(${dy}px)`;
    }
  }, { passive: true });

  sheet.addEventListener('touchend', e => {
    if (!isDragging) return;
    isDragging = false;
    const dy = e.changedTouches[0].clientY - startY;
    sheet.style.transform = '';
    if (dy > 80) cerrarModal();
  }, { passive: true });
}
