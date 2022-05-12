import {
  NAME,
  FIELD,
  CSS_CLASSES
} from './constants'

import { resolveReference } from '../base/resolve-reference'
import { resolveInstance } from '../base/resolve-instance'
import { resolveOrquestraField } from '../base/resolve-field'

export function ButtonRadio (reference, props = {}) {
  const container = resolveReference(reference, {
    name: NAME,
    root: props.root
  })

  return resolveInstance({
    props,
    reference: container,
    factory: ButtonRadioFactory
  })
}

function ButtonRadioFactory (container, props) {
  const state = {
    value: null,
    disabled: false
  }

  const instance = {
    container,
    controller: null,
    buttonGroup: null,
    buttons: null,
    select,
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
      errorMsg: `[${NAME}]: nenhum campo Orquestra do tipo caixa de seleção encontrado`
    })

    if (!field) return

    instance.controller = field
    state.value = instance.controller.value

    createButtonGroup()
    addTriggers()
  }

  function unmount () {
    instance.controller.removeEventListener('change', onControllerChange)
    instance.controller.style.removeProperty('display')
    instance.buttonGroup.remove()

    delete instance.container[`_${NAME}`]

    for (const propertyName of Object.getOwnPropertyNames(instance)) {
      instance[propertyName] = null
    }
  }

  function createButtonGroup () {
    const buttonGroup = document.createElement('div')
    const buttons = [...instance.controller.querySelectorAll('option')]
      .filter(option => !!option.value)
      .map(option => {
        const button = document.createElement('button')

        button.classList.add(...CSS_CLASSES.BTN_CLASSES)
        button.dataset.option = option.value
        button.textContent = option.textContent
        button.type = 'button'

        return button
      })

    buttonGroup.classList.add(CSS_CLASSES.GROUP_CLASS)
    buttons.forEach(button => buttonGroup.appendChild(button))
    container.insertAdjacentElement('beforeend', buttonGroup)

    instance.controller.style.display = 'none'
    instance.buttonGroup = buttonGroup
    instance.buttons = buttons
  }

  function addTriggers () {
    instance.buttons.forEach(button =>
      button.addEventListener('click', onClick)
    )

    instance.controller
      .addEventListener('change', onControllerChange)
  }

  function onClick (event) {
    const value = this.dataset.option
    const isCurrent = state.value === value

    event.preventDefault()

    if (state.disabled || isCurrent || !value) return

    setOption(value)
  }

  function onControllerChange () {
    setOption(this.value, { silent: true })
  }

  function setOption (value, { silent } = {}) {
    const button = getButtonByValue(value)

    if (!button) return resetOption()

    resetActiveClass()

    button.classList.add(CSS_CLASSES.ACTIVE_CLASS)
    state.value = value

    if (silent) return

    instance.controller.value = value
    instance.controller.dispatchEvent(new Event('change'))
  }

  function getButtonByValue (value) {
    return instance.buttons
      .find(button => button.dataset.option === value)
  }

  function resetOption () {
    state.value = ''
    instance.controller.value = ''

    resetActiveClass()
  }

  function resetActiveClass () {
    instance.buttons.forEach(button =>
      button.classList.remove(CSS_CLASSES.ACTIVE_CLASS)
    )
  }

  function setEnabled () {
    state.disabled = false
    instance.buttonGroup.classList.remove(CSS_CLASSES.DISABLED_CLASS)
  }

  function setDisabled () {
    state.disabled = true
    instance.buttonGroup.classList.add(CSS_CLASSES.DISABLED_CLASS)
  }

  // ---------------------------------
  // 🔑 Métodos Públicos
  // ---------------------------------

  function select (value) {
    setOption(value)
  }

  function reset () {
    resetOption()
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
