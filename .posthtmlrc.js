const { Field, Campo, Label } = require('./sandbox/scripts/field-generator')

module.exports = {
  plugins: {
    'posthtml-include': {
      root: './playground'
    },
    'posthtml-extend': {},
    'posthtml-expressions': {
      unescapeDelimiters: ['{', '}'],
      locals: {
        Field,
        Campo,
        Label
      }
    }
  }
}
