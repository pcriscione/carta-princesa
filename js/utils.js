// Formatea precio en pesos chilenos: 15900 → "$15.900"
function formatPrecio(precio) {
  if (!precio && precio !== 0) return '';
  return '$' + Number(precio).toLocaleString('es-CL');
}

// Devuelve <img> o placeholder oscuro si no hay imagen
function imagenOPlaceholder(imageUrl, nombre, tipo) {
  const claseAltura = {
    small:       'block-small-card',
    large:       'block-large-card',
    hero:        'block-hero-video',
    recommended: 'block-recommended-card',
  }[tipo] || '';

  if (imageUrl) {
    return `<img src="${imageUrl}" alt="${escHtml(nombre)}" loading="lazy">`;
  }
  return `
    <div class="card-placeholder ${claseAltura}">
      <span class="card-placeholder-name">${escHtml(nombre)}</span>
    </div>
  `;
}

// Escapa caracteres HTML para evitar XSS con datos de la BD
function escHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
