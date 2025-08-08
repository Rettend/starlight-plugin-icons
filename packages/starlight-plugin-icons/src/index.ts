import type { StarlightPlugin } from '@astrojs/starlight/types'
import type { AstroIntegration } from 'astro'
import type { StarlightIconsOptions } from './types'
import process from 'node:process'
import { pluginIcon } from './lib/expressive-code'
import { generateSafelist } from './lib/safelist'
import { StarlightIconsOptionsSchema } from './types'

export { pluginIcon } from './lib/expressive-code'
export { withSidebarIcons } from './lib/sidebar'
export type { SidebarGroupInput, SidebarInput, SidebarLinkInput } from './lib/sidebar'

export function starlightPluginIconsPlugin(options: StarlightIconsOptions = {}): StarlightPlugin {
  const parsedOptions = StarlightIconsOptionsSchema.parse(options)
  return {
    name: 'starlight-plugin-icons',
    hooks: {
      'config:setup': ({ config, updateConfig }) => {
        const components: Record<string, string> = { ...(config.components || {}) }
        if (parsedOptions.sidebar) {
          components.Sidebar = 'starlight-plugin-icons/components/starlight/Sidebar.astro'
        }

        const customCss = Array.isArray(config.customCss) ? [...config.customCss] : []
        if (!customCss.includes('starlight-plugin-icons/styles/main.css')) {
          customCss.push('starlight-plugin-icons/styles/main.css')
        }

        const ec = config.expressiveCode
        const ecObj = typeof ec === 'object' ? (ec as Exclude<typeof ec, boolean | undefined>) : undefined
        const expressiveCode
          = ec === false
            ? false
            : ({
                ...(ecObj ?? {}),
                plugins: [...(ecObj?.plugins ?? []), pluginIcon()],
              } as Exclude<typeof ec, boolean | undefined>)

        updateConfig({ components, customCss, expressiveCode })
      },
    },
  }
}

function starlightPluginIcons(options: StarlightIconsOptions = {}): AstroIntegration {
  const parsedOptions = StarlightIconsOptionsSchema.parse(options)
  return {
    name: 'starlight-plugin-icons',
    hooks: {
      'astro:build:start': async ({ logger }) => {
        if (!parsedOptions.extractSafelist)
          return
        logger.info('Generating icon safelist...')
        await generateSafelist(logger, process.cwd())
      },
      'astro:server:start': async ({ logger }) => {
        if (!parsedOptions.extractSafelist)
          return
        logger.info('Generating icon safelist...')
        await generateSafelist(logger, process.cwd())
      },
    },
  }
}

export default starlightPluginIcons

export type StarlightIntegrationFactory = (userOptions: any) => AstroIntegration

export type StarlightPluginIconsPresetOptions = StarlightIconsOptions & {
  // Options to forward to Starlight integration factory provided by the user
  starlight?: any
}

/**
 * All-in-one preset that wires up Starlight with this plugin for you.
 * Usage in astro.config.*:
 *
 * integrations: [
 *   UnoCSS(),
 *   starlightPluginIconsPreset({ starlight: { ...yourStarlightOptions } })
 * ]
 */
export function starlightPluginIconsPreset(
  starlightFactoryOrOptions?: StarlightIntegrationFactory | StarlightPluginIconsPresetOptions,
  maybeOptions: StarlightPluginIconsPresetOptions = {},
): AstroIntegration[] {
  // Support only the safe form that passes the Starlight integration factory to avoid importing TS from this package.
  const starlightFactory = (typeof starlightFactoryOrOptions === 'function'
    ? starlightFactoryOrOptions
    : undefined) as StarlightIntegrationFactory | undefined

  const options = (starlightFactory
    ? maybeOptions
    : (starlightFactoryOrOptions as StarlightPluginIconsPresetOptions)) || {}

  if (!starlightFactory) {
    throw new Error(
      'starlightPluginIconsPreset requires the Starlight integration function as the first argument.\n'
      + 'Usage: ...starlightPluginIconsPreset(starlight, { starlight: { /* your config */ } })',
    )
  }

  const { starlight: starlightOptions, ...iconsOptions } = options
  const starlightBase = (starlightOptions ?? {}) as any
  const starlightWithIcons = starlightFactory({
    ...starlightBase,
    plugins: [
      ...(starlightBase.plugins ?? []),
      starlightPluginIconsPlugin(iconsOptions),
    ],
  })

  const astroSide = starlightPluginIcons(iconsOptions)
  return [starlightWithIcons, astroSide]
}
