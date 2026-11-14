// The two Miami '26 palettes, each in a dark and a light half, taken from the
// VS Code and Visual Studio themes (github.com/stillgbx/miami26-vscode):
// * Bay: a day on the bay. Sky blue, turquoise water, lavender palm trees, peach facades, warm sand.
// * Sunset: dusk on the ocean front. Magenta, peach, pale gold, periwinkle sky, plum palm trees.
//
// `look` feeds makeColors (the app's colors); `scene` paints the backdrop, in each mode.

export type PaletteId = 'bay' | 'sunset'

export const PALETTE_IDS: readonly PaletteId[] = ['bay', 'sunset']

type Anchors = {
  'surface-0': string
  'surface-1': string
  'surface-2': string
  'surface-3'?: string
  'text-primary': string
  'text-secondary': string
  'text-muted': string
}

type Roles = { accent: string; danger: string; success: string; warning: string; pro: string }

/** The colors of one mode of the backdrop scene. */
export type SceneColors = {
  skyTop: string
  skyMid: string
  skyLow: string
  sunTop: string
  sunBottom: string
  glow: string
  seaTop: string
  seaBottom: string
  shimmer: string
  palm: string
  palmFar: string
  /** The condo towers across the bay, three pastels. */
  towerA: string
  towerB: string
  towerC: string
  /** Their windows, and how much they show (lit at night, a glint by day). */
  window: string
  windowOpacity: string
  /** The Deco hotel on the right, its eyebrows and fin, and the neon along its edges. */
  hotel: string
  hotelTrim: string
  neon: string
  neonOpacity: string
  /** Sand and promenade. */
  shore: string
  cloud: string
}

export type Palette = {
  id: PaletteId
  label: string
  /** The sun sinks into the sea at dusk; it stands in the sky by day. */
  sun: { x: number; y: number; r: number; striped: boolean }
  dark: { anchors: Anchors; roles: Roles; scene: SceneColors }
  light: { anchors: Anchors; roles: Roles; scene: SceneColors }
}

export const PALETTES: Record<PaletteId, Palette> = {
  bay: {
    id: 'bay',
    label: "Miami '26 Bay",
    sun: { x: 1010, y: 300, r: 80, striped: false },
    dark: {
      // The bay at nightfall: a lilac blue sky over deep water.
      anchors: {
        'surface-0': '#0b1626',
        'surface-1': '#102230',
        'surface-2': '#16283c',
        'surface-3': '#1c3044',
        'text-primary': '#eaf4f2',
        'text-secondary': '#c2d6e0',
        'text-muted': '#93afc2',
      },
      roles: { accent: '#5fd6c6', danger: '#ff6b8b', success: '#7edc9e', warning: '#f5c98f', pro: '#a9a6f0' },
      scene: {
        skyTop: '#0b1626',
        skyMid: '#26336a',
        skyLow: '#8c86d8',
        sunTop: '#fde3cf',
        sunBottom: '#f5b095',
        glow: '#a9a6f0',
        seaTop: '#14505a',
        seaBottom: '#0b1626',
        shimmer: '#7fd8c8',
        palm: '#151d3c',
        palmFar: '#28305a',
        towerA: '#34407a',
        towerB: '#433a70',
        towerC: '#2a4668',
        window: '#f5b49c',
        windowOpacity: '.8',
        hotel: '#3a3468',
        hotelTrim: '#544c8c',
        neon: '#5fd6c6',
        neonOpacity: '.95',
        shore: '#121c34',
        cloud: '#a9a6f0',
      },
    },
    light: {
      // The bay in daylight: mint water panels and sand cards.
      anchors: {
        'surface-0': '#d3eee8',
        'surface-1': '#fbf3e6',
        'surface-2': '#fef9f0',
        'text-primary': '#1b3245',
        'text-secondary': '#33506a',
        'text-muted': '#45627e',
      },
      roles: { accent: '#128079', danger: '#c62d58', success: '#2a7f47', warning: '#a3561a', pro: '#5853b5' },
      scene: {
        skyTop: '#7cbce8',
        skyMid: '#b4dcf2',
        skyLow: '#e6f5f2',
        sunTop: '#fffbe8',
        sunBottom: '#ffe2b0',
        glow: '#fff4d0',
        seaTop: '#5fd6c6',
        seaBottom: '#2f9fa0',
        shimmer: '#ffffff',
        palm: '#7470c8',
        palmFar: '#a8a6e8',
        towerA: '#f5c4a8',
        towerB: '#eab6d2',
        towerC: '#c6c8f0',
        window: '#7cbce8',
        windowOpacity: '.55',
        hotel: '#fbe2c6',
        hotelTrim: '#7fd8c8',
        neon: '#f08cbc',
        neonOpacity: '.45',
        shore: '#f3ddb0',
        cloud: '#ffffff',
      },
    },
  },
  sunset: {
    id: 'sunset',
    label: "Miami '26 Sunset",
    sun: { x: 1000, y: 600, r: 150, striped: true },
    dark: {
      // Dusk on the ocean front: plum palms, a peach horizon, a magenta accent.
      anchors: {
        'surface-0': '#160e24',
        'surface-1': '#1e1430',
        'surface-2': '#231833',
        'surface-3': '#2a1d3c',
        'text-primary': '#f8eef4',
        'text-secondary': '#d6c8e0',
        'text-muted': '#b3a3c8',
      },
      roles: { accent: '#ff5faa', danger: '#ff5c6c', success: '#7ee0a8', warning: '#ffd27f', pro: '#a9b4f5' },
      scene: {
        skyTop: '#140b22',
        skyMid: '#4a2a72',
        skyLow: '#f06aa6',
        sunTop: '#ffe08a',
        sunBottom: '#ff5faa',
        glow: '#ff7ab8',
        seaTop: '#3a2160',
        seaBottom: '#140b22',
        shimmer: '#ffb27a',
        palm: '#21123a',
        palmFar: '#3a2458',
        towerA: '#3a2458',
        towerB: '#4a2a60',
        towerC: '#2e2a5c',
        window: '#ffd27f',
        windowOpacity: '.8',
        hotel: '#45295e',
        hotelTrim: '#64407e',
        neon: '#ff5faa',
        neonOpacity: '.95',
        shore: '#1a1028',
        cloud: '#ff9cc8',
      },
    },
    light: {
      // The sky at dusk, top to bottom: lavender, pink, peach.
      anchors: {
        'surface-0': '#f8d8e1',
        'surface-1': '#fdebdb',
        'surface-2': '#fef4ec',
        'text-primary': '#2e1a3d',
        'text-secondary': '#4e3459',
        'text-muted': '#6c5277',
      },
      roles: { accent: '#c8287a', danger: '#c42b3a', success: '#2e7d4a', warning: '#7f5e00', pro: '#4a56b8' },
      scene: {
        skyTop: '#aeb4f0',
        skyMid: '#d8c4f0',
        skyLow: '#ffc8a8',
        sunTop: '#fff4c0',
        sunBottom: '#ff8fbc',
        glow: '#ffd0b0',
        seaTop: '#f0a8c8',
        seaBottom: '#8f86d6',
        shimmer: '#fff4dc',
        palm: '#7a4c8e',
        palmFar: '#a888c4',
        towerA: '#f3c6b8',
        towerB: '#d8b8e8',
        towerC: '#b8b2ec',
        window: '#9aa6f0',
        windowOpacity: '.55',
        hotel: '#fbe6b4',
        hotelTrim: '#c4b4ea',
        neon: '#ff5faa',
        neonOpacity: '.5',
        shore: '#f0c4d4',
        cloud: '#ffffff',
      },
    },
  },
}
