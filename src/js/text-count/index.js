import {
  NAME,
  FIELD,
  CSS_CLASSES
} from './constants'

import { resolveReference } from '../base/resolve-reference'
import { resolveInstance } from '../base/resolve-instance'
import { resolveOrquestraField } from '../base/resolve-field'

export function TextCount (reference, props = {}) {
  const container = resolveReference(reference, {
    name: NAME,
    root: props.root
  })

  return resolveInstance({
    reference: container,
    factory: TextCountFactory
  })
}

function TextCountFactory (container) {
  const state = {
    writing: null,
    full: false
  }

  const instance = {
    container,
    controller: null,
    enable,
    disable,
    value,
    destroy,
    updateMax
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
      errorMsg: `[${NAME}]: nenhum campo Orquestra encontrado`
    })

    if (!field) return

    instance.controller = field

    createCounter()
    addTriggers()
  }

  function unmount () {
    instance.controller.removeEventListener('input', onControllerChange)
    instance.controller.style.removeProperty('display')
    instance.textCount.remove()

    delete instance.container[`_${NAME}`]

    for (const propertyName of Object.getOwnPropertyNames(instance)) {
      instance[propertyName] = null
    }
  }

  function createCounter () {
    const counterContainer = document.createElement('div')
    counterContainer.classList.add(CSS_CLASSES.CTRL_CLASS)
    counterContainer.innerText = `${instance.controller.textLength}/${instance.controller.maxLength}`
    container.insertAdjacentElement('beforeend', counterContainer)
    instance.textCount = counterContainer
  }

  function addTriggers () {
    instance.controller.addEventListener('input', onControllerChange)
  }

  function onControllerChange () {
    updateCounter()
  }

  function updateCounter () {
    instance.textCount.innerText = `${instance.controller.textLength}/${instance.controller.maxLength}`
    if (isFieldFull()) {
      instance.textCount.classList.add(CSS_CLASSES.COUNTER_FULL)
    } else {
      instance.textCount.classList.remove(CSS_CLASSES.COUNTER_FULL)
    }
  }

  function isFieldFull () {
    return instance.controller.textLength === instance.controller.maxLength
  }

  function updateMax (newMax) {
    instance.controller.maxLength = newMax
  }

  // ---------------------------------
  // 🔑 Métodos Públicos
  // ---------------------------------

  function setEnabled () {
    state.disabled = false
    instance.switch.classList.remove(CSS_CLASSES.DISABLED_CLASS)
  }

  function setDisabled () {
    state.disabled = true
    instance.switch.classList.add(CSS_CLASSES.DISABLED_CLASS)
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
