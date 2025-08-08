import type { StarlightPlugin } from '@astrojs/starlight/types'
import type { AstroIntegration } from 'astro'
import type { StarlightIconsOptions } from './types'
import process from 'node:process'
import starlight from '@astrojs/starlight'
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
      'astro:config:setup': async ({ logger }) => {
        if (!parsedOptions.extractSafelist)
          return
        try {
          logger.info('Preparing icon safelist...')
          await generateSafelist(logger, process.cwd())
        }
        catch (err) {
          logger.warn(`Failed to prepare icon safelist early: ${err instanceof Error ? err.message : String(err)}`)
        }
      },
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

export type StarlightPluginIconsPresetOptions = StarlightIconsOptions & {
  // Forward Starlight integration options to the bundled Starlight integration
  starlight?: Parameters<typeof starlight>[0]
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
export function starlightPluginIconsPreset(options: StarlightPluginIconsPresetOptions = {}): AstroIntegration[] {
  const { starlight: starlightOptions, ...iconsOptions } = options

  const starlightBase = (starlightOptions ?? {}) as Parameters<typeof starlight>[0]
  const starlightWithIcons = starlight({
    ...starlightBase,
    plugins: [
      ...(starlightBase.plugins ?? []),
      starlightPluginIconsPlugin(iconsOptions),
    ],
  })

  const astroSide = starlightPluginIcons(iconsOptions)
  return [starlightWithIcons, astroSide]
}
