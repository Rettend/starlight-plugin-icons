/* eslint-disable no-console */
import { $ } from 'bun'
import { copy } from 'esbuild-plugin-copy'
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/uno.ts'],
  format: ['esm'],
  target: 'node20',
  splitting: false,
  sourcemap: false,
  dts: false,
  clean: true,
  outDir: 'dist',
  tsconfig: './tsconfig.json',
  external: [
    'astro',
    '@astrojs/starlight',
    'unocss',
    'rehype',
    'hastscript',
    'hast-util-select',
    'hast-util-to-string',
    'unist-util-visit',
    'glob',
    'zod',
    'node:fs',
    'node:fs/promises',
    'node:path',
    'node:process',
    'node:url',
  ],
  esbuildPlugins: [
    copy({
      assets: {
        from: ['./src/components/**/*.astro'],
        to: ['./dist/components'],
      },
      resolveFrom: 'cwd',
    }),
    copy({
      assets: {
        from: ['./src/styles/main.css'],
        to: ['./dist/styles'],
      },
      resolveFrom: 'cwd',
    }),
    copy({
      assets: {
        from: ['./src/assets/**/*.svg'],
        to: ['./dist/assets'],
      },
      resolveFrom: 'cwd',
    }),
  ],
  async onSuccess() {
    console.log('⚡️ Generating type declarations with tsgo...')
    await $`bun tsgo --project tsconfig.build.json`
    console.log('📦 Bundling declarations...')
    await $`bunx rollup -c`
    // Clean up intermediate type directory in a cross-platform way
    try {
      await $`bunx rimraf dist/types`
    }
    catch {
      // ignore
    }
    console.log('✅ Declarations bundled.')
  },
})
