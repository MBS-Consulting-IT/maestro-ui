import pkg from './package.json'

export default {
  input: './src/js/main.js',
  output: [
    {
      file: pkg.module,
      format: 'esm'
    },
    {
      name: 'Maestro',
      file: pkg.browser,
      format: 'umd'
    }
  ]
}
