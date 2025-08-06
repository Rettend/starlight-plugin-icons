import { $ } from 'bun'
import { copy } from 'esbuild-plugin-copy'
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/uno.ts'],
  format: ['esm'],
  target: 'node20',
  splitting: true,
  sourcemap: false,
  dts: false,
  clean: true,
  outDir: 'dist',
  esbuildPlugins: [
    copy({
      assets: {
        from: ['./src/components/**/*.astro'],
        to: ['./dist/components'],
      },
      resolveFrom: 'cwd',
    }),
  ],
  async onSuccess() {
    // eslint-disable-next-line no-console
    console.log('⚡️ Generating .d.ts files with tsgo...')
    await $`bun tsgo --project tsconfig.build.json --outDir dist`
    // eslint-disable-next-line no-console
    console.log('✅ Successfully generated .d.ts files.')
  },
})
