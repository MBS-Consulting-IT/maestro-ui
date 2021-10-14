export default {
  input: './src/main.js',
  output: [
    {
      name: 'Maestro',
      file: 'dist/orquestra-utils.js',
      format: 'umd'
    },
    {
      name: 'Maestro',
      file: 'dist/orquestra-utils.esm.js',
      format: 'esm',
      exports: 'named'
    },
    {
      name: 'Maestro',
      file: 'dist/orquestra-utils.cjs.js',
      format: 'cjs',
      exports: 'named'
    }
  ]
}
