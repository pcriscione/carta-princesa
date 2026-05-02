function renderLargeCard(block) {
  const { item, badge_text, title_override } = block;
  const nombre = title_override || item.name;
  const precio = formatPrecio(item.price);

  // Reverso — igual que el modal
  const tagsHtml = (item.tags || []).length
    ? `<div class="lc-back-tags">${item.tags.map(t => `<span class="lc-back-tag">${escHtml(t)}</span>`).join('')}</div>`
    : '';

  const alergenosHtml = (item.alergenos || []).length
    ? `<div class="lc-back-alergenos"><span class="lc-back-label">Contiene:</span> ${item.alergenos.map(escHtml).join(', ')}</div>`
    : '';

  const caloriasHtml = item.calorias
    ? `<div class="lc-back-calorias">${item.calorias} kcal</div>`
    : '';

  const horarioHtml = (item.disponible_desde && item.disponible_hasta)
    ? `<div class="lc-back-horario">Disponible ${item.disponible_desde.slice(0,5)} – ${item.disponible_hasta.slice(0,5)}</div>`
    : '';

  return `
    <div class="block-card block-large-card block--full"
         data-item-id="${item.id}"
         data-block-type="large_card"
         role="button" tabindex="0"
         aria-label="${escHtml(nombre)}">
      <div class="lc-flip-inner">
        <div class="lc-front">
          ${imagenOPlaceholder(item.image_url, nombre, 'large')}
          <div class="card-overlay"></div>
          ${badge_text ? `<span class="card-badge">${escHtml(badge_text)}</span>` : ''}
          <div class="card-text">
            <div class="card-name">${escHtml(nombre)}</div>
            <div class="card-price">${precio}</div>
          </div>
        </div>
        <div class="lc-back">
          <div class="lc-back-name">${escHtml(nombre)}</div>
          <div class="lc-back-price">${precio}</div>
          ${item.description ? `<div class="lc-back-desc">${escHtml(item.description)}</div>` : ''}
          ${tagsHtml}
          ${alergenosHtml}
          ${caloriasHtml}
          ${horarioHtml}
        </div>
      </div>
    </div>
  `;
}
