# BRIEF v2 — Carta Digital La Princesa
**Para:** Claude Code  
**Proyecto:** `carta-laprincesa` — Cloudflare Pages  
**Stack:** HTML + CSS + Vanilla JS — sin frameworks, sin npm, sin build step

---

## Contexto

La Princesa es un restaurante peruano en Chicureo/Colina, Chile.  
Existe una app admin separada en `admin.laprincesa.cl` con Supabase que gestiona recetas, costos y márgenes.  
Este proyecto es **exclusivamente el frontend público de la carta** — solo lectura, sin auth.

```
laprincesa.cl          ← este proyecto (carta pública, estática, solo lectura)
admin.laprincesa.cl    ← app existente (no tocar)
Supabase               ← fuente de verdad compartida
```

---

## Stack técnico

- HTML + CSS + Vanilla JS (sin React, Vue, Tailwind, npm)
- Supabase JS SDK v2 via CDN
- Deploy: Cloudflare Pages → repo GitHub `carta-laprincesa`
- Sin build step — archivos estáticos directos
- Referencia visual: **390px** de ancho, funciona entre 360px y 430px sin scroll horizontal

---

## Estructura de archivos

```
/
├── index.html
├── css/
│   ├── tokens.css          ← variables de diseño
│   ├── layout.css          ← grid, contenedor, secciones
│   ├── blocks.css          ← estilos de cada block_type
│   └── modal.css           ← detalle de plato
├── js/
│   ├── config.js           ← SUPABASE_URL y SUPABASE_ANON_KEY (placeholders)
│   ├── supabase.js         ← cliente + queries
│   ├── render.js           ← router de block_type → componente
│   ├── blocks/
│   │   ├── small_card.js
│   │   ├── large_card.js
│   │   ├── horizontal_banner.js
│   │   ├── hero_video.js
│   │   ├── recommended_card.js
│   │   ├── featured_pair.js
│   │   └── masonry_image.js
│   ├── modal.js
│   └── nav.js
├── assets/
│   └── logo.webp
└── .env.example
```

---

## Base de datos Supabase

### Tabla existente (NO leer en la carta pública)
```
recetas — tiene costos y márgenes internos. NUNCA exponer.
```

### Tablas nuevas a crear

#### `menu_sections`
```sql
create table menu_sections (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,           -- "Piqueos", "Entradas", etc.
  slug        text not null unique,    -- "piqueos", "entradas", etc.
  sort_order  integer default 0,
  is_active   bool default true
);
```

#### `menu_items`
```sql
create table menu_items (
  id           uuid primary key default gen_random_uuid(),
  section_id   uuid references menu_sections(id) on delete cascade,
  name         text not null,
  description  text,
  price        numeric not null default 0,
  image_url    text,
  video_url    text,
  tags         text[] default '{}',
  alergenos    text[] default '{}',
  calorias     integer,
  disponible_desde time,    -- hora de inicio (America/Santiago)
  disponible_hasta time,    -- hora de fin (America/Santiago)
  is_active    bool default true,
  is_featured  bool default false,
  sort_order   integer default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
```

#### `menu_layout_blocks`
```sql
create table menu_layout_blocks (
  id                uuid primary key default gen_random_uuid(),
  section_id        uuid references menu_sections(id) on delete cascade,
  item_id           uuid references menu_items(id) on delete cascade,
  block_type        text not null default 'small_card',
  sort_order        integer default 0,
  title_override    text,      -- sobreescribe el nombre del plato
  subtitle_override text,      -- texto editorial adicional
  badge_text        text,      -- "Recomendado", "Nuevo", "Hoy sugerimos"
  is_active         bool default true
);

-- Tipos válidos de block_type:
-- small_card | large_card | horizontal_banner | hero_video
-- recommended_card | featured_pair | masonry_image
```

#### RLS — solo lectura pública
```sql
alter table menu_sections      enable row level security;
alter table menu_items         enable row level security;
alter table menu_layout_blocks enable row level security;

create policy "pub_read" on menu_sections      for select using (is_active = true);
create policy "pub_read" on menu_items         for select using (is_active = true);
create policy "pub_read" on menu_layout_blocks for select using (is_active = true);

create index on menu_items(section_id);
create index on menu_layout_blocks(section_id, sort_order);
```

---

## Query principal (js/supabase.js)

```js
async function cargarCarta() {
  // 1. Secciones activas
  const { data: secciones } = await supabase
    .from('menu_sections')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  // 2. Para cada sección: blocks + item anidado
  const { data: blocks } = await supabase
    .from('menu_layout_blocks')
    .select(`
      *,
      item:menu_items (*)
    `)
    .eq('is_active', true)
    .order('sort_order');

  return { secciones, blocks };
}
```

---

## Lógica de render (js/render.js)

```js
const BLOCK_COMPONENTS = {
  small_card:         renderSmallCard,
  large_card:         renderLargeCard,
  horizontal_banner:  renderHorizontalBanner,
  hero_video:         renderHeroVideo,
  recommended_card:   renderRecommendedCard,
  featured_pair:      renderFeaturedPair,
  masonry_image:      renderMasonryImage,
};

function renderBlock(block) {
  const fn = BLOCK_COMPONENTS[block.block_type] ?? renderSmallCard; // fallback
  return fn(block);
}

function renderSeccion(seccion, blocks) {
  const blocksSeccion = blocks
    .filter(b => b.section_id === seccion.id)
    .filter(b => estaDisponible(b.item));

  if (!blocksSeccion.length) return '';

  return `
    <section class="menu-section" id="${seccion.slug}">
      <h2 class="section-title">${seccion.name}</h2>
      <div class="blocks-grid">
        ${blocksSeccion.map(renderBlock).join('')}
      </div>
    </section>
  `;
}
```

---

## Los 7 tipos de bloque

### `small_card`
- Media columna (ocupa 1 de 2 columnas del grid)
- Imagen con overlay + nombre + precio abajo
- Altura fija: ~180px
- Rotación leve: entre -2.5deg y +2deg (asignada por índice)

### `large_card`
- Ancho completo (ocupa las 2 columnas)
- Imagen grande + texto superpuesto abajo
- Altura: ~240px
- Sin rotación

### `horizontal_banner`
- Ancho completo
- Layout horizontal: imagen izquierda (40%) + texto editorial derecha (60%)
- Fondo oscuro con borde dorado sutil
- Altura: ~130px

### `hero_video`
- Ancho completo
- Si `video_url` existe: `<video autoplay muted loop playsinline>`
- Si no: `image_url` con ícono play decorativo
- Texto superpuesto con `title_override` y `subtitle_override`
- Altura: ~280px

### `recommended_card`
- Ancho completo
- Badge prominente (`badge_text`)
- Imagen grande + descripción visible
- Borde dorado animado (pulse suave)
- Altura: ~200px

### `featured_pair`
- Ancho completo
- Requiere 2 items: el primero ocupa el 60% izquierdo, el segundo el 40% derecho
- Claude Code: el bloque `featured_pair` agrupa los próximos 2 blocks con `block_type === 'featured_pair'` en el mismo render

### `masonry_image`
- Media columna
- Altura variable según índice: alterna 160px / 220px / 190px
- Sin texto — solo imagen con viñeta
- Al tocar abre modal

---

## Diseño — tokens (css/tokens.css)

```css
:root {
  /* Colores */
  --ink:        #0C0A06;
  --paper:      #F0E8D8;
  --gold:       #C8962A;
  --gold-dim:   #5A3E0E;
  --card-bg:    #181008;
  --border:     #2A1A06;
  --shadow:     rgba(0,0,0,0.75);

  /* Tipografía */
  --font-title: 'Cormorant Garamond', serif;   /* nombres de platos */
  --font-price: 'Bebas Neue', sans-serif;       /* precios */
  --font-body:  'DM Sans', sans-serif;          /* descripciones, UI */

  /* Layout */
  --max-w:      430px;
  --pad:        14px;
  --gap:        12px;
  --radius-sm:  18px;
  --radius-lg:  24px;

  /* Rotaciones para small_card y masonry_image */
  --rot-1: -2.5deg;
  --rot-2: -1.5deg;
  --rot-3:  1deg;
  --rot-4:  2deg;
  --rot-5: -1deg;
  --rot-6:  2.5deg;
}
```

### Google Fonts a importar
```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300;1,500&family=Bebas+Neue&family=DM+Sans:wght@300;400&display=swap" rel="stylesheet">
```

---

## Layout principal (css/layout.css)

```css
.menu-container {
  max-width: var(--max-w);
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--pad);
}

.blocks-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--gap);
}

/* Ancho completo */
.block--full {
  grid-column: 1 / -1;
}

/* Media columna (default) */
.block--half {
  grid-column: span 1;
}
```

---

## Cards — estilos base (css/blocks.css)

```css
.block-card {
  position: relative;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1),
              box-shadow 0.3s ease;
  box-shadow: 0 8px 24px var(--shadow);
}

/* Rotación para cards de media columna */
.block-card.rotated {
  transform: rotate(var(--rot, 0deg));
}

/* Touch: endereza y eleva */
.block-card:active {
  transform: rotate(0deg) translateY(-5px) scale(1.02) !important;
  box-shadow: 0 20px 50px rgba(0,0,0,0.85),
              0 0 0 1.5px var(--gold-dim);
}

.block-card img,
.block-card video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(12,10,6,0.0) 35%,
    rgba(12,10,6,0.85) 100%
  );
  pointer-events: none;
}

.card-text {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.7rem 0.9rem;
  z-index: 2;
}

.card-name {
  font-family: var(--font-title);
  font-style: italic;
  font-weight: 300;
  font-size: 1.1rem;
  color: var(--paper);
  line-height: 1.2;
}

.card-price {
  font-family: var(--font-price);
  font-size: 1rem;
  color: var(--gold);
  letter-spacing: 0.05em;
}

.card-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 3;
  background: var(--gold);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 0.48rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 0.22rem 0.55rem;
  border-radius: 3px;
}
```

---

## Disponibilidad horaria

```js
function estaDisponible(item) {
  if (!item) return false;
  if (!item.disponible_desde || !item.disponible_hasta) return true;
  const ahora = new Date().toLocaleTimeString('es-CL', {
    timeZone: 'America/Santiago',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  return ahora >= item.disponible_desde && ahora <= item.disponible_hasta;
}
```

---

## Modal de detalle (js/modal.js)

Slide desde abajo. Contenido:
- Imagen o video full-width (si `video_url`: autoplay muted loop)
- Nombre completo, descripción, precio
- Tags como pills dorados
- Alérgenos con texto (si existen)
- Calorías (si existen)
- Indicador de horario (si aplica)
- Botón cerrar

```js
// Abrir modal al tocar cualquier card
document.addEventListener('click', e => {
  const card = e.target.closest('[data-item-id]');
  if (card) abrirModal(card.dataset.itemId);
});
```

---

## Navegación por categoría (js/nav.js)

- Fija arriba, scroll horizontal, sin scroll vertical propio
- Tabs: una por sección activa (nombre desde `menu_sections.name`)
- Al tocar: scroll suave a la sección, fade de cards
- Tab activo resaltado en dorado

---

## Cache offline (js/supabase.js)

```js
const CACHE_KEY = 'carta_lp';
const CACHE_TTL = 30 * 60 * 1000; // 30 min

// Guardar al cargar
localStorage.setItem(CACHE_KEY, JSON.stringify({ secciones, blocks, ts: Date.now() }));

// Usar cache si Supabase falla
function cargarDesdeCache() {
  const raw = localStorage.getItem(CACHE_KEY);
  if (!raw) return null;
  const { secciones, blocks, ts } = JSON.parse(raw);
  if (Date.now() - ts > CACHE_TTL) return null;
  return { secciones, blocks };
}
```

---

## Datos mock (para desarrollar sin tablas)

```js
// js/mock.js — usar cuando Supabase no está disponible
const MOCK_DATA = {
  secciones: [
    { id: 's1', name: 'Piqueos',  slug: 'piqueos',  sort_order: 1, is_active: true },
    { id: 's2', name: 'Entradas', slug: 'entradas', sort_order: 2, is_active: true },
    { id: 's3', name: 'Fondos',   slug: 'fondos',   sort_order: 3, is_active: true },
    { id: 's4', name: 'Cócteles', slug: 'cocteles', sort_order: 4, is_active: true },
  ],
  blocks: [
    // Piqueos
    { id:'b1', section_id:'s1', item_id:'i1', block_type:'hero_video',        sort_order:1, badge_text:null,         is_active:true, item:{ id:'i1', name:'Yuca Rellena',      price:12900, description:'Yuca rellena de mariscos salteados y ají amarillo.', image_url:'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=85', video_url:null, tags:['Firma'], alergenos:[], calorias:null, disponible_desde:null, disponible_hasta:null }},
    { id:'b2', section_id:'s1', item_id:'i2', block_type:'small_card',         sort_order:2, badge_text:null,         is_active:true, item:{ id:'i2', name:'Chicken Fingers',   price:8900,  description:'Tiras de pollo apanadas con panko.', image_url:'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&q=85', video_url:null, tags:[], alergenos:['gluten'], calorias:380, disponible_desde:null, disponible_hasta:null }},
    { id:'b3', section_id:'s1', item_id:'i3', block_type:'small_card',         sort_order:3, badge_text:'Popular',    is_active:true, item:{ id:'i3', name:'Yuca Frita',        price:5900,  description:'Yuca crocante con salsa huancaína.', image_url:'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=85', video_url:null, tags:[], alergenos:[], calorias:290, disponible_desde:null, disponible_hasta:null }},
    { id:'b4', section_id:'s1', item_id:'i4', block_type:'horizontal_banner',  sort_order:4, badge_text:null,         is_active:true, subtitle_override:'Rellenas con pulpa de cangrejo', item:{ id:'i4', name:'Empanadas del Mar', price:9900, description:'Fritas, rellenas de mariscos y ají amarillo.', image_url:'https://images.unsplash.com/photo-1624397640148-949b1732bb0a?w=400&q=85', video_url:null, tags:[], alergenos:['gluten','mariscos'], calorias:null, disponible_desde:null, disponible_hasta:null }},
    // Entradas
    { id:'b5', section_id:'s2', item_id:'i5', block_type:'recommended_card',   sort_order:1, badge_text:'Signature',  is_active:true, item:{ id:'i5', name:'Ceviche Clásico',  price:15900, description:'Pescado fresco en leche de tigre, choclo, cancha y ají limo.', image_url:'https://images.unsplash.com/photo-1535400255456-984e0a4bad35?w=600&q=85', video_url:null, tags:['Fresco','Pescado'], alergenos:['pescado'], calorias:210, disponible_desde:null, disponible_hasta:null }},
    { id:'b6', section_id:'s2', item_id:'i6', block_type:'masonry_image',       sort_order:2, badge_text:null,         is_active:true, item:{ id:'i6', name:'Ceviche Apaltado', price:16900, description:'Palta, mango, langostinos y leche de tigre.', image_url:'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=85', video_url:null, tags:['Nuevo'], alergenos:['mariscos'], calorias:null, disponible_desde:null, disponible_hasta:null }},
    { id:'b7', section_id:'s2', item_id:'i7', block_type:'masonry_image',       sort_order:3, badge_text:null,         is_active:true, item:{ id:'i7', name:'Causa de Pollo',   price:12900, description:'Papa amarilla con ají amarillo y pollo.', image_url:'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=400&q=85', video_url:null, tags:[], alergenos:[], calorias:320, disponible_desde:null, disponible_hasta:null }},
    // Fondos
    { id:'b8', section_id:'s3', item_id:'i8', block_type:'large_card',          sort_order:1, badge_text:'Top 1',      is_active:true, item:{ id:'i8', name:'Lomo Saltado',     price:19900, description:'Lomo fino al wok con cebolla, tomate y ají amarillo. Arroz y papas fritas.', image_url:'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=600&q=85', video_url:null, tags:['Clásico'], alergenos:['soya'], calorias:650, disponible_desde:null, disponible_hasta:null }},
    // Cócteles
    { id:'b9', section_id:'s4', item_id:'i9', block_type:'hero_video',          sort_order:1, badge_text:'Ícono',      is_active:true, subtitle_override:'El clásico peruano de autor', item:{ id:'i9', name:'Pisco Sour',        price:8500,  description:'Pisco quebranta, limón de pica, jarabe de goma y clara.', image_url:'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&q=85', video_url:null, tags:['Pisco'], alergenos:['huevo'], calorias:null, disponible_desde:'18:00:00', disponible_hasta:'23:59:00' }},
    { id:'b10',section_id:'s4', item_id:'i10',block_type:'small_card',          sort_order:2, badge_text:'Nuevo',      is_active:true, item:{ id:'i10',name:'Maracuyá Sour',    price:8900,  description:'Pisco con maracuyá fresco y espuma de clara.', image_url:'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=85', video_url:null, tags:[], alergenos:['huevo'], calorias:null, disponible_desde:'18:00:00', disponible_hasta:'23:59:00' }},
  ]
};
```

---

## Estados de UI

| Estado | Comportamiento |
|---|---|
| Cargando | Skeleton cards con animación pulse en el mismo grid |
| Sin blocks en sección | No renderizar la sección |
| Error Supabase | Toast abajo: *"Sin conexión — carta en modo offline"* + cache |
| Item sin imagen | Placeholder oscuro con nombre del plato centrado en dorado |
| Fuera de horario | El bloque no se renderiza (filtrado en cliente) |

---

## Cómo agregar un nuevo tipo de bloque (documentación)

1. Agregar el nuevo `block_type` como string válido en la BD (ej: `'split_card'`)
2. Crear `js/blocks/split_card.js` con la función `renderSplitCard(block)`
3. Importar la función en `js/render.js`
4. Agregar la entrada en `BLOCK_COMPONENTS`:
   ```js
   split_card: renderSplitCard,
   ```
5. Agregar estilos en `css/blocks.css` bajo `.block-split-card`
6. Listo — sin tocar otras partes del código

---

## Variables de entorno (Cloudflare Pages)

```
SUPABASE_URL      = https://xxxx.supabase.co
SUPABASE_ANON_KEY = eyJ...  (solo anon key, nunca service_role)
```

En `js/config.js` (placeholders que Cloudflare reemplaza):
```js
const SUPABASE_URL      = '%%SUPABASE_URL%%';
const SUPABASE_ANON_KEY = '%%SUPABASE_ANON_KEY%%';
```

---

## Lo que Claude Code NO debe hacer

- ❌ No crear panel de administración
- ❌ No implementar auth ni login
- ❌ No leer la tabla `recetas`
- ❌ No usar React, Vue, Tailwind, npm
- ❌ No commitear credenciales reales
- ❌ No usar anchos fijos en px para las cards
- ❌ No crear sistema de pedidos ni carrito

---

## Orden de implementación

1. `css/tokens.css`
2. `js/config.js` + `js/supabase.js` con mock data
3. `css/layout.css` + grid base
4. `js/blocks/small_card.js` + `css/blocks.css` base
5. Resto de blocks: `large_card`, `horizontal_banner`, `hero_video`, `recommended_card`, `masonry_image`
6. `js/render.js` — router de block_type
7. `js/nav.js` — navegación por sección
8. `js/modal.js` + `css/modal.css`
9. Skeletons, cache, estados de error
10. `index.html` — ensambla todo
11. `featured_pair` — último por ser el más complejo

