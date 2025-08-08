// @ts-check
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'astro/config'
import Icons from 'starlight-plugin-icons'
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
    Icons({
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
        sidebar: [
          {
            label: 'Getting Started',
            items: [
              { icon: 'i-ph:rocket-launch-duotone', label: 'Introduction', slug: 'getting-started/introduction' },
              { icon: 'i-ph:package-duotone', label: 'Installation', slug: 'getting-started/installation' },
              { icon: 'i-ph:play-duotone', label: 'Quick Start', slug: 'getting-started/quick-start' },
            ],
          },
          {
            label: 'Guides',
            items: [
              { icon: 'i-ph:gear-six-duotone', label: 'Configuration', slug: 'guides/configuration' },
              { icon: 'i-ph:list-bullets-duotone', label: 'Sidebar Icons', slug: 'guides/sidebar-icons' },
              { icon: 'i-ph:code-block-duotone', label: 'Code Block Icons', slug: 'guides/codeblock-icons' },
              { icon: 'i-logos:unocss', label: 'UnoCSS Preset', slug: 'guides/unocss-preset' },
              { icon: 'i-ph:shield-check-duotone', label: 'Safelist & Caching', slug: 'guides/safelist' },
              { icon: 'i-ph:paint-brush-broad-duotone', label: 'Theming', slug: 'guides/theming' },
            ],
          },
          {
            label: 'Components',
            items: [
              { icon: 'i-ph:link-simple-duotone', label: 'IconLink', slug: 'components/icon-link' },
              { icon: 'i-ph:rectangle-duotone', label: 'Card', slug: 'components/card' },
              { icon: 'i-ph:files-duotone', label: 'FileTree', slug: 'components/file-tree' },

            ],
          },
          {
            label: 'Reference',
            items: [
              { icon: 'i-ph:book-open-text-duotone', label: 'API', slug: 'reference/api' },
              { icon: 'i-ph:sliders-duotone', label: 'Options', slug: 'reference/options' },
              { icon: 'i-ph:brackets-curly-duotone', label: 'Types', slug: 'reference/types' },
            ],
          },
          {
            label: 'Recipes',
            items: [
              { icon: 'i-ph:magic-wand-duotone', label: 'Custom Icons', slug: 'recipes/custom-icons' },
              { icon: 'i-ph:git-branch-duotone', label: 'Monorepo Setup', slug: 'recipes/monorepo' },
            ],
          },
          {
            label: 'Help',
            items: [
              { icon: 'i-ph:wrench-duotone', label: 'Troubleshooting', slug: 'help/troubleshooting' },
            ],
          },
        ],
      },
    }),
  ],
})
