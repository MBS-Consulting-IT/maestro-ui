import {
  NAME,
  FIELD,
  CSS_CLASSES
} from './constants'

import { resolveReference } from '../base/resolve-reference'
import { resolveInstance } from '../base/resolve-instance'
import { resolveOrquestraField } from '../base/resolve-field'

export function Switch (reference, props = {}) {
  const container = resolveReference(reference, {
    name: NAME,
    root: props.root
  })

  return resolveInstance({
    reference: container,
    factory: SwitchFactory
  })
}

function SwitchFactory (container) {
  const state = {
    active: null,
    value: null,
    disabled: false
  }

  const instance = {
    container,
    controller: null,
    switch: null,
    check,
    uncheck,
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

  if (!instance.controller) return

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
    state.active = isFieldActive()
    state.value = getFieldValueByState()

    createSwitch()
    addTriggers()
  }

  function unmount () {
    instance.controller.removeEventListener('change', onControllerChange)
    instance.controller.style.removeProperty('display')
    instance.switch.remove()

    delete instance.container[`_${NAME}`]

    for (const propertyName of Object.getOwnPropertyNames(instance)) {
      instance[propertyName] = null
    }
  }

  function createSwitch () {
    const switchContainer = document.createElement('div')
    const switchInner = document.createElement('div')
    const switchLabel = document.createElement('label')

    switchContainer.classList.add(CSS_CLASSES.CTRL_CLASS)
    switchContainer.setAttribute('tabIndex', '0')
    switchInner.classList.add(CSS_CLASSES.INNER_CLASS)
    switchLabel.classList.add(CSS_CLASSES.LABEL_CLASS)
    switchLabel.textContent = instance.controller[1].value

    if (state.active) switchContainer.classList.add(CSS_CLASSES.ACTIVE_CLASS)

    switchContainer.appendChild(switchInner)
    switchContainer.appendChild(switchLabel)

    container.insertAdjacentElement('beforeend', switchContainer)

    instance.switch = switchContainer
    instance.controller.style.display = 'none'
  }

  function addTriggers () {
    instance.switch.addEventListener('click', onClick)
    instance.switch.addEventListener('keypress', onKeypress)
    instance.controller.addEventListener('change', onControllerChange)
  }

  function onClick () {
    if (state.disabled) return

    toggleState()
  }

  function onKeypress (event) {
    if (state.disabled || event.code !== 'Space') return

    event.preventDefault()
    toggleState()
  }

  function onControllerChange () {
    updateState()
  }

  function toggleState () {
    state.active = !isFieldActive()
    state.value = getFieldValueByState()

    instance.controller.value = state.value
    instance.controller.dispatchEvent(new Event('change'))

    toggleActiveClass()
  }

  function updateState () {
    state.active = isFieldActive()
    state.value = getFieldValueByState()

    toggleActiveClass()
  }

  function setEnabled () {
    state.disabled = false
    instance.switch.classList.remove(CSS_CLASSES.DISABLED_CLASS)
  }

  function setDisabled () {
    state.disabled = true
    instance.switch.classList.add(CSS_CLASSES.DISABLED_CLASS)
  }

  function toggleActiveClass () {
    state.active
      ? instance.switch.classList.add(CSS_CLASSES.ACTIVE_CLASS)
      : instance.switch.classList.remove(CSS_CLASSES.ACTIVE_CLASS)
  }

  function getFieldValueByState () {
    const currentOptionIndex = state.active ? 1 : 0
    return instance.controller[currentOptionIndex].value
  }

  function isFieldActive () {
    return !!instance.controller?.value
  }

  // ---------------------------------
  // 🔑 Métodos Públicos
  // ---------------------------------

  function check () {
    instance.controller.value = instance.controller[1].value
    updateState()
  }

  function uncheck () {
    instance.controller.value = instance.controller[0].value
    updateState()
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
