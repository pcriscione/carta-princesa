function renderMagicCard(block, idx = 0) {
  const { item, badge_text, title_override } = block;
  const nombre = title_override || item.name;
  const precio = formatPrecio(item.price);

  const tagsHtml = item.tags?.length
    ? item.tags.map(t => `<span class="mc-back-tag">${escHtml(t)}</span>`).join('')
    : '';

  const alergenosHtml = item.alergenos?.length
    ? `<div class="mc-back-alergenos">⚠ ${item.alergenos.map(escHtml).join(', ')}</div>`
    : '';

  const caloriasHtml = item.calorias
    ? `<div class="mc-back-cal">${item.calorias} kcal</div>`
    : '';

  const starSvg = `<svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="18" r="17" fill="#c9a84c" opacity="0.15"/>
    <circle cx="18" cy="18" r="17" fill="none" stroke="#c9a84c" stroke-width="1.8"/>
    <rect x="16.2" y="9" width="3.6" height="12" rx="1.8" fill="#c9a84c"/>
    <circle cx="18" cy="26.5" r="2" fill="#c9a84c"/>
  </svg>`;

  return `
    <div class="block-card block-magic-card block--full"
         data-item-id="${item.id}"
         data-block-type="magic_card"
         aria-label="${escHtml(nombre)}">
      <div class="mc-inner">

        <!-- FRENTE -->
        <div class="mc-front">
          <canvas class="magic-canvas"
                  data-image="${escHtml(item.image_url || '')}"
                  data-name="${escHtml(nombre)}"
                  data-price="${escHtml(precio)}">
          </canvas>
          ${badge_text ? `<span class="card-badge">${escHtml(badge_text)}</span>` : ''}
          <span class="star-shimmer" role="button" aria-label="Ver detalles" tabindex="0">
            ${starSvg}
          </span>
        </div>

        <!-- REVERSO -->
        <div class="mc-back">
          <div class="mc-back-content">
            <div class="mc-back-name">${escHtml(nombre)}</div>
            <div class="mc-back-price">${precio}</div>
            ${item.description ? `<p class="mc-back-desc">${escHtml(item.description)}</p>` : ''}
            ${tagsHtml ? `<div class="mc-back-tags">${tagsHtml}</div>` : ''}
            ${alergenosHtml}
            ${caloriasHtml}
          </div>
          <div class="mc-back-hint">toca para volver</div>
        </div>

      </div>
    </div>
  `;
}
