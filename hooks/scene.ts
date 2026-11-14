// The backdrop: a Miami seafront drawn as one animated SVG, behind the conversation.
//
// A pastel sky with soft cloud banks and the sun, condo towers across the bay fading
// into the haze, the sea with a shimmering path under the sun, a Streamline Deco hotel
// with a neon fin on the right, a sand spit on the left, birds gliding, and palm trees
// swaying at both edges. The middle stays calm: that's where the words sit.
// The colors are CSS variables, each `light-dark(light, dark)`: they follow the app's mode
// with no media query, since the desktop app draws still a scene that holds one (but the
// reduced-motion query, which it keeps).
// No script, nothing loaded: CSS animations only, stopped under reduced motion.
// Every style sits in the <style> sheet, none in a style attribute: a surface may draw the
// scene under a policy that drops style attributes.

import type { Palette, SceneColors } from './palettes'

const W = 1600
const H = 1000
const HORIZON = 640

const kebab = (key: string): string => '--' + key.replace(/[A-Z]/g, c => '-' + c.toLowerCase())

/** A six-digit color with an opacity from 0 to 1, as eight-digit hex. */
const withAlpha = (color: string, opacity: string): string =>
  color +
  Math.round(Number(opacity) * 255)
    .toString(16)
    .padStart(2, '0')

/**
 * Every scene color as `light-dark()`. The two opacities that differ by mode can't be one
 * (light-dark picks colors only), so they ride in the alpha of their colors instead:
 * `--window-lit`, `--window-dim` and `--neon-lit`.
 */
function vars(light: SceneColors, dark: SceneColors): string {
  const pick = (l: string, d: string): string => `light-dark(${l},${d})`
  const entries = (Object.keys(dark) as (keyof SceneColors)[])
    .filter(key => key !== 'windowOpacity' && key !== 'neonOpacity')
    .map(key => `${kebab(key)}:${pick(light[key], dark[key])}`)
  const dim = (opacity: string): string => String(Number(opacity) * 0.6)
  entries.push(
    `--window-lit:${pick(withAlpha(light.window, light.windowOpacity), withAlpha(dark.window, dark.windowOpacity))}`,
    `--window-dim:${pick(withAlpha(light.window, dim(light.windowOpacity)), withAlpha(dark.window, dim(dark.windowOpacity)))}`,
    `--neon-lit:${pick(withAlpha(light.neon, light.neonOpacity), withAlpha(dark.neon, dark.neonOpacity))}`,
  )
  return `color-scheme:light dark;${entries.join(';')}`
}

// A small deterministic random, so the scene is the same on every load.
function random(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const f = (n: number): string => Math.round(n).toString()
const p = (x: number, y: number): string => `${f(x)} ${f(y)}`

// ---------------------------------------------------------------- palm trees

/**
 * One frond from the crown (0,0) outward at `angle` (degrees, 0 right, -90 up): an arching
 * midrib sagging toward its tip, with long leaflets hanging from both sides. The leaflets
 * are broad at the base and overlap, so the frond reads as one feathered silhouette.
 */
function frond(angle: number, length: number, droop: number): string {
  const a = (angle * Math.PI) / 180
  const dx = Math.cos(a)
  const dy = Math.sin(a)
  const lift = length * 0.22 * Math.abs(dx)
  const at = (t: number): [number, number] => [dx * length * t, dy * length * t - lift * 4 * t * (1 - t) + droop * t * t]

  // The midrib, a tapered band.
  const top: string[] = []
  const bottom: string[] = []
  for (let i = 0; i <= 8; i++) {
    const t = i / 8
    const [x, y] = at(t)
    const w = 4.5 * (1 - t * 0.85)
    top.push(p(x, y - w))
    bottom.unshift(p(x, y + w))
  }
  let d = `M${top.join(' ')} ${bottom.join(' ')}Z`

  const count = 15
  for (let i = 0; i < count; i++) {
    const t = 0.1 + (i / (count - 1)) * 0.88
    const [x, y] = at(t)
    const [nx, ny] = at(Math.min(1, t + 0.04))
    const tl = Math.hypot(nx - x, ny - y) || 1
    const tx = (nx - x) / tl
    const ty = (ny - y) / tl
    const len = length * 0.34 * Math.sin(Math.PI * (0.12 + t * 0.82)) * (1 - t * 0.3)
    const base = 9 * (1 - t * 0.55)
    for (const side of [-1, 1]) {
      // Hang toward the ground, pulled along the midrib, the two sides splayed apart.
      let vx = tx * 0.45 + side * 0.42 * -ty
      let vy = ty * 0.45 + 1 + side * 0.42 * tx
      const vl = Math.hypot(vx, vy)
      vx /= vl
      vy /= vl
      const reach = len * (side < 0 ? 1 : 0.82)
      const ex = x + vx * reach
      const ey = y + vy * reach
      // A blade curved a little toward the frond's tip.
      const cx = x + vx * reach * 0.55 + tx * reach * 0.12
      const cy = y + vy * reach * 0.55 + ty * reach * 0.12
      d += `M${p(x - tx * base, y - ty * base)}Q${p(cx - tx * base * 0.5, cy - ty * base * 0.5)} ${p(ex, ey)}Q${p(cx + tx * base * 0.3, cy + ty * base * 0.3)} ${p(x + tx * base, y + ty * base)}Z`
    }
  }
  return d
}

/** A crown of fronds around (0,0), kept in <defs> and drawn by <use> on every palm. */
function crown(id: string, seed: number): string {
  const rnd = random(seed)
  let d = ''
  for (const a of [-198, -176, -152, -128, -104, -82, -58, -34, -10, 14, 160]) {
    const angle = a + (rnd() - 0.5) * 10
    const side = Math.abs(Math.cos((angle * Math.PI) / 180))
    const length = 170 + side * 110 + rnd() * 40
    const droop = 20 + side * 190 + rnd() * 40
    d += frond(angle, length, droop)
  }
  // The dead fronds hanging under the crown, and its heart.
  d += `M-14 4Q-30 40-24 70Q-12 40 0 8ZM14 4Q30 40 26 66Q12 40 0 8Z`
  return `<path id="${id}" d="${d}"/>`
}

/** A palm tree: a slim curved trunk from (x, base) to its crown, the crown swaying. */
function palm(x: number, base: number, height: number, lean: number, scale: number, crownId: string, flip: boolean, delay: number): string {
  const cx = x + lean
  const cy = base - height
  const w = 13 * scale
  const bow = lean * 0.7
  const trunk =
    `M${p(x - w, base)}Q${p(x - w * 0.7 + bow, base - height * 0.55)} ${p(cx - w * 0.4, cy)}` +
    `L${p(cx + w * 0.4, cy)}Q${p(x + w * 0.7 + bow, base - height * 0.55)} ${p(x + w, base)}Z`
  let rings = ''
  for (let i = 1; i < 16; i++) {
    const t = i / 16
    const px = x + (cx - x) * t + bow * 2 * t * (1 - t) * 0.92
    const half = w * (1 - t * 0.6)
    rings += `M${p(px - half, base - height * t)}q${f(half)} ${f(3 * scale)} ${f(half * 2)} 0`
  }
  // The crown sways about its own point: moved there first, it turns about its origin, so no
  // transform-origin is needed. Its delay is a class, `d0` to `d5` (seconds ahead).
  return (
    `<g class="palm"><path d="${trunk}"/><path class="rings" d="${rings}"/>` +
    `<g transform="translate(${f(cx)} ${f(cy)})"><g class="crown d${-delay}">` +
    `<use href="#${crownId}" transform="scale(${flip ? -scale : scale} ${scale})"/></g></g></g>`
  )
}

// ---------------------------------------------------------------- the far shore

/**
 * Condo towers across the bay: pastel slabs with a lit and a shaded side, balcony bands,
 * some with rounded or stepped tops. Two rows, the far one paler, both sinking into haze.
 */
function towers(from: number, to: number, seed: number, far: boolean): string {
  const rnd = random(seed)
  const fills = ['ta', 'tb', 'tc']
  let out = ''
  let x = from
  while (x < to) {
    const w = far ? 30 + rnd() * 40 : 44 + rnd() * 56
    const centre = x + w / 2
    const middle = Math.abs(centre - W / 2) < 280
    const h = far ? 50 + rnd() * (middle ? 50 : 150) : middle ? 20 + rnd() * 40 : 90 + rnd() * 200
    const top = HORIZON - h
    const cls = fills[Math.floor(rnd() * 3)]
    const shape = rnd()
    let body = `M${p(x, HORIZON + 4)}V${f(top)}`
    if (shape > 0.72) {
      // A rounded top, as Miami condos often have.
      body += `Q${p(x, top - w * 0.35)} ${p(centre, top - w * 0.35)}Q${p(x + w, top - w * 0.35)} ${p(x + w, top)}`
    } else if (shape > 0.45) {
      // A stepped Deco crown.
      const s = w * 0.2
      body += `H${f(x + s)}V${f(top - 10)}H${f(x + w - s)}V${f(top)}`
    }
    body += `H${f(x + w)}V${f(HORIZON + 4)}Z`
    out += `<path class="${cls}" d="${body}"/>`
    out += `<rect class="shade" x="${f(x + w * 0.62)}" y="${f(top)}" width="${f(w * 0.38)}" height="${f(h + 4)}"/>`
    out += `<rect class="edge" x="${f(x)}" y="${f(top)}" width="2" height="${f(h + 4)}"/>`
    if (!far) out += `<rect class="balc" x="${f(x + 3)}" y="${f(top + 10)}" width="${f(w - 6)}" height="${f(h - 10)}"/>`
    x += w + (far ? 2 + rnd() * 14 : 6 + rnd() * (middle ? 60 : 22))
  }
  return `<g class="${far ? 'far-row' : 'near-row'}">${out}</g>`
}

// ---------------------------------------------------------------- the hotel

/**
 * A Streamline Deco hotel on the right shore: a rounded corner, eyebrow ledges over each
 * floor, windows in pairs (some lit), a stepped central fin and a neon line up the fin.
 */
function hotel(seed: number): string {
  const rnd = random(seed)
  const x0 = 1180
  const x1 = 1780
  const top = 370
  const finX = 1350
  const finW = 70
  let ledges = ''
  let shadows = ''
  let windows = ''
  for (let y = top + 30, row = 0; y < H; y += 54, row++) {
    ledges += `M${x0} ${y}H${x1}v5H${x0}Z`
    shadows += `M${x0 + 26} ${y + 5}H${x1}v9H${x0 + 26}Z`
    for (let x = x0 + 44; x < x1 - 20; x += 46) {
      if (x + 34 > finX - 6 && x < finX + finW + 6) continue
      const lit = rnd() > 0.45 ? 'lit' : 'dim'
      windows += `<rect class="${lit}" x="${x}" y="${y + 18}" width="15" height="22" rx="2"/>`
      windows += `<rect class="${rnd() > 0.5 ? 'lit' : 'dim'}" x="${x + 18}" y="${y + 18}" width="15" height="22" rx="2"/>`
    }
  }
  const crown = `M${finX - 16} ${top}V${top - 70}H${finX - 4}V${top - 120}H${finX + 10}V${top - 160}H${finX + finW - 10}V${top - 120}H${finX + finW + 4}V${top - 70}H${finX + finW + 16}V${top}Z`
  const neon = `M${finX + finW / 2} ${top - 150}V${H}`
  const crownNeon = `M${finX - 16} ${top}V${top - 70}H${finX - 4}V${top - 120}H${finX + 10}V${top - 160}H${finX + finW - 10}V${top - 120}H${finX + finW + 4}V${top - 70}H${finX + finW + 16}V${top}`
  return (
    `<g class="hotel">` +
    `<rect class="body" x="${x0}" y="${top}" width="${x1 - x0}" height="${H - top}"/>` +
    `<rect x="${x0}" y="${top}" width="${x1 - x0}" height="${H - top}" fill="url(#facade)"/>` +
    // The rounded corner: a half cylinder, lit on its face, shaded at its edge.
    `<rect x="${x0}" y="${top}" width="36" height="${H - top}" fill="url(#corner)"/>` +
    `<path class="trim" d="${ledges}"/><path class="shadow" d="${shadows}"/>` +
    windows +
    `<path class="body" d="${crown}"/><path d="${crown}" fill="url(#facade)"/>` +
    `<rect class="trim" x="${finX}" y="${top - 160}" width="${finW}" height="${H - top + 160}"/>` +
    `<rect class="trim" x="${finX + finW / 2 - 2}" y="${top - 220}" width="4" height="62"/>` +
    `<path class="neon halo" d="${crownNeon}"/><path class="neon line" d="${crownNeon}"/>` +
    `<path class="neon halo" d="${neon}"/><path class="neon line" d="${neon}"/>` +
    `</g>`
  )
}

// ---------------------------------------------------------------- sky and sea

/** Soft cloud banks: wide ellipses filled with a gradient that fades at its edges. */
function clouds(seed: number): string {
  const rnd = random(seed)
  const layer = (count: number, cls: string): string => {
    let out = ''
    for (let i = 0; i < count; i++) {
      const x = rnd() * W
      const y = 60 + rnd() * 320
      const rx = 160 + rnd() * 220
      out += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(14 + rnd() * 18)}"/>`
      out += `<ellipse cx="${f(x + rx * (rnd() - 0.5) * 0.6)}" cy="${f(y - 12)}" rx="${f(rx * 0.45)}" ry="${f(14 + rnd() * 14)}"/>`
    }
    return `<g class="clouds ${cls}" fill="url(#cloud)">${out}</g>`
  }
  return layer(5, 'far') + layer(4, 'near')
}

/** A few birds gliding across, each flapping slowly. */
function birds(): string {
  const bird = (x: number, y: number, s: number, n: number): string =>
    `<g transform="translate(${x} ${y}) scale(${s})"><path class="wing w${n}" d="M-14 0Q-7-7 0 0Q7-7 14 0"/></g>`
  return `<g class="birds">${bird(420, 190, 1, 0)}${bird(456, 210, 0.8, 1)}${bird(392, 222, 0.7, 2)}${bird(560, 160, 0.6, 3)}</g>`
}

/** The sun's path on the water: short dashes that flicker, widening toward the shore. */
function shimmer(sunX: number, seed: number): string {
  const rnd = random(seed)
  let dashes = ''
  for (let y = HORIZON + 6; y < H; y += 9 + (y - HORIZON) * 0.05) {
    const t = (y - HORIZON) / (H - HORIZON)
    const spread = 30 + t * 220
    const n = 2 + Math.floor(t * 4)
    for (let i = 0; i < n; i++) {
      const x = sunX + (rnd() - 0.5) * 2 * spread
      const w = 14 + rnd() * (30 + t * 70)
      dashes += `<rect x="${f(x - w / 2)}" y="${f(y)}" width="${f(w)}" height="${(1.5 + t * 3).toFixed(1)}" class="k${Math.floor(rnd() * 8)}"/>`
    }
  }
  let swells = ''
  for (let i = 0; i < 9; i++) {
    const y = HORIZON + 20 + i * 38 + rnd() * 14
    swells += `<rect x="${f(-200 + rnd() * 400)}" y="${f(y)}" width="${f(500 + rnd() * 700)}" height="1.6"/>`
  }
  return `<g class="swells">${swells}</g><g class="shimmer">${dashes}</g>`
}

function sun(palette: Palette): string {
  const { x, y, r, striped } = palette.sun
  let mask = ''
  if (striped) {
    // Gaps that widen toward the horizon, across the lower half of the disc.
    let bars = ''
    let gy = y - r * 0.5
    let gap = 2
    while (gy < y + r) {
      bars += `<rect x="${x - r}" y="${f(gy)}" width="${r * 2}" height="${gap.toFixed(1)}"/>`
      gy += gap + 12
      gap += 2.2
    }
    mask = `<mask id="stripes" maskUnits="userSpaceOnUse" x="${x - r}" y="${y - r}" width="${r * 2}" height="${r * 2}"><rect x="${x - r}" y="${y - r}" width="${r * 2}" height="${r * 2}" fill="#fff"/><g fill="#000">${bars}</g></mask>`
  }
  return (
    `${mask}<ellipse class="glow" cx="${x}" cy="${y}" rx="${r * 4.2}" ry="${r * 2.6}" fill="url(#glow)"/>` +
    `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#sun)"${striped ? ' mask="url(#stripes)"' : ''}/>`
  )
}

const STYLE =
  `.s0{stop-color:var(--sky-top)}.s1{stop-color:var(--sky-mid)}.s2{stop-color:var(--sky-low)}` +
  `.u0{stop-color:var(--sun-top)}.u1{stop-color:var(--sun-bottom)}` +
  `.g0{stop-color:var(--glow);stop-opacity:.6}.g1{stop-color:var(--glow);stop-opacity:0}` +
  `.w0{stop-color:var(--sea-top)}.w1{stop-color:var(--sea-bottom)}` +
  `.c0{stop-color:var(--cloud);stop-opacity:.5}.c1{stop-color:var(--cloud);stop-opacity:0}` +
  `.h0{stop-color:var(--sky-low);stop-opacity:0}.h1{stop-color:var(--sky-low);stop-opacity:.75}` +
  `.r0{stop-color:var(--sky-low);stop-opacity:.5}.r1{stop-color:var(--sky-low);stop-opacity:0}` +
  `.ta{fill:var(--tower-a)}.tb{fill:var(--tower-b)}.tc{fill:var(--tower-c)}` +
  `.shade{fill:#000;opacity:.14}.edge{fill:#fff;opacity:.16}` +
  `.balc{fill:url(#balc)}.bl{fill:#fff;opacity:.22}.bw{fill:var(--window-dim)}` +
  `.far-row{opacity:.55}` +
  `.hotel .body{fill:var(--hotel)}.hotel .trim{fill:var(--hotel-trim)}.hotel .shadow{fill:#000;opacity:.12}` +
  `.lit{fill:var(--window-lit)}.dim{fill:#000;opacity:.22}` +
  `.f0{stop-color:#fff;stop-opacity:.14}.f1{stop-color:#000;stop-opacity:.22}` +
  `.k0{stop-color:#000;stop-opacity:.25}.k1{stop-color:#fff;stop-opacity:.22}.k2{stop-color:#000;stop-opacity:0}` +
  `.neon{fill:none;stroke:var(--neon-lit);stroke-linejoin:round}` +
  `.neon.line{stroke-width:2.5}.neon.halo{stroke-width:16;stroke-opacity:.18;animation:hum 6s linear infinite}` +
  `.shore{fill:var(--shore)}` +
  `.far{opacity:.7;animation:drift 100s ease-in-out infinite alternate}` +
  `.near{animation:drift 70s ease-in-out infinite alternate-reverse}` +
  `.birds{fill:none;stroke:var(--palm);stroke-width:2.4;stroke-linecap:round;animation:glide 70s ease-in-out infinite alternate}` +
  `.wing{animation:flap 2.4s ease-in-out infinite}` +
  `.glow{animation:breathe 7s ease-in-out infinite alternate}` +
  `.shimmer rect{fill:var(--shimmer);animation:flicker 4s ease-in-out infinite}` +
  `.swells rect{fill:var(--shimmer);opacity:.12;animation:swell 18s ease-in-out infinite alternate}` +
  `.palm{fill:var(--palm)}.palm .rings{fill:none;stroke:#000;stroke-opacity:.18;stroke-width:1.5}` +
  `.back .palm{fill:var(--palm-far)}` +
  `.crown{animation:sway 9s ease-in-out infinite alternate}` +
  // Delays as classes: palm crowns d0 to d5, wings w0 to w3, shimmer dashes k0 to k7.
  `.d0{animation-delay:0s}.d2{animation-delay:-2s}.d3{animation-delay:-3s}.d4{animation-delay:-4s}.d5{animation-delay:-5s}` +
  `.w1{animation-delay:-.6s}.w2{animation-delay:-1.1s}.w3{animation-delay:-.3s}` +
  `.shimmer .k1{animation-delay:-.5s}.shimmer .k2{animation-delay:-1s}.shimmer .k3{animation-delay:-1.5s}` +
  `.shimmer .k4{animation-delay:-2s}.shimmer .k5{animation-delay:-2.5s}.shimmer .k6{animation-delay:-3s}.shimmer .k7{animation-delay:-3.5s}` +
  `@keyframes sway{from{transform:rotate(-1.4deg)}to{transform:rotate(1.8deg)}}` +
  `@keyframes drift{from{transform:translateX(-50px)}to{transform:translateX(70px)}}` +
  `@keyframes glide{from{transform:translate(-80px,10px)}to{transform:translate(260px,-30px)}}` +
  `@keyframes flap{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.35)}}` +
  `@keyframes breathe{from{opacity:.75}to{opacity:1}}` +
  `@keyframes flicker{0%,100%{opacity:.15}50%{opacity:.85}}` +
  `@keyframes swell{from{transform:translateX(-30px)}to{transform:translateX(40px)}}` +
  `@keyframes hum{0%,100%{stroke-opacity:.18}46%{stroke-opacity:.26}48%{stroke-opacity:.06}50%{stroke-opacity:.26}}` +
  // No media query on the box's size or shape (aspect-ratio, orientation): the desktop app
  // stops every animation of a scene that holds one.
  `@media (prefers-reduced-motion:reduce){*{animation:none!important}}`

const DEFS =
  `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="s0"/><stop offset=".55" class="s1"/><stop offset="1" class="s2"/></linearGradient>` +
  `<linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="u0"/><stop offset="1" class="u1"/></linearGradient>` +
  `<radialGradient id="glow"><stop offset="0" class="g0"/><stop offset="1" class="g1"/></radialGradient>` +
  `<radialGradient id="cloud"><stop offset=".2" class="c0"/><stop offset="1" class="c1"/></radialGradient>` +
  `<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="w0"/><stop offset="1" class="w1"/></linearGradient>` +
  `<linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="h0"/><stop offset="1" class="h1"/></linearGradient>` +
  `<linearGradient id="reflect" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="r0"/><stop offset="1" class="r1"/></linearGradient>` +
  `<linearGradient id="facade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="f0"/><stop offset="1" class="f1"/></linearGradient>` +
  `<linearGradient id="corner"><stop offset="0" class="k0"/><stop offset=".45" class="k1"/><stop offset="1" class="k2"/></linearGradient>` +
  `<pattern id="balc" width="12" height="9" patternUnits="userSpaceOnUse"><rect class="bl" width="12" height="1.6"/><rect class="bw" x="2" y="3" width="7" height="4"/></pattern>` +
  `<clipPath id="above"><rect x="-600" y="-200" width="${W + 1200}" height="${HORIZON + 200}"/></clipPath>` +
  crown('crownA', 41) +
  crown('crownB', 77)

/** The whole scene for one palette, both modes, as one SVG document. */
export function sceneSvg(palette: Palette): string {
  const sunClip = palette.sun.y + palette.sun.r > HORIZON
  const style =
    `svg{${vars(palette.light.scene, palette.dark.scene)}}` +
    STYLE

  const body =
    `<rect x="-600" y="-200" width="${W + 1200}" height="${H + 400}" fill="url(#sky)"/>` +
    `<g class="sunpos"><g${sunClip ? ' clip-path="url(#above)"' : ''}>${sun(palette)}</g></g>` +
    clouds(11) +
    birds() +
    towers(-180, 1300, 29, true) +
    towers(-160, 1240, 23, false) +
    `<rect x="-600" y="420" width="${W + 1200}" height="${HORIZON - 416}" fill="url(#haze)"/>` +
    `<rect x="-600" y="${HORIZON}" width="${W + 1200}" height="${H - HORIZON + 200}" fill="url(#sea)"/>` +
    `<rect x="-600" y="${HORIZON}" width="${W + 1200}" height="170" fill="url(#reflect)"/>` +
    `<g class="sunpos">${shimmer(palette.sun.x, 5)}</g>` +
    `<g class="right">${hotel(53)}<rect class="shore" x="1120" y="940" width="800" height="200"/></g>` +
    `<g class="left"><ellipse class="shore" cx="140" cy="1010" rx="480" ry="64"/></g>` +
    `<g class="back"><g class="left">${palm(380, 990, 400, 60, 0.62, 'crownB', true, -2)}</g>` +
    `<g class="right">${palm(1240, 1000, 450, -36, 0.66, 'crownA', false, -4)}</g></g>` +
    `<g class="left">${palm(110, 1040, 650, 110, 1, 'crownA', false, 0)}${palm(250, 1050, 520, 150, 0.84, 'crownB', false, -3)}</g>` +
    `<g class="right">${palm(1510, 1050, 640, -120, 0.98, 'crownB', true, -5)}</g>`

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">` +
    `<style>${style}</style><defs>${DEFS}</defs>${body}</svg>`
  )
}
