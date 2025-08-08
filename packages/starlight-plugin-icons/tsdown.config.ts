import copy from 'rollup-plugin-copy'
import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/uno.ts', 'src/lib/rehype-file-tree.ts'],
  outDir: 'dist',
  format: ['esm'],
  target: 'node20',
  dts: true,
  clean: true,
  tsconfig: './tsconfig.build.json',
  sourcemap: false,
  plugins: [
    copy({
      targets: [
        { src: 'src/components/*.astro', dest: 'dist/components' },
        { src: 'src/components/starlight/*.astro', dest: 'dist/components/starlight' },
        { src: 'src/assets/**/*', dest: 'dist/assets' },
        { src: 'src/styles/main.css', dest: 'dist/styles' },
      ],
      hook: 'writeBundle',
      copyOnce: false,
      verbose: true,
    }),
  ],
})
