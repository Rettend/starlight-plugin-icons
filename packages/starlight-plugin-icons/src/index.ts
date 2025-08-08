import type { AstroIntegration } from 'astro'
import type { StarlightIconsOptions } from './types'
import process from 'node:process'
import { pluginIcon } from './lib/expressive-code'
import { generateSafelist } from './lib/safelist'
import { StarlightIconsOptionsSchema } from './types'

export { withSidebarIcons } from './lib/sidebar'
export type { SidebarGroupInput, SidebarInput, SidebarLinkInput } from './lib/sidebar'

function starlightPluginIcons(options: StarlightIconsOptions = {}): AstroIntegration {
  const parsedOptions = StarlightIconsOptionsSchema.parse(options)

  return {
    name: 'starlight-plugin-icons',
    hooks: {
      'astro:config:setup': ({ config, updateConfig, logger }) => {
        const starlightConfig: any = config.integrations.find(({ name }) => name === '@astrojs/starlight')

        if (!starlightConfig) {
          logger.warn('Starlight integration not found. Skipping starlight-plugin-icons.')
          return
        }

        starlightConfig.plugins ??= []
        starlightConfig.plugins.push({
          name: 'starlight-plugin-icons',
          hooks: {
            'config:setup': ({ config, updateConfig }: { config: any, updateConfig: any }) => {
              const components: Record<string, string> = { ...(config.components || {}) }
              if (parsedOptions.sidebar) {
                components.Sidebar = 'starlight-plugin-icons/components/starlight/Sidebar.astro'
              }

              const customCss = Array.isArray(config.customCss) ? [...config.customCss] : []
              if (!customCss.includes('starlight-plugin-icons/styles/main.css')) {
                customCss.push('starlight-plugin-icons/styles/main.css')
              }

              const expressiveCode = config.expressiveCode === false
                ? false
                : {
                    ...(config.expressiveCode || {}),
                    plugins: [
                      ...(config.expressiveCode?.plugins || []),
                      pluginIcon(),
                    ],
                  }

              updateConfig({
                components,
                customCss,
                expressiveCode,
              } as any)
            },
          },
        })

        // updateConfig({
        //   integrations: config.integrations,
        // })
      },
      'astro:build:start': async ({ logger }) => {
        if (!parsedOptions.extractSafelist) {
          return
        }

        logger.info('Generating icon safelist...')
        await generateSafelist(logger, process.cwd())
      },
      'astro:server:start': async ({ logger }) => {
        if (!parsedOptions.extractSafelist) {
          return
        }

        logger.info('Generating icon safelist...')
        await generateSafelist(logger, process.cwd())
      },
    },
  }
}

export default starlightPluginIcons
