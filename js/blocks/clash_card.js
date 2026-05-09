function renderClashCard(block, idx = 0) {
  const { item, badge_text, title_override } = block;
  const nombre = title_override || item.name;
  const precio = formatPrecio(item.price);

  // Stat 2: calorías o primer tag
  const stat2 = item.calorias
    ? `<div class="cc2-stat">
         <div class="cc2-stat-num">${item.calorias}</div>
         <div class="cc2-stat-label">Kcal</div>
       </div>`
    : item.tags?.length
      ? `<div class="cc2-stat">
           <div class="cc2-stat-num cc2-stat-num--sm">${escHtml(item.tags[0])}</div>
           <div class="cc2-stat-label">Categoría</div>
         </div>`
      : '';

  // Stat 3: alérgenos o guión
  const alerText  = item.alergenos?.length ? item.alergenos.slice(0, 2).join(' · ') : '—';
  const alerLabel = item.alergenos?.length ? 'Alergenos' : 'Sin gluten';

  const imgHtml = item.image_url
    ? `<img class="cc2-img" src="${escHtml(item.image_url)}" alt="${escHtml(nombre)}" loading="lazy">`
    : '';

  return `
    <div class="block-card block-clash-card block--full"
         data-item-id="${item.id}"
         data-block-type="clash_card"
         role="button" tabindex="0"
         aria-label="${escHtml(nombre)}">
      ${imgHtml}
      <div class="cc2-inner">
        <div class="cc2-bg-zone"></div>
        <div class="cc2-body">
          ${badge_text ? `<div class="cc2-badge">${escHtml(badge_text)}</div>` : ''}
          <div class="cc2-name">${escHtml(nombre)}</div>
          ${item.description ? `<div class="cc2-desc">${escHtml(item.description)}</div>` : ''}
        </div>
        <div class="cc2-stats">
          <div class="cc2-stat">
            <div class="cc2-stat-num">${escHtml(precio)}</div>
            <div class="cc2-stat-label">Precio</div>
          </div>
          ${stat2}
          <div class="cc2-stat cc2-stat--last">
            <div class="cc2-stat-num cc2-stat-num--sm">${escHtml(alerText)}</div>
            <div class="cc2-stat-label">${escHtml(alerLabel)}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}
