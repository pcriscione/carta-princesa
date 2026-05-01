// Alturas rotativas: 160 / 220 / 190 px según índice
const MASONRY_HEIGHTS = [160, 220, 190];

function renderMasonryImage(block, idx = 0) {
  const { item, title_override } = block;
  const nombre = title_override || item.name;
  const altura = MASONRY_HEIGHTS[idx % MASONRY_HEIGHTS.length];

  const imgHtml = item.image_url
    ? `<img src="${item.image_url}" alt="${escHtml(nombre)}" loading="lazy" style="height:${altura}px">`
    : `<div class="card-placeholder" style="height:${altura}px"><span class="card-placeholder-name">${escHtml(nombre)}</span></div>`;

  return `
    <div class="block-card block-masonry-image block--half"
         style="height:${altura}px"
         data-item-id="${item.id}"
         data-block-type="masonry_image"
         role="button" tabindex="0"
         aria-label="${escHtml(nombre)}">
      ${imgHtml}
      <div class="card-overlay"></div>
    </div>
  `;
}
