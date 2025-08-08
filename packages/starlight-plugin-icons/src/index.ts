import type { StarlightPlugin } from '@astrojs/starlight/types'
import type { AstroIntegration } from 'astro'
import type { StarlightIconsOptions, StarlightUserConfigWithIcons } from './types'
import process from 'node:process'
import starlight from '@astrojs/starlight'
import { pluginIcon } from './lib/expressive-code'
import { generateSafelist } from './lib/safelist'
import { withSidebarIcons } from './lib/sidebar'
import { StarlightIconsOptionsSchema } from './types'

export { pluginIcon } from './lib/expressive-code'
export { withSidebarIcons } from './lib/sidebar'
export type { SidebarGroupInput, SidebarInput, SidebarLinkInput } from './lib/sidebar'

export function starlightIconsPlugin(options: StarlightIconsOptions = {}): StarlightPlugin {
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
        if (parsedOptions.codeblock && !customCss.includes('starlight-plugin-icons/styles/main.css')) {
          customCss.push('starlight-plugin-icons/styles/main.css')
        }

        const ec = config.expressiveCode
        const ecObj = typeof ec === 'object' ? (ec as Exclude<typeof ec, boolean | undefined>) : undefined
        const expressiveCode
          = ec === false
            ? false
            : ({
                ...(ecObj ?? {}),
                plugins: [
                  ...(ecObj?.plugins ?? []),
                  ...(parsedOptions.codeblock ? [pluginIcon()] as any[] : []),
                ],
              } as Exclude<typeof ec, boolean | undefined>)

        updateConfig({ components, customCss, expressiveCode })
      },
    },
  }
}

export function starlightIconsIntegration(options: StarlightIconsOptions = {}): AstroIntegration {
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

export type StarlightPluginIconsPresetOptions = StarlightIconsOptions & {
  starlight?: StarlightUserConfigWithIcons
}

/**
 * All-in-one preset that wires up Starlight with this plugin for you.
 */
export default function Icons(options: StarlightPluginIconsPresetOptions = {}): AstroIntegration[] {
  const { starlight: starlightOptions, ...iconsOptions } = options

  const starlightBase = (starlightOptions ?? {}) as StarlightUserConfigWithIcons
  const starlightWithIcons = starlight({
    ...starlightBase,
    sidebar: starlightBase.sidebar ? withSidebarIcons(starlightBase.sidebar) : undefined,
    plugins: [
      ...(starlightBase.plugins ?? []),
      starlightIconsPlugin(iconsOptions),
    ],
  })

  const astroSide = starlightIconsIntegration(iconsOptions)
  return [starlightWithIcons, astroSide]
}
