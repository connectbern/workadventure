// Connect Bern — WorkAdventure world generator
// Generates 10 themed .tmj maps from a shared, verified tile palette.
// Tilesets are copied verbatim from office.tmj so gids are guaranteed valid.
//
//   node tools/generate-maps.mjs
//
// Each map is an orthogonal 32px Tiled map with these tile layers (all below the
// player, so the avatar is always visible) plus one objectgroup of WA "area"s:
//   ground  -> grass / water / stone / interior floor
//   deco    -> hedges, bushes, bridges, paths, platform trim
//   night   -> optional dark overlay (shown/hidden by script for day/night)
//   collisions -> WA collision tile (gid 3) where the player must not walk
//   areas   -> start points, portals (exitUrl), info popups, websites, jitsi, game zones

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// ---- verified tile palette (gids) -----------------------------------------
const T = {
  empty: 0,
  collide: 3,            // WA_Special_Zones collision tile
  grass: 2461, grassA: 2462, grassB: 2460,
  water: [2575, 2576, 2577, 2600, 2602, 2603], // solid bright water (ripple variety)
  stone: [2571, 2573, 2574],                    // grey paving / platforms
  hedge: [2065, 2066, 2090, 2091],              // dark-green foliage (tree/hedge fill)
  shrub: [2059, 2084],                          // lighter shrub
  wood: 725,             // warm wood interior floor
  white: 496,            // clean white/tile floor
  blue: 735,             // cool blue-grey floor (also reused as night tint)
};

// deterministic pseudo-random so output is stable between runs
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
const pick = (arr, r) => arr[Math.floor(r() * arr.length)];

// ---- map model -------------------------------------------------------------
function makeMap(w, h) {
  const blank = () => new Array(w * h).fill(0);
  return {
    w, h,
    ground: blank(), deco: blank(), night: blank(), col: blank(),
    areas: [], _oid: 1, _r: rng(w * 131 + h * 17 + 7),
  };
}
const I = (m, x, y) => y * m.w + x;
const inb = (m, x, y) => x >= 0 && y >= 0 && x < m.w && y < m.h;

function fill(layer, m, x, y, w, h, val) {
  for (let j = y; j < y + h; j++)
    for (let i = x; i < x + w; i++)
      if (inb(m, i, j)) layer[I(m, i, j)] = typeof val === "function" ? val() : val;
}
const rect = (m, layer, x, y, w, h, v) => fill(layer, m, x, y, w, h, v);

// rectangular outline (1 tile thick)
function outline(m, layer, x, y, w, h, v) {
  for (let i = x; i < x + w; i++) { set(m, layer, i, y, v); set(m, layer, i, y + h - 1, v); }
  for (let j = y; j < y + h; j++) { set(m, layer, x, j, v); set(m, layer, x + w - 1, j, v); }
}
function set(m, layer, x, y, v) { if (inb(m, x, y)) layer[I(m, x, y)] = typeof v === "function" ? v() : v; }

// scatter values into a region with probability p
function scatter(m, layer, x, y, w, h, arr, p) {
  for (let j = y; j < y + h; j++)
    for (let i = x; i < x + w; i++)
      if (inb(m, i, j) && m._r() < p) layer[I(m, i, j)] = pick(arr, m._r);
}

// solid border wall of collisions around the whole map
function frameCollide(m) {
  for (let i = 0; i < m.w; i++) { m.col[I(m, i, 0)] = T.collide; m.col[I(m, i, m.h - 1)] = T.collide; }
  for (let j = 0; j < m.h; j++) { m.col[I(m, 0, j)] = T.collide; m.col[I(m, m.w - 1, j)] = T.collide; }
}
// mark a rect as solid in the collision layer
const solid = (m, x, y, w, h) => fill(m.col, m, x, y, w, h, T.collide);

// helpers that paint ground & keep collisions in sync
const water = (m, x, y, w, h) => { fill(m.ground, m, x, y, w, h, () => pick(T.water, m._r)); solid(m, x, y, w, h); };
const stone = (m, x, y, w, h) => fill(m.ground, m, x, y, w, h, () => pick(T.stone, m._r));
const floor = (m, x, y, w, h, tile) => fill(m.ground, m, x, y, w, h, tile);
const hedge = (m, x, y, w, h) => { fill(m.deco, m, x, y, w, h, () => pick(T.hedge, m._r)); solid(m, x, y, w, h); };
// a walkable bridge of stone painted over water
const bridge = (m, x, y, w, h) => { fill(m.deco, m, x, y, w, h, () => pick(T.stone, m._r)); fill(m.col, m, x, y, w, h, 0); };

// ---- WA areas --------------------------------------------------------------
const px = (n) => n * 32;
function area(m, name, tx, ty, tw, th, props) {
  const o = {
    height: px(th), id: m._oid++, name,
    x: px(tx), y: px(ty), width: px(tw),
    rotation: 0, type: "area", visible: true,
  };
  if (props && props.length) o.properties = props;
  m.areas.push(o);
  return o;
}
const P = {
  start: () => ({ name: "start", type: "bool", value: true }),
  exit: (url) => ({ name: "exitUrl", type: "string", value: url }),
  str: (n, v) => ({ name: n, type: "string", value: v }),
  bool: (n, v) => ({ name: n, type: "bool", value: v }),
  flt: (n, v) => ({ name: n, type: "float", value: v }),
};
// website popup (opens an embedded website on action)
function website(m, name, tx, ty, tw, th, url, message, width = 50) {
  area(m, name, tx, ty, tw, th, [
    P.str("openWebsite", url),
    P.str("openWebsiteTrigger", "onaction"),
    P.str("openWebsiteTriggerMessage", message || "Press SPACE to open"),
    P.flt("openWebsiteWidth", width),
    P.bool("openWebsiteAllowApi", true),
  ]);
}
// jitsi meeting area
function jitsi(m, name, tx, ty, tw, th, room, message) {
  area(m, name, tx, ty, tw, th, [
    P.bool("focusable", true),
    P.str("jitsiRoom", room),
    P.str("jitsiTrigger", "onaction"),
    P.str("jitsiTriggerMessage", message || "Press SPACE to join the meeting"),
    P.flt("zoom_margin", 0.4),
  ]);
}
// exit portal + an action message label
function portal(m, name, tx, ty, tw, th, url) {
  area(m, name, tx, ty, tw, th, [P.exit(url)]);
}
// a plain rectangle object a popup can anchor to
function anchor(m, name, tx, ty) {
  m.areas.push({ height: 32, id: m._oid++, name, x: px(tx), y: px(ty), width: 32, rotation: 0, type: "", visible: true });
}
// a named zone the map script can subscribe to (onEnter/onLeave).
// also drops a "<name>Popup" anchor so scripts can open a popup on it.
function zone(m, name, tx, ty, tw, th, extra = []) {
  const a = area(m, name, tx, ty, tw, th, extra);
  anchor(m, name + "Popup", tx + tw / 2, ty);
  return a;
}

// ---- serialisation ---------------------------------------------------------
const TILESETS = (() => {
  const office = JSON.parse(readFileSync(resolve(ROOT, "office.tmj"), "utf8"));
  return office.tilesets; // verbatim, valid gids
})();

function tileLayer(name, data, w, h, id, visible = true, opacity = 1) {
  return { data, height: h, id, name, opacity, type: "tilelayer", visible, width: w, x: 0, y: 0 };
}

function serialize(m, meta) {
  let id = 1;
  const layers = [];
  layers.push(tileLayer("ground", m.ground, m.w, m.h, id++));
  layers.push(tileLayer("deco", m.deco, m.w, m.h, id++));
  if (m.night.some((v) => v)) layers.push(tileLayer("night", m.night, m.w, m.h, id++, false, 0.5));
  layers.push(tileLayer("collisions", m.col, m.w, m.h, id++));
  layers.push({
    draworder: "topdown", id: id++, name: "floorLayer", opacity: 1,
    objects: m.areas, type: "objectgroup", visible: true, x: 0, y: 0,
  });
  const props = [
    P.str("mapName", meta.name),
    P.str("mapDescription", meta.description),
    P.str("mapImage", meta.image || (meta.file.replace(/\.tmj$/, "") + ".png")),
    P.str("mapCopyright", "Connect Bern — tiles © WorkAdventure, CC-BY-SA 3.0"),
  ];
  if (meta.script) props.push(P.str("script", meta.script));
  return {
    compressionlevel: -1, height: m.h, infinite: false, layers,
    nextlayerid: id, nextobjectid: m._oid, orientation: "orthogonal",
    properties: props, renderorder: "right-down", tiledversion: "1.11.2",
    tileheight: 32, tilesets: TILESETS, tilewidth: 32, type: "map",
    version: "1.10", width: m.w,
  };
}

function emit(m, meta) {
  const json = serialize(m, meta);
  writeFileSync(resolve(ROOT, meta.file), JSON.stringify(json, null, 1));
  console.log(`  wrote ${meta.file}  (${m.w}x${m.h}, ${m.areas.length} areas)`);
}

// common: grass base + map border + a default + from-hub spawn + return portal
function base(w, h) {
  const m = makeMap(w, h);
  fill(m.ground, m, 0, 0, w, h, () => (m._r() < 0.08 ? pick([T.grassA, T.grassB], m._r) : T.grass));
  frameCollide(m);
  return m;
}
function spawns(m, hubReturnAt) {
  area(m, "start", 2, 2, 2, 2, [P.start()]);
  area(m, "from-hub", 2, 4, 2, 2, [P.start()]);
  if (hubReturnAt) portal(m, "to-hub", hubReturnAt[0], hubReturnAt[1], 2, 2, "connectbern.tmj#from-" + hubReturnAt[2]);
}

// === maps ===================================================================
const MAPS = [];
const W = 44, H = 36;

// 1) CONNECT BERN — main hub: improved digital version of the hand-drawn map
function connectbern() {
  const m = base(W, H);
  // Aare river loops along the bottom & right (like the drawing)
  water(m, 0, H - 4, W, 4);
  water(m, W - 4, 6, 4, H - 6);
  // central plaza — "heart of the map / starting point"
  stone(m, W / 2 - 4, H / 2 - 3, 8, 6);
  // landmark platforms: [x,y,label,world,desc]
  const L = [
    [6, 3, "📚 Library", "library", "The Library — quiet corner where Paola answers your questions."],
    [W - 14, 3, "🌹 Rose Garden", "rosengarten", "Rosengarten — relax with a panoramic view over the old town."],
    [4, 13, "🚉 Train Station", "station", "Bahnhof — the Welcome Hub. New here? Start at the info desk."],
    [W - 16, 14, "🕰️ Zytglogge", "zytglogge", "The Zytglogge clock tower — solve the time puzzle inside."],
    [W - 10, 22, "🏛️ Parliament", "parliament", "Bundeshaus — our meeting space. Step in to start a call."],
    [5, 24, "🏠 Staying in Bern", "staying-in-bern", "Staying in Bern — volunteer info by day, social space by night."],
    [16, 4, "🐻 Bear Pit", "baerengraben", "Bärengraben — say hi to the bears and test your Bern trivia."],
    [W / 2 - 2, 6, "🏰 Old Town", "oldtown", "Old Town & Münster — a treasure hunt through historic Bern."],
    [20, 24, "🌊 Aare Float", "aare-float", "Eichholz → Marzili: jump in and float down the Aare!"],
  ];
  for (const [x, y, label, world, desc] of L) {
    stone(m, x, y, 6, 4);
    scatter(m, m.deco, x - 1, y - 1, 8, 6, T.shrub, 0.12);
    // info sign (popup) on the platform
    zone(m, "sign-" + world, x + 1, y + 1, 4, 2);
    m.areas[m.areas.length - 1].properties = [P.str("signText", desc)];
    // portal on the platform edge
    portal(m, "to-" + world, x + 2, y + 3, 2, 1, world + ".tmj#from-hub");
  }
  // a bridge across the river to the float launch
  bridge(m, 21, H - 4, 2, 4);
  // welcome zone on spawn plaza
  zone(m, "welcome", W / 2 - 2, H / 2 - 1, 4, 2);
  // hedges framing the park feel
  hedge(m, 0, 6, 1, H - 10);
  scatter(m, m.deco, 24, 16, 14, 10, T.hedge, 0.05);
  area(m, "start", W / 2 - 1, H / 2, 2, 2, [P.start()]);
  area(m, "from-library", 7, 8, 2, 1, [P.start()]);
  area(m, "from-rosengarten", W - 12, 8, 2, 1, [P.start()]);
  area(m, "from-station", 7, 18, 2, 1, [P.start()]);
  area(m, "from-zytglogge", W - 14, 19, 2, 1, [P.start()]);
  area(m, "from-parliament", W - 8, 27, 2, 1, [P.start()]);
  area(m, "from-staying-in-bern", 7, 29, 2, 1, [P.start()]);
  area(m, "from-baerengraben", 18, 9, 2, 1, [P.start()]);
  area(m, "from-oldtown", W / 2, 11, 2, 1, [P.start()]);
  area(m, "from-aare-float", 22, H - 6, 2, 1, [P.start()]);
  MAPS.push([m, { file: "connectbern.tmj", name: "Connect Bern — Hub", description: "The heart of the Connect Bern world. Walk to any Bern landmark to explore.", script: "src/connectbern.ts" }]);
}

// 2) AARE FLOAT — float from Eichholz to Marzili, collect items, get a time
function aareFloat() {
  const m = base(40, 40);
  // the whole middle is the river (walkable water = floating!)
  water(m, 8, 0, 16, H + 4 > 40 ? 40 : 40);
  fill(m.col, m, 8, 0, 16, 40, 0); // make the river walkable (you float)
  // grassy/forest banks
  hedge(m, 0, 0, 8, 40);
  hedge(m, 24, 0, 16, 40);
  scatter(m, m.deco, 0, 0, 8, 40, T.hedge, 0.5);
  // Eichholz launch (top) and Marzili exit (bottom) stone decks
  stone(m, 9, 1, 14, 2);
  stone(m, 9, 37, 14, 2);
  // start at Eichholz deck
  area(m, "start", 14, 1, 2, 1, [P.start()]);
  area(m, "from-hub", 14, 1, 2, 1, [P.start()]);
  zone(m, "eichholz", 9, 2, 14, 1);     // begins the timer
  zone(m, "marzili", 9, 37, 14, 1);     // ends the timer
  // floating collectibles (rubber ducks!) — named zones the script tracks
  const ducks = [[11, 7], [19, 11], [13, 16], [20, 20], [12, 25], [18, 30]];
  ducks.forEach(([x, y], i) => zone(m, "duck" + i, x, y, 1, 1));
  // current "speed lanes" — info popups
  portal(m, "to-hub", 25, 38, 2, 1, "connectbern.tmj#from-aare-float");
  MAPS.push([m, { file: "aare-float.tmj", name: "Aare Float Challenge", description: "Jump in at Eichholz, float to Marzili, grab the ducks and beat the clock!", script: "src/aare-float.ts" }]);
}

// 3) STAYING IN BERN — volunteer house, room popups + day/night
function staying() {
  const m = makeMap(38, 30);
  // interior wood floor whole house
  fill(m.ground, m, 0, 0, 38, 30, T.wood);
  frameCollide(m);
  // room dividers (hedge used as wall) — three rooms
  hedge(m, 12, 0, 1, 20); hedge(m, 25, 0, 1, 20);
  hedge(m, 0, 20, 38, 1);
  // doorways
  fill(m.col, m, 12, 9, 1, 2, 0); fill(m.deco, m, 12, 9, 1, 2, T.wood);
  fill(m.col, m, 25, 9, 1, 2, 0); fill(m.deco, m, 25, 9, 1, 2, T.wood);
  fill(m.col, m, 6, 20, 2, 1, 0); fill(m.deco, m, 6, 20, 2, 1, T.wood);
  // tiled kitchen + bathroom floors for contrast
  floor(m, 1, 1, 11, 18, T.white);     // kitchen (white tile)
  floor(m, 26, 1, 11, 18, T.blue);     // bathroom (blue tile)
  // night overlay (dark) — hidden by default, toggled by script
  fill(m.night, m, 0, 0, 38, 30, T.blue);
  // spawns
  area(m, "start", 16, 25, 2, 2, [P.start()]);
  area(m, "from-hub", 16, 25, 2, 2, [P.start()]);
  // room info popups (the "read & confirm" guidelines)
  zone(m, "kitchen", 3, 3, 7, 6, [P.str("room", "kitchen")]);
  zone(m, "bathroom", 28, 3, 7, 6, [P.str("room", "bathroom")]);
  zone(m, "living", 14, 3, 9, 14, [P.str("room", "living")]);
  // social space (bottom) with a jitsi to meet people
  jitsi(m, "social", 14, 23, 8, 4, "StayingInBernSocial", "Press SPACE to hang out with people");
  // day/night switch
  zone(m, "lightswitch", 1, 28, 2, 1, [P.str("toggle", "daynight")]);
  portal(m, "to-hub", 35, 28, 2, 1, "connectbern.tmj#from-staying-in-bern");
  MAPS.push([m, { file: "staying-in-bern.tmj", name: "Staying in Bern", description: "Volunteer guidelines by day, a cosy social space by night. Flip the light switch!", script: "src/staying-in-bern.ts" }]);
}

// 4) PARLIAMENT — meeting halls (jitsi) + a vote mini-game
function parliament() {
  const m = makeMap(40, 30);
  fill(m.ground, m, 0, 0, 40, 30, () => pick(T.stone, m._r)); // grand stone hall
  frameCollide(m);
  // a red-carpet aisle (wood) up the middle
  floor(m, 18, 4, 4, 24, T.wood);
  // three debate chambers
  jitsi(m, "chamber-national", 3, 4, 10, 8, "BundeshausNational", "Press SPACE — National Council chamber");
  jitsi(m, "chamber-states", 27, 4, 10, 8, "BundeshausStates", "Press SPACE — Council of States chamber");
  jitsi(m, "chamber-plenary", 12, 18, 16, 9, "BundeshausPlenary", "Press SPACE — Plenary hall (big meetings)");
  outline(m, m.deco, 2, 3, 12, 10, () => pick(T.hedge, m._r)); solid(m, 2, 3, 12, 1); solid(m, 2, 3, 1, 10); solid(m, 13, 3, 1, 10); solid(m, 2, 12, 12, 1);
  outline(m, m.deco, 26, 3, 12, 10, () => pick(T.hedge, m._r)); solid(m, 26, 3, 12, 1); solid(m, 26, 3, 1, 10); solid(m, 37, 3, 1, 10); solid(m, 26, 12, 12, 1);
  // open the chamber doorways
  fill(m.col, m, 7, 12, 2, 1, 0); fill(m.col, m, 31, 12, 2, 1, 0);
  // voting podium
  stone(m, 19, 13, 2, 2);
  zone(m, "podium", 19, 13, 2, 2, [P.str("game", "vote")]);
  area(m, "start", 19, 26, 2, 2, [P.start()]);
  area(m, "from-hub", 19, 26, 2, 2, [P.start()]);
  portal(m, "to-hub", 1, 1, 2, 2, "connectbern.tmj#from-parliament");
  MAPS.push([m, { file: "parliament.tmj", name: "Parliament — Meeting Halls", description: "Step into a chamber to start a video meeting, or call a vote at the podium.", script: "src/parliament.ts" }]);
}

// 5) BÄRENGRABEN — bear pit + Bern trivia quiz
function baerengraben() {
  const m = base(36, 30);
  // the round-ish stone bear pit
  stone(m, 10, 8, 16, 14);
  outline(m, m.deco, 9, 7, 18, 16, () => pick(T.hedge, m._r));
  solid(m, 9, 7, 18, 1); solid(m, 9, 22, 18, 1); solid(m, 9, 7, 1, 16); solid(m, 26, 7, 1, 16);
  // a little water pool for the bears
  water(m, 16, 14, 4, 3);
  // entrance gap (bottom)
  fill(m.col, m, 17, 22, 2, 1, 0); fill(m.deco, m, 17, 22, 2, 1, () => pick(T.stone, m._r));
  scatter(m, m.deco, 0, 0, 36, 7, T.hedge, 0.08);
  // quiz trigger zones — 4 trivia stations around the rim
  zone(m, "quiz0", 12, 9, 2, 2, [P.str("q", "0")]);
  zone(m, "quiz1", 22, 9, 2, 2, [P.str("q", "1")]);
  zone(m, "quiz2", 12, 19, 2, 2, [P.str("q", "2")]);
  zone(m, "quiz3", 22, 19, 2, 2, [P.str("q", "3")]);
  area(m, "start", 17, 26, 2, 2, [P.start()]);
  area(m, "from-hub", 17, 26, 2, 2, [P.start()]);
  portal(m, "to-hub", 1, 1, 2, 2, "connectbern.tmj#from-baerengraben");
  MAPS.push([m, { file: "baerengraben.tmj", name: "Bärengraben Trivia", description: "Visit the bear pit and answer four questions about Bern. Can you get them all?", script: "src/baerengraben.ts" }]);
}

// 6) ZYTGLOGGE — clock tower time puzzle
function zytglogge() {
  const m = makeMap(30, 34);
  fill(m.ground, m, 0, 0, 30, 34, () => pick(T.stone, m._r));
  frameCollide(m);
  // tower outline of hedges, narrowing upward (a tower silhouette)
  outline(m, m.deco, 8, 2, 14, 30, () => pick(T.hedge, m._r));
  solid(m, 8, 2, 14, 1); solid(m, 8, 31, 14, 1); solid(m, 8, 2, 1, 30); solid(m, 21, 2, 1, 30);
  // clock face (water ring) near the top
  water(m, 12, 5, 6, 5);
  bridge(m, 14, 7, 2, 1);
  // the clock area (reuses the starter-kit clock popup)
  zone(m, "clock", 13, 6, 4, 3);
  // three "hour" puzzle plates the player must step in the right order
  zone(m, "hour1", 11, 14, 2, 2, [P.str("step", "1")]);
  zone(m, "hour2", 18, 18, 2, 2, [P.str("step", "2")]);
  zone(m, "hour3", 11, 24, 2, 2, [P.str("step", "3")]);
  // reward chest area revealed when solved
  zone(m, "vault", 14, 27, 2, 2, [P.str("vault", "true")]);
  area(m, "start", 14, 30, 2, 2, [P.start()]);
  area(m, "from-hub", 14, 30, 2, 2, [P.start()]);
  fill(m.col, m, 14, 31, 2, 1, 0);
  portal(m, "to-hub", 14, 32, 2, 1, "connectbern.tmj#from-zytglogge");
  MAPS.push([m, { file: "zytglogge.tmj", name: "Zytglogge Time Puzzle", description: "Read the clock, then step the hour-plates in the right order to open the vault.", script: "src/zytglogge.ts" }]);
}

// 7) LIBRARY — embedded resources + ask Paola
function library() {
  const m = makeMap(36, 28);
  fill(m.ground, m, 0, 0, 36, 28, T.wood);
  frameCollide(m);
  // bookshelf rows (hedges = shelves)
  for (let r = 0; r < 4; r++) { hedge(m, 4, 4 + r * 5, 12, 1); hedge(m, 20, 4 + r * 5, 12, 1); }
  // reading rugs
  floor(m, 16, 3, 4, 20, T.white);
  // resource desks (embedded websites)
  website(m, "desk-stayinginbern", 5, 5, 3, 1, "https://stayinginbern.ch", "Press SPACE — Staying in Bern website", 60);
  website(m, "desk-bern", 21, 5, 3, 1, "https://www.bern.com/en", "Press SPACE — Visit Bern (tourism)", 60);
  website(m, "desk-events", 5, 15, 3, 1, "https://www.meetup.com/", "Press SPACE — Connect Bern events", 60);
  website(m, "desk-german", 21, 15, 3, 1, "https://www.dwds.de/", "Press SPACE — Learn German (DWDS)", 60);
  // ask Paola (a helper NPC desk -> popup)
  stone(m, 16, 23, 4, 2);
  zone(m, "paola", 16, 23, 4, 2, [P.str("npc", "paola")]);
  area(m, "start", 17, 25, 2, 2, [P.start()]);
  area(m, "from-hub", 17, 25, 2, 2, [P.start()]);
  portal(m, "to-hub", 1, 1, 2, 2, "connectbern.tmj#from-library");
  MAPS.push([m, { file: "library.tmj", name: "Library — Ask Paola", description: "Browse the shelves to open useful websites, or ask Paola at the desk.", script: "src/library.ts" }]);
}

// 8) ROSENGARTEN — social chill garden with photo viewpoints
function rosengarten() {
  const m = base(40, 30);
  // ornamental hedges in a garden pattern
  for (let gx = 4; gx < 36; gx += 8)
    for (let gy = 4; gy < 26; gy += 8) { hedge(m, gx, gy, 4, 1); hedge(m, gx, gy, 1, 4); }
  // central rose pond
  water(m, 17, 12, 6, 5);
  bridge(m, 19, 12, 2, 5);
  // paved viewpoint terrace overlooking the city (top)
  stone(m, 10, 1, 20, 3);
  // photo viewpoints (popups)
  zone(m, "view-aare", 11, 1, 3, 2, [P.str("view", "Aare bend & old town roofs 🌉")]);
  zone(m, "view-alps", 18, 1, 3, 2, [P.str("view", "the snowy Alps on a clear day 🏔️")]);
  zone(m, "view-muenster", 25, 1, 3, 2, [P.str("view", "the Münster spire 🗼")]);
  // social bench area (jitsi)
  stone(m, 16, 23, 8, 4);
  jitsi(m, "garden-chat", 16, 23, 8, 4, "RosengartenChat", "Press SPACE to chat in the garden");
  area(m, "start", 19, 20, 2, 2, [P.start()]);
  area(m, "from-hub", 19, 20, 2, 2, [P.start()]);
  portal(m, "to-hub", 1, 1, 2, 2, "connectbern.tmj#from-rosengarten");
  MAPS.push([m, { file: "rosengarten.tmj", name: "Rose Garden", description: "A calm garden with city viewpoints and a social corner to meet people.", script: "src/rosengarten.ts" }]);
}

// 9) OLD TOWN — Münster + scavenger hunt
function oldtown() {
  const m = base(42, 32);
  // a grid of old-town "buildings" (stone blocks with hedge roofs) and arcaded lanes
  const blocks = [];
  for (let bx = 3; bx < 38; bx += 9)
    for (let by = 3; by < 26; by += 8) { stone(m, bx, by, 6, 5); hedge(m, bx, by, 6, 1); blocks.push([bx, by]); }
  // the Münster (big block, centre)
  stone(m, 18, 12, 7, 8); hedge(m, 18, 12, 7, 2);
  // 5 hidden clue tiles for the scavenger hunt
  const clues = [[5, 6], [30, 6], [6, 23], [33, 23], [21, 17]];
  clues.forEach(([x, y], i) => zone(m, "clue" + i, x, y, 1, 1, [P.str("clue", String(i))]));
  // info popup at the Münster
  zone(m, "muenster", 19, 18, 5, 2, [P.str("info", "The Berner Münster — Switzerland's tallest cathedral (100m). Climb 312 steps for the view!")]);
  area(m, "start", 20, 29, 2, 2, [P.start()]);
  area(m, "from-hub", 20, 29, 2, 2, [P.start()]);
  portal(m, "to-hub", 1, 1, 2, 2, "connectbern.tmj#from-oldtown");
  MAPS.push([m, { file: "oldtown.tmj", name: "Old Town Treasure Hunt", description: "Wander historic Bern, find 5 hidden clues and discover the secret of the Münster.", script: "src/oldtown.ts" }]);
}

// 10) STATION — welcome hub, onboarding guide + "Let's Talk" support desk
function station() {
  const m = makeMap(40, 28);
  fill(m.ground, m, 0, 0, 40, 28, () => pick(T.stone, m._r)); // station concourse
  frameCollide(m);
  // platforms (wood) with "tracks" (water) — atmosphere
  floor(m, 2, 22, 36, 1, T.wood);
  water(m, 2, 23, 36, 2);
  // info desk in the centre (the guide, issue #5)
  stone(m, 17, 4, 6, 3);
  zone(m, "infodesk", 17, 4, 6, 3, [P.str("guide", "true")]);
  // "Let's Talk" support area (issue #2) — staffed help corner
  stone(m, 3, 4, 8, 5);
  jitsi(m, "lets-talk", 3, 4, 8, 5, "LetsTalkSupport", "Press SPACE — talk to someone from Connect Bern 💬");
  zone(m, "lets-talk-sign", 3, 9, 8, 1, [P.str("info", "Need help or just want to talk? Wait here — someone will join you. No camera needed.")]);
  // departures board -> portals to a few worlds (a mini hub)
  website(m, "departures", 29, 4, 8, 1, "https://stayinginbern.ch", "Press SPACE — Connect Bern info board", 55);
  // onboarding popups along the entrance
  zone(m, "welcome", 18, 24, 4, 2, [P.str("welcome", "true")]);
  area(m, "start", 19, 25, 2, 2, [P.start()]);
  area(m, "from-hub", 19, 25, 2, 2, [P.start()]);
  portal(m, "to-hub", 1, 1, 2, 2, "connectbern.tmj#from-station");
  MAPS.push([m, { file: "station.tmj", name: "Central Station — Welcome", description: "Your arrival hub: read the guide, or wait at the Let's Talk desk to meet someone.", script: "src/station.ts" }]);
}

// build all
mkdirSync(resolve(ROOT, "tools"), { recursive: true });
connectbern(); aareFloat(); staying(); parliament(); baerengraben();
zytglogge(); library(); rosengarten(); oldtown(); station();
console.log("Generating Connect Bern worlds:");
for (const [m, meta] of MAPS) emit(m, meta);
console.log(`Done. ${MAPS.length} maps.`);
