const chance = require('chance').Chance()

/**
 * @todo
 * - dar suporte a campos do tipo arquivo
 * - dar suporte a campos pesquisar e preencher
 * - dar suporte a campos no formato somente leitura, tratando campos múltiplos e arquivo
 * - tratar campos com máscara e comportamentos específicos:
 *  - cep; cnpj; cpf; hora; número; placa; senha; telefone; monetário.
 */

/**
 * Converte os parâmetros dos construtores em objetos
 * de configuração.
 * Não é possível a utilização de parâmetros do tipo objeto
 * nos construtores devido ao uso dos caracteres `{}` como
 * delimitadores das funções `unscaped`.
 *
 * @param {Any[]} params - parâmetros dos construtores
 * @returns {Object} parâmetros em formato de objeto
 */
function resolveParams (params) {
  const defaultProps = getFieldDefaultProps()
  const [
    required,
    placeholder,
    id,
    options,
    mask,
    label,
    codField,
    autocomplete
  ] = params

  return {
    required: required || defaultProps.required,
    placeholder: placeholder || defaultProps.placeholder,
    options: options || defaultProps.options,
    id: id || defaultProps.id,
    mask: mask || defaultProps.mask,
    label: label || defaultProps.label,
    codField: codField || defaultProps.codField,
    autocomplete: autocomplete || defaultProps.autocomplete
  }
}

/**
 * Gera `options` randômicas para campos do tipo `select`
 * @param {Number} options.min - min. de opções
 * @param {Number} options.max - máx. de opções
 * @returns {Object[]} array de objetos com as  `options` geradas, com
 * propriedades `value` e `text`.
 */
function generateRandomSelectOptions (options = {}) {
  const { min, max } = {
    min: 2,
    max: 8,
    ...options
  }
  const length = chance.integer({ min, max })

  return Array.from(Array(length), () => ([
    chance.word({ syllables: 5 }),
    chance.name()
  ]))
}

/**
 * Cria as propriedades default de um campo de formulário
 * @returns {Object} propriedades html default de campos de
 * formulário Orquestra
 */
function getFieldDefaultProps () {
  return {
    id: chance.word({ syllables: 5 }),
    required: 'N',
    label: chance.name(),
    codField: chance.string({ length: 5, numeric: true }),
    mask: '',
    placeholder: '',
    autocomplete: '',
    options: generateRandomSelectOptions()
  }
}

/**
 * Cria uma coleção de inputs relacionados através do id.
 * Utilizado para campos `Múltipla Seleção` (checkbox) e
 * `Múltipla Escolha` (radio).
 * @param {Object} props - propriedades do campo de formulário
 * @param {Object[]} fieldOptions - opções do campo de formulário
 * @returns {String} coleção de campos correlatos
 */
function generateInputCollection (props, fieldOptions) {
  return fieldOptions
    .map(([value, text], i) => `
      <label for="${props.id + i}" class="${props.type}">
        <input
          type="${props.type}"
          name="inp${props.codField}"
          xname="inp${props.id}"
          id="${props.id + i}"
          label="${props.label}"
          required="${props.required}"
          value="${value}"
        >${text}</label>`
    )
    .join('')
}

// -----------------------------------------------------------
// 🏭 Generators
// -----------------------------------------------------------

/**
 * Cria um campo de formulário do tipo `Texto` (input[type=text])
 * @param {String} required - valores "S"/"N" utilizados pelo Orquestra
 * @param {String} placeholder - propriedade html placeholder
 * @param {String} id - xname, id textual do campo
 * @param {String[]} options - `options` do campo
 * @param {String} mask - pattern de máscara
 * @param {String} label - propriedade html label
 * @param {String|Number} codField - id numérico do campo
 * @param {String} autocomplete valores "on"/"off" nativos do html
 * @returns {String} campo do tipo `Texto`
 */
function getInputText (...config) {
  const params = resolveParams(config)

  if (params.mask !== '') {
    params.autocomplete = 'off'
  }

  return `<input
    type="text"
    name="inp${params.codField}"
    xname="inp${params.id}"
    label="${params.label}"
    mask="${params.mask}"
    required="${params.required}"
    placeholder="${params.placeholder}"
    autocomplete="${params.autocomplete}"
  ><em></em>`
}

/**
 * Cria um campo de formulário do tipo `Data` (input[type=text])
 * @param {String} required - valores "S"/"N" utilizados pelo Orquestra
 * @param {String} placeholder - propriedade html placeholder
 * @param {String} id - xname, id textual do campo
 * @param {String[]} options - `options` do campo
 * @param {String} mask - pattern de máscara
 * @param {String} label - propriedade html label
 * @param {String|Number} codField - id numérico do campo
 * @param {String} autocomplete valores "on"/"off" nativos do html
 * @returns {String} campo do tipo `Data`
 */
function getInputDate (...config) {
  const params = {
    ...resolveParams(config),
    autocomplete: 'off'
  }

  return `<input
    type="text"
    name="inp${params.codField}"
    xname="inp${params.id}"
    label="${params.label}"
    mask="date"
    required="${params.required}"
    placeholder="${params.placeholder}"
    autocomplete="${params.autocomplete}"
  ><em></em>`
}

/**
 * Cria um campo de formulário do tipo `Área de Texto` (textarea)
 * @param {String} required - valores "S"/"N" utilizados pelo Orquestra
 * @param {String} placeholder - propriedade html placeholder
 * @param {String} id - xname, id textual do campo
 * @param {String[]} options - `options` do campo
 * @param {String} mask - pattern de máscara
 * @param {String} label - propriedade html label
 * @param {String|Number} codField - id numérico do campo
 * @param {String} autocomplete valores "on"/"off" nativos do html
 * @returns {String} campo do tipo `Área de Texto`
 */
function getTextarea (...config) {
  const params = resolveParams(config)

  return `<textarea
    rows="5"
    name="inp${params.codField}"
    xname="inp${params.id}"
    label="${params.label}"
    required="${params.required}"
    placeholder="${params.placeholder}"
  ></textarea>
  <em></em>`
}

/**
 * Cria campos de formulário do tipo `Caixa de Seleção` (select)
 * @param {String} required - valores "S"/"N" utilizados pelo Orquestra
 * @param {String} placeholder - propriedade html placeholder
 * @param {String} id - xname, id textual do campo
 * @param {String[]} options - `options` do campo
 * @param {String} mask - pattern de máscara
 * @param {String} label - propriedade html label
 * @param {String|Number} codField - id numérico do campo
 * @param {String} autocomplete valores "on"/"off" nativos do html
 * @returns {String} campo do tipo `Caixa de Seleção`
 */
function getSelect (...config) {
  const params = resolveParams(config)

  const options = [
    ['', 'Selecione'],
    ...params.options
  ]

  const createOptions = options =>
    options
      .map(([value, text]) => `<option value="${value}">${text}</option>`)
      .join('')

  return `<select
    name="inp${params.codField}"
    xname="inp${params.id}"
    label="${params.label}"
    required="${params.required}"
  >${createOptions(options)}</select>
  <em></em>`
}

/**
 * Cria campos de formulário do tipo `Múltipla Seleção` (input[type=checkbox])
 * @param {String} required - valores "S"/"N" utilizados pelo Orquestra
 * @param {String} placeholder - propriedade html placeholder
 * @param {String} id - xname, id textual do campo
 * @param {String[]} options - `options` do campo
 * @param {String} mask - pattern de máscara
 * @param {String} label - propriedade html label
 * @param {String|Number} codField - id numérico do campo
 * @param {String} autocomplete valores "on"/"off" nativos do html
 * @returns {String} campo do tipo `Múltipla Seleção`
 */
function getCheckbox (...config) {
  const params = {
    ...resolveParams(config),
    type: 'checkbox'
  }

  const { options } = params

  return `${generateInputCollection(params, options)}<em></em>`
}

/**
 * Cria campos de formulário do tipo `Múltipla Escolha` (input[type=radio])
 * @param {String} required - valores "S"/"N" utilizados pelo Orquestra
 * @param {String} placeholder - propriedade html placeholder
 * @param {String} id - xname, id textual do campo
 * @param {String[]} options - `options` do campo
 * @param {String} mask - pattern de máscara
 * @param {String} label - propriedade html label
 * @param {String|Number} codField - id numérico do campo
 * @param {String} autocomplete valores "on"/"off" nativos do html
 * @returns {String} campo do tipo `Múltipla Escolha`
 */
function getRadio (...config) {
  const params = {
    ...resolveParams(config),
    type: 'radio'
  }

  const { options } = params

  return `${generateInputCollection(params, options)}<em></em>`
}

/**
 * Cria label de um campo de formulário
 * @param {String} value - label do campo
 * @param {String} id - xname, id textual do campo
 * @param {String} xtype - tipo de campo Orquestra
 * @param {String|Number} codField - id numérico do campo
 *
 * @param {String} required - valores "S"/"N" utilizados pelo Orquestra
 * @param {String} placeholder - propriedade html placeholder
 * @param {String[]} options - `options` do campo
 * @param {String} mask - pattern de máscara
 * @param {String} label - propriedade html label
 * @param {String} autocomplete valores "on"/"off" nativos do html
 *
 * @returns {String} campo no formato somente leitura
 */
function getReadonly (value, id, xtype = 'TEXT', codfield) {
  const defaultProps = getFieldDefaultProps()

  value = value || chance.word({ syllables: 5 })
  id = id || defaultProps.id
  xtype = (xtype).toString().toUpperCase() || 'TEXT'
  codfield = codfield || defaultProps.codField

  return `
    <div
      xid="div${id}"
      id="div${codfield}"
      style="display:inline"
      xtype="">${value}</div>
    <input
      type="hidden"
      name="inp${codfield}"
      xname="inp${id}"
      value="${value}"
      data-fieldformat="${xtype}">
  `
}

/**
 * Cria label de um campo de formulário
 * @param {String} label - label do campo
 * @returns {String} label do campo
 */
function getLabel (label) {
  return label || chance.word({ syllables: 5 })
}

// 🔑 Construtores Públicos
exports.Field = {
  text: getInputText,
  date: getInputDate,
  textarea: getTextarea,
  select: getSelect,
  checkbox: getCheckbox,
  radio: getRadio,
  readonly: getReadonly,
  label: getLabel
}

// 🌟 Campos Gerados Automaticamente
exports.Campo = {
  text: getInputText(),
  date: getInputDate(),
  textarea: getTextarea(),
  select: getSelect(),
  checkbox: getCheckbox(),
  radio: getRadio(),
  readonly: getReadonly()
}

// 🌟 Label Gerado Automaticamente
exports.Label = {
  random: getLabel()
}
