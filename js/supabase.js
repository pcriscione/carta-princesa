// Cache offline
const CACHE_KEY = 'carta_lp';
const CACHE_TTL = 30 * 60 * 1000; // 30 min

function guardarCache(secciones, blocks) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ secciones, blocks, ts: Date.now() }));
  } catch (_) {}
}

function cargarDesdeCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { secciones, blocks, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return { secciones, blocks };
  } catch (_) {
    return null;
  }
}

// Disponibilidad horaria (zona America/Santiago)
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

// Cliente Supabase (solo se inicializa si no estamos en modo mock)
let _supabase = null;
function getSupabase() {
  if (_supabase) return _supabase;
  _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return _supabase;
}

async function cargarCartaRemota() {
  const sb = getSupabase();

  const [{ data: secciones, error: errS }, { data: blocks, error: errB }] = await Promise.all([
    sb.from('menu_sections')
      .select('*')
      .eq('is_active', true)
      .order('sort_order'),
    sb.from('menu_layout_blocks')
      .select('*, item:menu_items(*)')
      .eq('is_active', true)
      .order('sort_order'),
  ]);

  if (errS || errB) throw new Error(errS?.message || errB?.message);
  return { secciones, blocks };
}

async function cargarCarta() {
  // Modo mock: devuelve datos locales sin tocar Supabase
  if (USE_MOCK) {
    return MOCK_DATA;
  }

  try {
    const resultado = await cargarCartaRemota();
    guardarCache(resultado.secciones, resultado.blocks);
    return resultado;
  } catch (err) {
    console.warn('Supabase no disponible, usando cache:', err.message);
    const cache = cargarDesdeCache();
    if (cache) return { ...cache, _desdeCache: true };
    throw err; // sin cache y sin conexión → propagar para mostrar toast
  }
}
