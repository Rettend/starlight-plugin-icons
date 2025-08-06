import type { AstroIntegration } from 'astro'
import type { StarlightIconsOptions } from './types'
import process from 'node:process'
import { generateSafelist } from './lib/safelist'
import { StarlightIconsOptionsSchema } from './types'

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

        const components: Record<string, string> = {}

        if (parsedOptions.sidebar) {
          components.Sidebar = 'starlight-plugin-icons/components/starlight/Sidebar.astro'
        }

        starlightConfig.plugins ??= []
        starlightConfig.plugins.push({
          name: 'starlight-plugin-icons-components',
          hooks: {
            'starlight:override:components': () => {
              return components
            },
          },
        })

        updateConfig({
          integrations: config.integrations,
        })
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
