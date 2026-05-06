function renderCinematicCard(block) {
  const { item, badge_text, title_override } = block;
  const nombre = title_override || item.name;
  const precio = formatPrecio(item.price);

  const tagsHtml = (item.tags || []).slice(0, 3)
    .map(t => `<span class="cc-tag">${escHtml(t)}</span>`)
    .join('');

  const imgHtml = item.image_url
    ? `<img src="${item.image_url}" alt="${escHtml(nombre)}" loading="lazy">`
    : `<div class="card-placeholder" style="height:300px">
         <span class="card-placeholder-name">${escHtml(nombre)}</span>
       </div>`;

  return `
    <div class="block-card block-cinematic-card block--full"
         data-item-id="${item.id}"
         data-block-type="cinematic_card"
         role="button" tabindex="0"
         aria-label="${escHtml(nombre)}">
      <div class="cc-img-wrap">${imgHtml}</div>
      <div class="cc-shimmer" aria-hidden="true"></div>
      <div class="cc-overlay" aria-hidden="true"></div>
      ${badge_text ? `<span class="card-badge">${escHtml(badge_text)}</span>` : ''}
      <div class="cc-content">
        ${tagsHtml ? `<div class="cc-tags">${tagsHtml}</div>` : ''}
        <div class="cc-name">${escHtml(nombre)}</div>
        ${item.description ? `<p class="cc-desc">${escHtml(item.description)}</p>` : ''}
        <div class="cc-price">${precio}</div>
      </div>
    </div>
  `;
}

function initCinematicCards() {
  const cards = document.querySelectorAll('.block-cinematic-card');
  if (!cards.length) return;

  // Scroll entrance with stagger for multiple visible cards
  const io = new IntersectionObserver(
    (entries) => {
      let delay = 0;
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        setTimeout(() => entry.target.classList.add('cc-visible'), delay);
        delay += 80;
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -32px 0px' }
  );

  cards.forEach(card => {
    io.observe(card);

    const shimmer = card.querySelector('.cc-shimmer');
    if (!shimmer) return;

    function setShimmer(x, y) {
      shimmer.style.background =
        `radial-gradient(circle at ${x}% ${y}%,` +
        ` rgba(200,150,42,0.30) 0%,` +
        ` rgba(200,150,42,0.08) 38%,` +
        ` transparent 65%)`;
    }

    function clearShimmer() {
      shimmer.style.transition = 'opacity 0.5s ease';
      shimmer.style.opacity = '0';
    }

    function showShimmer(x, y) {
      shimmer.style.transition = 'none';
      shimmer.style.opacity = '1';
      setShimmer(x, y);
    }

    // Desktop: tilt + shimmer on pointermove
    card.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      const r = card.getBoundingClientRect();
      const x = +((e.clientX - r.left) / r.width * 100).toFixed(1);
      const y = +((e.clientY - r.top) / r.height * 100).toFixed(1);
      showShimmer(x, y);
    });

    card.addEventListener('pointerleave', e => {
      if (e.pointerType === 'touch') return;
      clearShimmer();
    });

    // Mobile: shimmer expands from touch point on press
    card.addEventListener('touchstart', e => {
      const t = e.touches[0];
      const r = card.getBoundingClientRect();
      const x = +((t.clientX - r.left) / r.width * 100).toFixed(1);
      const y = +((t.clientY - r.top) / r.height * 100).toFixed(1);
      showShimmer(x, y);
    }, { passive: true });

    card.addEventListener('touchend', () => {
      setTimeout(clearShimmer, 380);
    });
  });
}
