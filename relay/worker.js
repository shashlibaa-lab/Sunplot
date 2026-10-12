/* Sunplot relay: a tiny Cloudflare Worker that passes map requests through for
   county servers that refuse requests coming straight from an app.
   It only forwards map and data service addresses (so it can't be used as an open proxy),
   adds the headers browsers need, and caches answers for a day to keep county servers happy.
   It also checks Google Play purchases of Sunplot Pro (POST /verify, below).
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

/* ---------- Google Play purchase check ----------
   POST /verify {sku, token}: asks Google whether the purchase is real and paid, and acknowledges it
   (Google refunds purchases that aren't acknowledged within 3 days).
   Needs two secrets set with `npx wrangler secret put`:
     GOOGLE_SA     the JSON key of a Google Cloud service account that has access to the app in Play Console
     PACKAGE_NAME  the Android package name PWABuilder gave the app (for example com.reevesco.sunplot)
   and PRO_SKU (plain variable in wrangler.toml), the product ID made in Play Console. */
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
const b64url = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
let tokenCache = { value: null, until: 0 };
async function googleToken(env) {
  if (tokenCache.value && Date.now() < tokenCache.until) return tokenCache.value;
  const sa = JSON.parse(env.GOOGLE_SA), now = Math.floor(Date.now() / 1000);
  const enc = o => b64url(new TextEncoder().encode(JSON.stringify(o)));
  const unsigned = `${enc({ alg: 'RS256', typ: 'JWT' })}.${enc({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/androidpublisher', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })}`;
  const der = Uint8Array.from(atob(sa.private_key.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '')), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${b64url(sig)}` }) });
  const j = await r.json();
  if (!j.access_token) throw new Error('Google sign-in failed');
  tokenCache = { value: j.access_token, until: Date.now() + 50 * 60 * 1000 };
  return j.access_token;
}
async function verifyPurchase(req, env) {
  if (!env.GOOGLE_SA || !env.PACKAGE_NAME || !env.PRO_SKU) return json({ ok: false, reason: 'Purchase checking is not set up' }, 503);
  let body; try { body = await req.json(); } catch { return json({ ok: false, reason: 'Bad request' }, 400); }
  const { sku, token } = body || {};
  if (sku !== env.PRO_SKU || typeof token !== 'string' || token.length < 10 || token.length > 4096) return json({ ok: false, reason: 'Unknown product' }, 400);
  try {
    const auth = { Authorization: `Bearer ${await googleToken(env)}` };
    const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(env.PACKAGE_NAME)}/purchases/products/${encodeURIComponent(sku)}/tokens/${encodeURIComponent(token)}`;
    const r = await fetch(url, { headers: auth });
    if (!r.ok) return json({ ok: false, reason: `Google answered ${r.status}` }, 402);
    const p = await r.json();
    if (p.purchaseState !== 0) return json({ ok: false, reason: p.purchaseState === 2 ? 'Payment pending' : 'Not purchased' }, 402);
    if (p.acknowledgementState === 0) {
      const a = await fetch(`${url}:acknowledge`, { method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' }, body: '{}' });
      if (!a.ok) return json({ ok: false, reason: 'Could not confirm the purchase with Google' }, 502);
    }
    return json({ ok: true });
  } catch (e) { return json({ ok: false, reason: String(e && e.message || e) }, 502); }
}

export default {
  async fetch(req, env, ctx) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (new URL(req.url).pathname === '/verify' && req.method === 'POST') return verifyPurchase(req, env);
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
