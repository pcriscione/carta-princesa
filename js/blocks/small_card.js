// Rotaciones cíclicas por índice (se asignan en render.js)
const ROTACIONES = ['--rot-1','--rot-2','--rot-3','--rot-4','--rot-5','--rot-6'];

function renderSmallCard(block, idx = 0) {
  const { item, badge_text, title_override } = block;
  const nombre = title_override || item.name;
  const rot    = ROTACIONES[idx % ROTACIONES.length];
  const precio = formatPrecio(item.price);

  return `
    <div class="block-card block--half rotated"
         style="--rot: var(${rot})"
         data-item-id="${item.id}"
         data-block-type="small_card"
         role="button" tabindex="0"
         aria-label="${nombre}">
      ${imagenOPlaceholder(item.image_url, nombre, 'small')}
      <div class="card-overlay"></div>
      ${badge_text ? `<span class="card-badge">${badge_text}</span>` : ''}
      <div class="card-text">
        <div class="card-name">${nombre}</div>
        <div class="card-price">${precio}</div>
      </div>
    </div>
  `;
}
