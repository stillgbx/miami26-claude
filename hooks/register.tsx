import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { PALETTE_IDS, PALETTES, type Palette, type PaletteId } from './palettes'
import { sceneSvg } from './scene'

// Miami '26 for Claude Desktop: the Bay and Sunset palettes of the VS Code and Visual Studio
// themes, each in dark and light, over an animated Miami seafront.
//
//   /miami26 bay | sunset     pick the palette
//   /miami26 scene | still    the animated seafront, or the colors alone
//   /miami26 off              back to the app's own look (for this session)

type Backdrop = 'scene' | 'still'

const SCENE_PREFIX = 'miami26-'

const LOOKS = Object.fromEntries(
  PALETTE_IDS.map(id => {
    const palette = PALETTES[id]
    const { theme, problems } = makeColors({
      id: `miami26-${id}`,
      label: palette.label,
      light: { gray: { anchors: palette.light.anchors }, roles: palette.light.roles },
      dark: { gray: { anchors: palette.dark.anchors }, roles: palette.dark.roles },
    })
    return [id, { palette, theme, unpainted: problems.find(line => line.startsWith("Desktop won't paint")) }]
  }),
) as Record<PaletteId, { palette: Palette; theme: ThemeSetArgs['colors']; unpainted?: string }>

const SCENES = Object.fromEntries(PALETTE_IDS.map(id => [id, sceneSvg(PALETTES[id])])) as Record<PaletteId, string>

const isPalette = (value: unknown): value is PaletteId => PALETTE_IDS.includes(value as PaletteId)
const isBackdrop = (value: unknown): value is Backdrop => value === 'scene' || value === 'still'

async function choice($: EngineInterface): Promise<{ palette: PaletteId; backdrop: Backdrop }> {
  const palette = await $.store.get('palette')
  const backdrop = await $.store.get('backdrop')
  return {
    palette: isPalette(palette) ? palette : 'sunset',
    backdrop: isBackdrop(backdrop) ? backdrop : 'scene',
  }
}

async function apply($: EngineInterface): Promise<string> {
  const { palette, backdrop } = await choice($)
  const look = LOOKS[palette]
  if (look.unpainted !== undefined) $.ui.toast(look.unpainted)

  // Still is the colors alone: with no backdrop, the app draws its own ground in them,
  // and the prompt box sits on it with no seam.
  const args: ThemeSetArgs =
    backdrop === 'scene'
      ? { colors: look.theme, backdrop: { scene: SCENE_PREFIX + palette, glass: { blur: 18, opacity: 0.6 } } }
      : { colors: look.theme }
  const set = await $.theme.set(args)
  if (!set.isDrawn) return `${look.palette.label} is set, but nothing draws it here: ${set.reason}`
  return `${look.palette.label}${backdrop === 'scene' ? ', over the seafront' : ''}.`
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'miami26',
      description: "Miami '26 look: /miami26 bay | sunset | scene | still | off",
    })
    await apply($)
    return next(e)
  })

  on('command.run', { command: 'miami26' }, async ($, e) => {
    const words = e.args.trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (words.includes('off')) {
      await $.theme.clear()
      return { text: "Miami '26 is off for this session. /miami26 brings it back." }
    }
    const unknown = words.filter(word => !isPalette(word) && !isBackdrop(word))
    if (unknown.length > 0) {
      return { text: `Unknown: ${unknown.join(' ')}. Use /miami26 bay | sunset | scene | still | off` }
    }
    for (const word of words) {
      if (isPalette(word)) await $.store.set('palette', word)
      if (isBackdrop(word)) await $.store.set('backdrop', word)
    }
    return { text: await apply($) }
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') return next(e)
    const id = e.props.scene.startsWith(SCENE_PREFIX) ? e.props.scene.slice(SCENE_PREFIX.length) : undefined
    if (!isPalette(id)) return next(e)

    const { Svg } = $.ui.resolve(e)
    return (
      <Svg
        source={SCENES[id]}
        alt={id === 'bay' ? 'Miami bay: pastel towers across turquoise water, palm trees swaying' : 'Miami at dusk: the sun setting between Deco towers, neon on a hotel, palm trees swaying'}
        isInteractive
      />
    )
  })
}
