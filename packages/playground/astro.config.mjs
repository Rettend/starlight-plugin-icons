// @ts-check
import { defineConfig } from 'astro/config'
import Icons, { defineSidebar } from 'starlight-plugin-icons'
import starlightSidebarTopics from 'starlight-sidebar-topics'
import UnoCSS from 'unocss/astro'

export default defineConfig({
  integrations: [
    UnoCSS(),
    Icons({
      sidebar: true,
      extractSafelist: true,
      starlight: {
        title: 'Playground',
        components: {
          Sidebar: './src/components/starlight/Sidebar.astro',
        },
        plugins: [
          starlightSidebarTopics([
            {
              id: 'docs',
              label: 'Docs',
              icon: 'i-ph:book-open-bold',
              link: '/getting-started/welcome/',
              items: defineSidebar([
                {
                  label: 'Getting Started',
                  items: [
                    { icon: 'i-ph:hand-waving-duotone', label: 'Welcome', slug: 'getting-started/welcome' },
                    { icon: 'i-ph:package-duotone', label: 'Installation', slug: 'getting-started/installation' },
                  ],
                },
              ]),
            },
            {
              label: 'Guides',
              icon: 'i-ph:rocket-bold',
              link: '/guides/first-guide/',
              items: defineSidebar([
                {
                  label: 'All Guides',
                  items: [
                    { icon: 'i-ph:book-open-duotone', label: 'First Guide', slug: 'guides/first-guide' },
                    // Test: omit label — Starlight should auto-resolve from frontmatter
                    { icon: 'i-ph:lightbulb-duotone', slug: 'guides/second-guide' },
                  ],
                },
              ]),
            },
          ]),
        ],
      },
    }),
  ],
})
