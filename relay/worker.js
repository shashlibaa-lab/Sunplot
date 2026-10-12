/* Sunplot relay: a tiny Cloudflare Worker that passes map requests through for
   county servers that refuse requests coming straight from an app.
   It only forwards map and data service addresses (so it can't be used as an open proxy),
   adds the headers browsers need, and caches answers for a day to keep county servers happy.
   Deploy: see README.md, "Turning on the relay". Free tier: 100,000 requests a day. */

const ALLOW_HOSTS = [
  'sdmdataaccess.sc.egov.usda.gov', // USDA soil survey
  'data.rcc-acis.org',              // NOAA frost records
  'api.weather.gov',                // National Weather Service
  'tigerweb.geo.census.gov'         // county lookup
];
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
  'Access-Control-Max-Age': '86400'
};
const reply = (body, status) => new Response(body, { status, headers: { ...CORS, 'Content-Type': 'text/plain' } });

export default {
  async fetch(req, env, ctx) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (req.method !== 'GET' && req.method !== 'POST') return reply('Method not allowed', 405);

    const target = new URL(req.url).searchParams.get('url');
    if (!target) return reply('Add ?url= with the map service address', 400);
    let u;
    try { u = new URL(target); } catch { return reply('That address is not valid', 400); }
    const isMapService = /\/rest\/services\//i.test(u.pathname) || /\/sharing\/rest\//i.test(u.pathname);
    if (u.protocol !== 'https:' || !(isMapService || ALLOW_HOSTS.includes(u.hostname))) return reply('Only map and data services are relayed', 403);

    const cache = caches.default;
    const cacheKey = new Request(u.toString(), { method: 'GET' });
    if (req.method === 'GET') {
      const hit = await cache.match(cacheKey);
      if (hit) return hit;
    }

    const init = { method: req.method, headers: { Accept: req.headers.get('Accept') || 'application/json', 'User-Agent': 'SunplotRelay/1.0' } };
    if (req.method === 'POST') {
      init.body = await req.arrayBuffer();
      init.headers['Content-Type'] = req.headers.get('Content-Type') || 'application/x-www-form-urlencoded';
    }
    let upstream;
    try { upstream = await fetch(u.toString(), init); }
    catch { return reply('The map server did not answer', 502); }

    const out = new Response(upstream.body, upstream);
    for (const [k, v] of Object.entries(CORS)) out.headers.set(k, v);
    if (req.method === 'GET' && upstream.ok) {
      out.headers.set('Cache-Control', 'public, max-age=86400');
      ctx.waitUntil(cache.put(cacheKey, out.clone()));
    }
    return out;
  }
};
