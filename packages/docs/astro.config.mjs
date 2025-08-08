// @ts-check
import { fileURLToPath } from 'node:url'
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import { starlightPluginIconsPreset, withSidebarIcons } from 'starlight-plugin-icons'
import UnoCSS from 'unocss/astro'

export default defineConfig({
  base: 'starlight-plugin-icons',
  vite: {
    resolve: {
      alias: {
        '~': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
  integrations: [
    UnoCSS(),
    ...starlightPluginIconsPreset(starlight, {
      starlight: {
        title: 'starlight-plugin-icons',
        social: [
          { icon: 'github', label: 'GitHub', href: 'https://github.com/Rettend/starlight-plugin-icons' },
          { icon: 'discord', label: 'Discord', href: 'https://discord.gg/FvVaUPhj3t' },
        ],
        customCss: ['@fontsource/inter/400.css', '@fontsource/inter/600.css', './src/styles/custom.css'],
        components: {
          Header: './src/components/starlight/Header.astro',
        },
        tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 5 },
        sidebar: withSidebarIcons([
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
              { icon: 'i-starlight-plugin-icons:svelte-js', label: 'Svelte', slug: 'demo/drizzle' },
              { icon: 'i-starlight-plugin-icons:folder-open', label: 'Svelte', slug: 'demo/drizzle' },
              { icon: 'i-material-icon-theme:svelte', label: 'Svelte', slug: 'demo/drizzle' },
            ],
          },
        ]),
      },
    }),
  ],
})
