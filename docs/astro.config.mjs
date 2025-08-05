// @ts-check
import { fileURLToPath } from 'node:url'
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import UnoCSS from 'unocss/astro'
import { pluginIcon } from './src/lib/expressive-code.mjs'

/**
 * @param {any[]} sidebar
 *
 * @returns {any[]} sidebar
 */
function addIcons(sidebar) {
  return sidebar.map((entry) => {
    if ('items' in entry)
      return { ...entry, items: addIcons(entry.items) }

    const icon = entry.attrs?.icon ?? entry.icon
    if (icon) {
      delete entry.icon
      if (!entry.attrs)
        entry.attrs = {}
      entry.attrs['data-icon'] = icon
    }

    return entry
  })
}

export default defineConfig({
  vite: {
    base: '',
    resolve: {
      alias: {
        '~': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
  integrations: [
    UnoCSS(),
    starlight({
      title: 'starlight-plugin-icons',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/Rettend/starlight-plugin-icons' },
        { icon: 'discord', label: 'Discord', href: 'https://discord.gg/FvVaUPhj3t' },
      ],
      customCss: ['@fontsource/inter/400.css', '@fontsource/inter/600.css', './src/styles/custom.css'],
      expressiveCode: {
        plugins: [pluginIcon()],
      },
      components: {
        Header: './src/components/starlight/Header.astro',
        Sidebar: './src/components/starlight/Sidebar.astro',
      },
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 5 },
      sidebar: addIcons([
        {
          label: 'Guides',
          items: [
            { icon: 'i-ph:rocket-launch-duotone', label: 'Getting Started', slug: 'guides/getting-started' },
            { icon: 'i-ph:lego-duotone', label: 'Configuration', slug: 'guides/configuration' },
          ],
        },
        {
          label: 'Demo',
          items: [
            { icon: 'i-icons:drizzle', label: 'Drizzle', slug: 'demo/drizzle' },
          ],
        },
      ]),
    }),
  ],
})
