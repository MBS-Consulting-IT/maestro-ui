import {
  NAME,
  FIELD,
  CSS_CLASSES
} from './constants'

import { resolveReference } from '../base/resolve-reference'
import { resolveInstance } from '../base/resolve-instance'
import { resolveOrquestraField } from '../base/resolve-field'

export function RadioCard (reference, props = {}) {
  const container = resolveReference(reference, {
    name: NAME,
    root: props.root
  })

  return resolveInstance({
    props,
    reference: container,
    factory: RadioCardFactory
  })
}

function RadioCardFactory (container, props) {
  const state = {
    value: null,
    disabled: false
  }

  const instance = {
    container,
    radios: null,
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
    const fields = resolveOrquestraField({
      container: instance.container,
      editable: FIELD.EDITABLE,
      readonly: FIELD.READONLY,
      errorMsg: `[${NAME}]: nenhum campo Orquestra do tipo input radio encontrado`
    })

    if (!fields) return

    instance.radios = fields

    createRadioCard()
    setValue()
    addTriggers()
  }

  function unmount () {
    instance.radios.forEach(radio =>
      radio.removeEventListener('change', setValue)
    )

    delete instance.container[`_${NAME}`]

    for (const propertyName of Object.getOwnPropertyNames(instance)) {
      instance[propertyName] = null
    }
  }

  function createRadioCard () {
    const radioMarker = `<div class="${CSS_CLASSES.RADIO_MARKER_CLASS}"></div>`

    instance.radios.forEach(radio => {
      const label = radio.closest('label')
      const option = radio.value
      const textNode = radio.nextSibling
      const radioText = textNode.textContent

      const radioHelp = getRadioElementByOption({
        option,
        dataProp: 'help',
        container: instance.container
      })

      const radioIcon = getRadioElementByOption({
        option,
        dataProp: 'icon',
        container: instance.container
      })

      textNode.remove()
      label.classList.add(CSS_CLASSES.RADIO_CLASS)

      if (radioHelp) radio.insertAdjacentElement('afterend', radioHelp)

      radio.insertAdjacentHTML('afterend', `<span>${radioText}</span>`)

      if (radioIcon) radio.insertAdjacentElement('afterend', radioIcon)

      radio.insertAdjacentHTML('afterend', radioMarker)
    })
  }

  function addTriggers () {
    instance.radios.forEach(radio =>
      radio.addEventListener('change', setValue)
    )
  }

  function getValue () {
    return instance.radios
      .find(radio => radio.checked)?.value
  }

  function setValue () {
    state.value = getValue()
  }

  function resetValue () {
    instance.radios
      .forEach(radio => {
        radio.checked = false
      })
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

  function getRadioElementByOption ({ container, dataProp, option }) {
    const partial = container
      .querySelector(`[data-radio-${dataProp}="${option}"]`)

    if (!partial) return null

    const partialClone = partial.cloneNode(true)

    partialClone.removeAttribute('data-radio-help')
    partial.remove()

    return partialClone
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
