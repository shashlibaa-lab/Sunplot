# Sunplot — launch steps

Sunplot is a web app. Everything it needs is in this folder:

- `index.html` – the whole app
- `manifest.webmanifest`, `sw.js`, `icons/` – make it installable on a phone and let it open without signal

## 1. Put it online (free)

Pick one:

- **Netlify:** on a computer, open app.netlify.com/drop, sign up, and drag this whole folder onto the page. You get a web address right away.
- **GitHub Pages:** put the folder in a GitHub repository and turn on Pages in the repository settings.

It has to be served over `https://` for install and offline mode to work. Opening the file straight off your computer won't load the maps.

## 2. Try it on your phone

Open the web address. On iPhone: Share → Add to Home Screen. On Android: menu → Install app.

## 3. Before you charge money

1. **Address search.** It uses Esri's World Geocoder, with OpenStreetMap as a backup. It works without a key for testing. Before selling, make a free ArcGIS Location Platform account (developers.arcgis.com), create an API key with geocoding, and paste it into `CONFIG.esriKey` in `index.html`. The free tier covers 20,000 searches a month.
2. **Support email.** Put it in `CONFIG.contact`. It prints on every plan.
3. **Data credits.** Keep the map attribution (bottom-right of the map) visible. It credits USGS, NC OneMap and the state parcel sources.

## Privacy and Google Play paperwork

- **Privacy policy:** `privacy.html` (live at `…/Sunplot/privacy.html`). Fill in the publisher name and support email before submitting, and put the same email in `CONFIG.contact`.
- **Data safety answers:** `play-store/data-safety.md`.
- **Owner opt-out:** when an owner asks to hide their details, add the parcel number or site address to `CONFIG.ownerOptOut` in `index.html` and publish. Their name and mailing address stop showing; the rest of the public record stays.
- The app asks before using location, and every saved place can be deleted from its Overview tab.
- **Terms of use:** `terms.html`. Fill in the publisher name and support email here too.

## Your places

On the first screen, press and hold a place (or tap **Select**) to pick one or more. Then **Star** (starred places stay at the top), **Rename**, **Copy** (same beds, trees and crops under a new name), **Map** (outlines all the picked places together; tap one to open it), **Back up** (a backup file of just those) or **Delete** (with Undo). Tap a place normally to open it.

## Backup and problem reports

- **Backup:** the first screen has **Save a backup file** (downloads `sunplot-backup-DATE.json` with every saved place) and **Restore a backup** (adds the places back; places already on the phone are replaced after asking).
- **Report a problem:** on the first screen and the Overview tab. It opens the user's email app addressed to `CONFIG.contact`, with the problem type, their note, the app version, phone, place, parcel source and the last few loading errors filled in. Set `CONFIG.contact` so reports reach you.

## 4. App stores

1. Go to pwabuilder.com and enter your web address. It checks the app and builds the store packages.
2. **Google Play:** one-time developer fee. Upload the Android package PWABuilder makes and set the price.
3. **Apple App Store:** yearly developer fee, and you need a Mac with Xcode to build the iPhone package. Apple sometimes rejects apps that look like a plain website, so lead the listing with the sun-hours and garden-finder features.
4. Each store takes 15% for small developers once you enroll in its small-business program.

## 5. Property lines across the US

The app finds property lines in this order:

1. **Statewide parcel maps** in 20 states and DC: North Carolina, Virginia, Wisconsin, Indiana, Delaware, New York, Florida, Washington, Texas (point lookup only), Arkansas, West Virginia, Montana, Maryland (through the relay), New Jersey, Connecticut, Vermont, New Hampshire, Hawaii, Colorado, Utah (county by county) and DC.
2. **County map finder** everywhere else. The app looks up the county (US Census), searches ArcGIS Online, the public catalog most counties publish their parcel maps to, tries the best matches, and remembers the one that works for that county on that phone.
3. **Tap the corners** where a county doesn't publish its parcels at all.

Before launch, open **Check map sources** (bottom of the first screen) on a phone and on a computer. **Test all 50 states** looks up a city neighborhood and a rural county seat in every state, plus DC, the way the app does for a user, and **Copy results** puts the list on the clipboard. It tests every service from that device. Then zoom into a few properties in states without a statewide map and tap **Test the spot on the map**.

Coverage limits:
- Some counties only publish through paid viewers (Beacon, qPublic and similar). No free app can read those, so users there tap their corners.
- Statewide layers in some states are missing a few counties (Washington, West Virginia, Arkansas, New York and Vermont say so in their own notes). The county finder covers many of those gaps.
- Parcel fields differ by county. The app reads addresses, IDs, acres and values by pattern. Owner names show where the county publishes them.

### Adding another state

Add one line to `STATE_SOURCES` in `index.html`: the state, the parcel layer address (`…/MapServer/0` or `…/FeatureServer/0`), and the site-address field if it has one. A whole service (`kind: 'service'`) works too; the app finds its parcel layer.

### Turning on the relay

A few county servers refuse requests that come straight from an app (they show as "Blocked" in Check map sources). The relay passes those through.

1. Make a free Cloudflare account.
2. Install Node.js, then run `npx wrangler deploy` inside the `relay` folder. It prints an address like `https://sunplot-relay.yourname.workers.dev`.
3. Paste that address into `CONFIG.relay` in `index.html` and upload the app again.

The relay only forwards map and data services, and caches answers for a day. The free plan covers 100,000 requests a day.

## When things fail

Offline, slow and broken servers each get their own plain message: an offline notice at the top of the map, "couldn't reach the server" or "the map service is having issues" with a **Retry** button on search, parcel lookup, report cards and public-record sections, and a notice with **Retry** when a map layer keeps failing. When a county simply has no public parcel map, the app says so and offers **Tap my corners**.

## Layers while browsing

The layers button (stacked squares, top right) works with no property open: base maps, past photos (once zoomed in), and every overlay. Tap the map to see what's at a spot. Those settings are kept on the phone and stay on while browsing; an open property uses its own.

## Property dashboard

Once a property is open, four tabs sit under its name:

- **Overview:** tiles for land size, sun, growing season, soil, flood, terrain, tax value and garden status. Tap a tile for details.
- **Layers:** base maps (aerial, USDA farm photo, USGS topo, shaded relief, and past aerial photos: Esri's World Imagery archive from 2014 on everywhere, Kentucky's statewide photos back to 2004, North Carolina's back to 1993) and overlays for flood zones, wetlands, streams, soil types, land cover, plant health, contours, slope, slope direction, property lines, sun hours and shadows. Tap the map to see what's at any spot: sun, elevation, slope, soil, flood zone, wetland and land cover.
- **Sun:** date and time controls and "Where should my garden go?"
- **Garden:** add beds, trees and buildings, and edit the selected one.

## Public records drop-downs

Tap a parcel (or open the Overview tab) to see **Public records**, in sections that open when tapped:

- **County parcel record:** every field the county publishes for that parcel, labeled and formatted, including owner and mailing address where the county publishes them. Set `CONFIG.showOwners` to `false` to hide owner and mailing fields.
- **Location and districts:** state, county, city or unincorporated, township, ZIP, school district, U.S. House, state senate and house districts, census tract and block group (US Census).
- **Soil and land cover:** every soil type on the parcel with acres, drainage, pH and farmland class, plus land cover.
- **Water, flood and wetlands:** FEMA zones and floodplain share, wetlands and named streams on the parcel.
- **Terrain and climate:** elevation range, slope, which way it faces, hardiness zone and frost dates.
- **Maps and links:** Google Maps, FEMA's official flood map, Web Soil Survey, the wetlands mapper, old USGS topo maps, and any record links the county provides.

## Planning beds

Tap a bed on the map, then **Plan rows and crops**. Each bed is split into rows (30 in planted, 18 in paths by default; change it under Bed setup, or turn the rows across the bed). Tap a row to add a crop: the app suggests dates from the property's frost dates, finds open space in the row, splits successions into equal plantings, and counts plants and seeds. **Planting calendar and seed list** on the map screen shows every task week by week and the seeds to buy. The crop list and its typical spacing and timing live in `CROP_LIB` in `index.html`.

## Data sources

- Property lines: the 23 statewide services listed in `STATE_SOURCES`, plus county parcel maps found through ArcGIS Online search; county lookup from US Census TIGERweb
- Aerial photos: NC OneMap (North Carolina), USGS National Map (everywhere)
- Elevation: USGS 3DEP (everywhere in the US)
- Property report: USDA NRCS Soil Data Access (soils), FEMA National Flood Hazard Layer (flood zones), NOAA ACIS / PRISM daily lows 1991–2020 (frost dates and hardiness zone), National Weather Service (7-night forecast). All free and nationwide.
