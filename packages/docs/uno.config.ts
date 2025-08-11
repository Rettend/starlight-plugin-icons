import fs from 'node:fs/promises'
import { presetStarlightIcons } from 'starlight-plugin-icons/uno'
import { defineConfig, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetStarlightIcons(),
    presetIcons({
      collections: {
        icons: {
          drizzle: () => fs.readFile('./src/assets/drizzle.svg', 'utf-8'),
        },
      },
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
      customizations: {
        iconCustomizer(collection, icon, props) {
          if (['simple-icons', 'logos'].includes(collection))
            props.transform = 'scale(0.8)'

          if (collection === 'icons') {
            if (icon === 'drizzle')
              props.transform = 'scale(0.8)'
          }
        },
      },
    }),
  ],
  // content: {
  //   pipeline: {
  //     include: [
  //       /\.(vue|svelte|[jt]sx|vine.ts|mdx?|astro|elm|php|phtml|html|mjs)($|\?)/,
  //     ],
  //   },
  //   filesystem: [
  //     'astro.config.mjs',
  //   ],
  // },
})
