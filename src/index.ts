import type { AstroIntegration } from 'astro'
import type { StarlightIconsOptions } from './types'
import process from 'node:process'
import { generateSafelist } from './lib/safelist'
import { StarlightIconsOptionsSchema } from './types'

export default function starlightPluginIcons(options: StarlightIconsOptions = {}): AstroIntegration {
  const parsedOptions = StarlightIconsOptionsSchema.parse(options)

  return {
    name: 'starlight-plugin-icons',
    hooks: {
      'astro:build:start': async ({ logger }) => {
        if (!parsedOptions.codeBlocks)
          return

        logger.info('Generating icon safelist...')
        await generateSafelist(logger, process.cwd())
      },
      'astro:server:start': async ({ logger }) => {
        if (!parsedOptions.codeBlocks)
          return

        logger.info('Generating icon safelist...')
        await generateSafelist(logger, process.cwd())
      },
    },
  }
}
