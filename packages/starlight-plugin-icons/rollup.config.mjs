import dts from 'rollup-plugin-dts'

export default [
  {
    input: 'dist/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
  {
    input: 'dist/types/uno.d.ts',
    output: [{ file: 'dist/uno.d.ts', format: 'es' }],
    plugins: [dts()],
  },
]
