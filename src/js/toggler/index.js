import {
  NAME,
  CSS_CLASSES
} from './constants'

import { resolveReference } from '../base/resolve-reference'
import { resolveInstance } from '../base/resolve-instance'

export function Toggler (reference, props = {}) {
  const trigger = resolveReference(reference, {
    name: NAME,
    root: props.root
  })

  return resolveInstance({
    props,
    reference: trigger,
    factory: TogglerFactory
  })
}

function TogglerFactory (trigger, props) {
  /**
   * @todo
   * Implement custom events:
   * `toggler:<event>`
   * eg.
   * toggler:show
   * toggler:hide
   * toggler:change
   */

  const instance = {
    trigger,
    content: null,
    toggle,
    show,
    hide,
    destroy
  }

  mount()

  trigger[`_${NAME}`] = instance

  return instance

  // ---------------------------------
  // 🔒 Métodos Privados
  // ---------------------------------

  function mount () {
    instance.content = props.content.length
      ? [...props.content]
      : [props.content]

    createToggler()
    addTriggers()
  }

  function unmount () {
    instance.trigger.removeEventListener('click', onClick)
    instance.trigger.removeEventListener('click', onKeydown)

    delete instance.trigger[`_${NAME}`]

    for (const propertyName of Object.getOwnPropertyNames(instance)) {
      instance[propertyName] = null
    }
  }

  function createToggler () {
    instance.trigger.setAttribute('tabIndex', '0')
  }

  function addTriggers () {
    instance.trigger.addEventListener('click', onClick)
    instance.trigger.addEventListener('keydown', onKeydown)
  }

  function onClick () {
    toggle()
  }

  function onKeydown (event) {
    if (event.code !== 'Space') return

    event.preventDefault()
    toggle()
  }

  // ---------------------------------
  // 🔑 Métodos Públicos
  // ---------------------------------

  function toggle () {
    instance.content.forEach(ref =>
      ref.classList.toggle(CSS_CLASSES.OPEN_CLASS)
    )
  }

  function show () {
    instance.content.forEach(ref =>
      ref.classList.add(CSS_CLASSES.OPEN_CLASS)
    )
  }

  function hide () {
    instance.content.forEach(ref =>
      ref.classList.remove(CSS_CLASSES.OPEN_CLASS)
    )
  }

  function destroy () {
    unmount()
  }
}
