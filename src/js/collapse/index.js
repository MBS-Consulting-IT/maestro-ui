import {
  NAME,
  CSS_CLASSES
} from './constants'

import { resolveReference } from '../base/resolve-reference'
import { resolveInstance } from '../base/resolve-instance'

export function Collapse (reference, props = {}) {
  const container = resolveReference(reference, {
    name: NAME,
    root: props.root
  })

  return resolveInstance({
    reference: container,
    factory: CollapseFactory
  })
}

function CollapseFactory (container) {
  const state = {
    current: []
  }

  /**
   * @todo
   * Implement accordion mode
   * Implement custom events:
   * `collapse:<event>`
   * eg.
   * collapse:show
   * collapse:hide
   * collapse:change
   */

  const instance = {
    container,
    items: [],
    toggle,
    show,
    hide,
    disable,
    enable,
    destroy
  }

  mount()

  container[`_${NAME}`] = instance

  return instance

  // ---------------------------------
  // 🔒 Métodos Privados
  // ---------------------------------

  function mount () {
    createCollapse()
    addTriggers()
  }

  function unmount () {
    instance.items.forEach(item => {
      const itemHeader = getCollapseHeader(item)

      if (!itemHeader) return

      itemHeader.removeEventListener('click', onClick)
      itemHeader.removeEventListener('click', onKeydown)
    })

    delete instance.container[`_${NAME}`]

    for (const propertyName of Object.getOwnPropertyNames(instance)) {
      instance[propertyName] = null
    }
  }

  function createCollapse () {
    instance.items = [...instance.container.querySelectorAll(`.${CSS_CLASSES.ITEM_CLASS}`)]

    instance.items.forEach(item => {
      const itemHeader = getCollapseHeader(item)

      if (!itemHeader) return

      itemHeader.setAttribute('tabIndex', '0')
    })
  }

  function addTriggers () {
    instance.items.forEach(item => {
      const itemHeader = getCollapseHeader(item)

      if (!itemHeader) return

      itemHeader.addEventListener('click', onClick)
      itemHeader.addEventListener('keydown', onKeydown)
    })
  }

  function onClick (event) {
    const collapse = getCollapseContainer(event.srcElement)

    if (isDisabled(collapse)) return

    toggleCollapse(collapse)
  }

  function onKeydown (event) {
    const collapse = getCollapseContainer(event.srcElement)

    if (isDisabled(collapse) || event.code !== 'Space') return

    event.preventDefault()

    toggleCollapse(collapse)
  }

  function toggleCollapse (collapse) {
    collapse.classList.toggle(CSS_CLASSES.ACTIVE_CLASS)

    updateCurrent()
  }

  function showCollapse (collapse) {
    collapse.classList.add(CSS_CLASSES.ACTIVE_CLASS)

    updateCurrent()
  }

  function hideCollapse (collapse) {
    collapse.classList.remove(CSS_CLASSES.ACTIVE_CLASS)

    updateCurrent()
  }

  function setEnabled (collapse) {
    collapse.classList.remove(CSS_CLASSES.DISABLED_CLASS)
  }

  function setDisabled (collapse) {
    collapse.classList.add(CSS_CLASSES.DISABLED_CLASS)

    hideCollapse(collapse)
  }

  function updateCurrent () {
    state.current = instance.items.filter(item =>
      isActive(item)
    )
  }

  function isDisabled (collapse) {
    return collapse.classList.contains(CSS_CLASSES.DISABLED_CLASS)
  }

  function isActive (collapse) {
    return collapse.classList.contains(CSS_CLASSES.ACTIVE_CLASS)
  }

  function getCollapseContainer (innerElement) {
    return innerElement.closest(`.${CSS_CLASSES.ITEM_CLASS}`)
  }

  function getCollapseHeader (collapse) {
    return collapse.querySelector(`.${CSS_CLASSES.ITEM_HEADER_CLASS}`)
  }

  function getItemByIndex (index) {
    const item = instance.items[index]

    if (!item) console.warn(`[${NAME}]: item não encontrado para o índice ${index}`)

    return item
  }

  function resolveAction (index, callback) {
    const item = getItemByIndex(index)

    if (!item) return

    callback(item)
  }

  // ---------------------------------
  // 🔑 Métodos Públicos
  // ---------------------------------

  function toggle (index) {
    resolveAction(index, toggleCollapse)
  }

  function show (index) {
    resolveAction(index, showCollapse)
  }

  function hide (index) {
    resolveAction(index, hideCollapse)
  }

  function disable (index) {
    resolveAction(index, setDisabled)
  }

  function enable (index) {
    resolveAction(index, setEnabled)
  }

  function destroy () {
    unmount()
  }
}
