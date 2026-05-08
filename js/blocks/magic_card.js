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

  const starSvg = `<svg width="22" height="22" viewBox="0 0 51 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#c9a84c" d="M25.5 3 31.9 18.4 48.6 19.9 36.5 30.6 40.1 47 25.5 38.5 10.9 47 14.5 30.6 2.4 19.9 19.1 18.4Z"/>
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
