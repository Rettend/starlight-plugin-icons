import fs from 'node:fs/promises'
import { defineConfig, presetIcons } from 'unocss'

async function getMaterialIconsSafelist() {
  try {
    const safelist = await fs.readFile('.material-icons-cache/material-icons-safelist.json', 'utf-8')
    return JSON.parse(safelist)
  }
  catch {
    return []
  }
}

export default defineConfig({
  safelist: await getMaterialIconsSafelist(),
  presets: [
    presetIcons({
      collections: {
        icons: {
          'drizzle': () => fs.readFile('./src/assets/drizzle.svg', 'utf-8'),
          'folder': () => fs.readFile('./src/assets/folder.svg', 'utf-8'),
          'folder-open': () => fs.readFile('./src/assets/folder-open.svg', 'utf-8'),
        },
      },
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
      customizations: {
        iconCustomizer(collection, icon, props) {
          if (['devicon', 'simple-icons', 'logos'].includes(collection))
            props.transform = 'scale(0.8)'

          if (collection === 'icons') {
            if (icon === 'drizzle')
              props.transform = 'scale(0.8)'
          }
        },
      },
    }),
  ],
  content: {
    pipeline: {
      include: [
        /\.(vue|svelte|[jt]sx|vine.ts|mdx?|astro|elm|php|phtml|html|mjs)($|\?)/,
      ],
    },
    filesystem: [
      'astro.config.mjs',
      'src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue,mjs}',
    ],
  },
})
