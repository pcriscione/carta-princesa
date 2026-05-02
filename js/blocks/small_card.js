const ROTACIONES = ['--rot-1','--rot-2','--rot-3','--rot-4','--rot-5','--rot-6'];

function renderSmallCard(block, idx = 0) {
  const { item, badge_text, title_override } = block;
  const nombre = title_override || item.name;
  const rot    = ROTACIONES[idx % ROTACIONES.length];
  const precio = formatPrecio(item.price);

  // Panel 1 — imagen
  const imgHtml = item.image_url
    ? `<img src="${item.image_url}" alt="${escHtml(nombre)}" loading="lazy">`
    : `<div class="card-placeholder" style="height:180px"><span class="card-placeholder-name">${escHtml(nombre)}</span></div>`;

  // Panel 2 — nombre + descripción
  const panel2 = `
    <div class="sc-panel sc-panel--info">
      <div class="sc-name">${escHtml(nombre)}</div>
      ${item.description
        ? `<div class="sc-desc">${escHtml(item.description)}</div>`
        : '<div class="sc-desc sc-desc--empty">Sin descripción</div>'}
      <div class="sc-price">${precio}</div>
    </div>
  `;

  // Panel 3 — tags + alérgenos + calorías
  const tagsHtml = (item.tags || []).length
    ? `<div class="sc-tags">${item.tags.map(t => `<span class="sc-tag">${escHtml(t)}</span>`).join('')}</div>`
    : '';

  const alergenosHtml = (item.alergenos || []).length
    ? `<div class="sc-alergenos"><span class="sc-label">Contiene</span> ${item.alergenos.map(escHtml).join(', ')}</div>`
    : '';

  const caloriasHtml = item.calorias
    ? `<div class="sc-calorias">${item.calorias} kcal</div>`
    : '';

  const sinInfo = !tagsHtml && !alergenosHtml && !caloriasHtml;

  const panel3 = `
    <div class="sc-panel sc-panel--meta">
      ${tagsHtml}
      ${alergenosHtml}
      ${caloriasHtml}
      ${sinInfo ? '<div class="sc-desc sc-desc--empty">Sin información adicional</div>' : ''}
      <div class="sc-price">${precio}</div>
    </div>
  `;

  // Indicadores de panel (3 puntos)
  const dots = `
    <div class="sc-dots" aria-hidden="true">
      <span class="sc-dot sc-dot--active"></span>
      <span class="sc-dot"></span>
      <span class="sc-dot"></span>
    </div>
  `;

  return `
    <div class="block-card block-small-card block--half rotated"
         style="--rot: var(${rot})"
         data-item-id="${item.id}"
         data-block-type="small_card"
         data-slide="0"
         role="button" tabindex="0"
         aria-label="${escHtml(nombre)}">
      <div class="sc-track">
        <div class="sc-panel sc-panel--img">
          ${imgHtml}
          <div class="card-overlay"></div>
          ${badge_text ? `<span class="card-badge">${escHtml(badge_text)}</span>` : ''}
          <div class="card-text">
            <div class="card-name">${escHtml(nombre)}</div>
            <div class="card-price">${precio}</div>
          </div>
        </div>
        ${panel2}
        ${panel3}
      </div>
      ${dots}
    </div>
  `;
}
