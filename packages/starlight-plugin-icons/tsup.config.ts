/* eslint-disable no-console */
import { $ } from 'bun'
import { copy } from 'esbuild-plugin-copy'
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/uno.ts', 'src/lib/rehype-file-tree.ts'],
  format: ['esm'],
  target: 'node20',
  splitting: false,
  sourcemap: false,
  dts: false,
  clean: true,
  outDir: 'dist',
  tsconfig: './tsconfig.json',
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
    try {
      await $`rm -rf dist/types`
    }
    catch {
    }
    console.log('✅ Declarations bundled.')
  },
})
