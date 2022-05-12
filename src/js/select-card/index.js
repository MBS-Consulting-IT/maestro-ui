import {
  NAME,
  FIELD,
  CSS_CLASSES
} from './constants'

import { resolveReference } from '../base/resolve-reference'
import { resolveInstance } from '../base/resolve-instance'
import { resolveOrquestraField } from '../base/resolve-field'

export function SelectCard (reference, props = {}) {
  const container = resolveReference(reference, {
    name: NAME,
    root: props.root
  })

  return resolveInstance({
    props,
    reference: container,
    factory: SelectCardFactory
  })
}

function SelectCardFactory (container, props) {
  const state = {
    value: null,
    disabled: false
  }

  const instance = {
    container,
    fieldId: null,
    radios: null,
    select: null,
    reset,
    disable,
    enable,
    value,
    destroy
  }

  try {
    mount()
  } catch (error) {
    return console.warn(error)
  }

  container[`_${NAME}`] = instance

  return instance

  // ---------------------------------
  // 🔒 Métodos Privados
  // ---------------------------------

  function mount () {
    const field = resolveOrquestraField({
      container: instance.container,
      editable: FIELD.EDITABLE,
      readonly: FIELD.READONLY,
      errorMsg: `[${NAME}]: nenhum campo Orquestra do tipo input radio encontrado`
    })

    if (!field) return

    instance.select = field
    instance.fieldId = field.getAttribute('xname').substring(3)

    createSelectCard()

    instance.radios = [
      ...instance.container
        .querySelectorAll(`input[name=${instance.fieldId}]`)
    ]

    setInitialValue()
    addTriggers()

    // Forçar change para verificação de fontes de dados mapeadas ao campo
    // É preciso agendar com `setTimeout` para o Zeev detectar o evento
    setTimeout(() => {
      instance.select.dispatchEvent(new Event('change'))
    }, 0)
  }

  function unmount () {
    instance.radios.forEach(radio =>
      radio.remove()
    )

    instance.select.removeAttribute('style')

    delete instance.container[`_${NAME}`]

    for (const propertyName of Object.getOwnPropertyNames(instance)) {
      instance[propertyName] = null
    }
  }

  function createSelectCard () {
    const radioMarker = `<div class="${CSS_CLASSES.RADIO_MARKER_CLASS}"></div>`
    const radioCards = [...instance.select.options]
      .filter(({ value }) => !!value)
      .map((option, index) => {
        const { value, textContent } = option

        const cardHelp = retrieveComplementByOption({
          option: value,
          dataProp: 'help',
          container: instance.container
        })

        const cardIcon = retrieveComplementByOption({
          option,
          dataProp: 'icon',
          container: instance.container
        })

        return `
        <label for="${instance.fieldId}-${index}" class="radio ${CSS_CLASSES.RADIO_CLASS}">
          <input
            name="${instance.fieldId}"
            type="radio"
            id="${instance.fieldId}-${index}"
            value="${value}"
          >
          ${radioMarker}
          ${cardIcon}
          <span>${textContent}</span>
          ${cardHelp}
        </label>
      `
      }).join('')

    instance.container.insertAdjacentHTML(
      'afterbegin',
      radioCards
    )

    instance.select.style.display = 'none'
  }

  function addTriggers () {
    instance.radios.forEach(radio =>
      radio.addEventListener('change', setValue)
    )
  }

  function getValue () {
    return instance.radios
      .find(radio => radio.checked)?.value || ''
  }

  function setInitialValue () {
    state.value = instance.select.value

    if (!state.value) return

    const radioToSelect = instance.radios
      .find(radio => radio.value === state.value)

    radioToSelect.checked = true
  }

  function setValue () {
    state.value = getValue()
    instance.select.value = state.value
    instance.select.dispatchEvent(new Event('change'))
  }

  function resetValue () {
    instance.radios
      .forEach(radio => {
        radio.checked = false
      })

    instance.select.value = ''
    state.value = ''
  }

  function setEnabled () {
    state.disabled = false

    instance.radios
      .forEach(radio => {
        radio.disabled = false
      })
  }

  function setDisabled () {
    state.disabled = true

    instance.radios
      .forEach(radio => {
        radio.disabled = true
      })
  }

  function retrieveComplementByOption ({ container, dataProp, option }) {
    const partial = container
      .querySelector(`[data-radio-${dataProp}="${option}"]`)

    if (!partial) return ''

    partial.removeAttribute('data-radio-help')

    const markup = partial.outerHTML

    partial.remove()

    return markup
  }

  // ---------------------------------
  // 🔑 Métodos Públicos
  // ---------------------------------

  function reset () {
    resetValue()
  }

  function disable () {
    setDisabled()
  }

  function enable () {
    setEnabled()
  }

  function value () {
    return state.value
  }

  function destroy () {
    unmount()
  }
}
