const ROTACIONES = ['--rot-1','--rot-2','--rot-3','--rot-4','--rot-5','--rot-6'];

function renderSmallCard(block, idx = 0) {
  const { item, badge_text, title_override } = block;
  const nombre = title_override || item.name;
  const rot    = ROTACIONES[idx % ROTACIONES.length];
  const precio = formatPrecio(item.price);

  // Frente
  const imgHtml = item.image_url
    ? `<img src="${item.image_url}" alt="${escHtml(nombre)}" loading="lazy">`
    : `<div class="card-placeholder" style="height:180px"><span class="card-placeholder-name">${escHtml(nombre)}</span></div>`;

  // Tags
  const tagsHtml = (item.tags || []).length
    ? `<div class="flip-tags">${item.tags.map(t => `<span class="flip-tag">${escHtml(t)}</span>`).join('')}</div>`
    : '';

  // Meta (alérgenos + calorías)
  const metaPartes = [];
  if ((item.alergenos || []).length) metaPartes.push(item.alergenos.map(escHtml).join(', '));
  if (item.calorias) metaPartes.push(`${item.calorias} kcal`);
  const metaHtml = metaPartes.length
    ? `<div class="flip-meta">${metaPartes.join(' · ')}</div>`
    : '';

  return `
    <div class="block-card block-small-card block--half rotated"
         style="--rot: var(${rot})"
         data-item-id="${item.id}"
         data-block-type="small_card"
         role="button" tabindex="0"
         aria-label="${escHtml(nombre)}">
      <div class="flip-inner">

        <div class="flip-front">
          ${imgHtml}
          <div class="card-overlay"></div>
          ${badge_text ? `<span class="card-badge">${escHtml(badge_text)}</span>` : ''}
          <div class="card-text">
            <div class="card-name">${escHtml(nombre)}</div>
            <div class="card-price">${precio}</div>
          </div>
        </div>

        <div class="flip-back">
          <div class="flip-back-name">${escHtml(nombre)}</div>
          ${item.description ? `<div class="flip-back-desc">${escHtml(item.description)}</div>` : ''}
          ${tagsHtml}
          ${metaHtml}
          <div class="flip-back-price">${precio}</div>
        </div>

      </div>
    </div>
  `;
}
