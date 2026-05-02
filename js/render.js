const BLOCK_COMPONENTS = {
  small_card:        renderSmallCard,
  small_video:       renderSmallVideo,
  large_card:        renderLargeCard,
  horizontal_banner: renderHorizontalBanner,
  hero_video:        renderHeroVideo,
  recommended_card:  renderRecommendedCard,
  featured_pair:     renderFeaturedPair,
  masonry_image:     renderMasonryImage,
};

// Contadores por sección para rotaciones e índices de altura
let _smallIdx   = 0;
let _masonryIdx = 0;

function renderBlock(block, idx) {
  const fn = BLOCK_COMPONENTS[block.block_type] ?? renderSmallCard;

  // Bloques que usan índice para rotación o altura
  if (block.block_type === 'small_card' || block.block_type === 'small_video') {
    return fn(block, _smallIdx++);
  }
  if (block.block_type === 'masonry_image') {
    return fn(block, _masonryIdx++);
  }
  return fn(block, idx);
}

// featured_pair: agrupa de a 2 bloques consecutivos del mismo tipo
function renderBlocksFeaturedPair(blocks) {
  const resultado = [];
  let i = 0;
  while (i < blocks.length) {
    if (
      blocks[i].block_type === 'featured_pair' &&
      blocks[i + 1]?.block_type === 'featured_pair'
    ) {
      resultado.push(renderFeaturedPair(blocks[i], blocks[i + 1]));
      i += 2;
    } else {
      resultado.push(renderBlock(blocks[i], i));
      i++;
    }
  }
  return resultado.join('');
}

function renderSeccion(seccion, todosLosBlocks) {
  // Resetear contadores de índice por sección
  _smallIdx   = 0;
  _masonryIdx = 0;

  const blocksSeccion = todosLosBlocks
    .filter(b => b.section_id === seccion.id)
    .filter(b => estaDisponible(b.item));

  if (!blocksSeccion.length) return '';

  return `
    <section class="menu-section" id="${seccion.slug}">
      <h2 class="section-title">${escHtml(seccion.name)}</h2>
      <div class="blocks-grid">
        ${renderBlocksFeaturedPair(blocksSeccion)}
      </div>
    </section>
  `;
}

function renderCarta({ secciones, blocks }) {
  return secciones
    .filter(s => s.is_active)
    .map(s => renderSeccion(s, blocks))
    .join('');
}

// Skeletons para el estado de carga inicial
function renderSkeletons() {
  return `
    <section class="menu-section">
      <div class="blocks-grid">
        <div class="skeleton skeleton--full"></div>
        <div class="skeleton skeleton--half"></div>
        <div class="skeleton skeleton--half"></div>
        <div class="skeleton skeleton--full"></div>
        <div class="skeleton skeleton--half"></div>
        <div class="skeleton skeleton--half"></div>
      </div>
    </section>
  `;
}
