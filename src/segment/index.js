import {
  NAME,
  FIELD,
  CSS_CLASSES,
  POSITION
} from './constants'

import { resolveReference } from '../_base/resolve-reference'
import { resolveInstance } from '../_base/resolve-instance'
import { resolveOrquestraField } from '../_base/resolve-field'

export function Segment (reference, props = {}) {
  const container = resolveReference(reference, {
    name: NAME,
    root: props.root
  })

  return resolveInstance({
    props,
    reference: container,
    factory: SegmentFactory
  })
}

function SegmentFactory (container, props) {
  const state = {
    value: null,
    disabled: false
  }

  const instance = {
    container,
    controller: null,
    segmentGroup: null,
    segmentSelection: null,
    segments: null,
    select,
    reset,
    next,
    previous,
    disable,
    enable,
    value,
    destroy
  }

  const movements = {
    ArrowLeft: moveLeft,
    ArrowRight: moveRight
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
    state.value = instance.controller.value

    createSegment()
    addTriggers()

    if (!state.value && !props.nullable) {
      setOption(instance.controller[1].value)
    }

    setTransition()
  }

  function unmount () {
    instance.controller.removeEventListener('change', onControllerChange)
    instance.controller.style.removeProperty('display')
    instance.segmentGroup.remove()

    delete instance.container[`_${NAME}`]

    for (const propertyName of Object.getOwnPropertyNames(instance)) {
      instance[propertyName] = null
    }
  }

  function createSegment () {
    const segmentGroup = document.createElement('div')
    const segmentSelection = document.createElement('div')
    const segments = [...instance.controller.querySelectorAll('option')]
      .filter(option => !!option.value)
      .map(option => {
        const segment = document.createElement('label')

        segment.classList.add(CSS_CLASSES.LABEL_CLASS)
        segment.dataset.option = option.value
        segment.textContent = option.textContent

        return segment
      })

    segmentGroup.setAttribute('tabIndex', '0')
    segmentGroup.appendChild(segmentSelection)
    segmentGroup.classList.add(CSS_CLASSES.GROUP_CLASS)
    segmentSelection.classList.add(CSS_CLASSES.SELECTION_CLASS)
    segments.forEach(segment => segmentGroup.appendChild(segment))

    // ⚠️ inserir `segmentGroup` ao DOM antes de calcular o tamanho
    container.insertAdjacentElement('beforeend', segmentGroup)

    instance.controller.style.display = 'none'
    instance.segmentGroup = segmentGroup
    instance.segments = segments
    instance.segmentSelection = segmentSelection
    instance.segmentSelection.style.width = `${getSegmentSelectionWidth()}px`
  }

  function addTriggers () {
    const SegmentObserver = new ResizeObserver(resizeSelection)

    SegmentObserver.observe(instance.segmentGroup)

    instance.segments.forEach(segment =>
      segment.addEventListener('click', onClick)
    )
    instance.segmentGroup.addEventListener('keydown', onKeydown)
    instance.controller.addEventListener('change', onControllerChange)
  }

  function onClick () {
    const value = this.dataset.option
    const isCurrent = state.value === value

    if (state.disabled || isCurrent || !value) return

    setOption(value)
  }

  function onKeydown (event) {
    if (state.disabled || !movements[event.key]) return

    event.preventDefault()
    movements[event.key](instance.controller.selectedIndex)
  }

  function onControllerChange () {
    updateState(this.value)
  }

  function setOption (value) {
    const segment = getSegmentByValue(value)

    if (!segment) return resetOption()

    resetActiveClass()

    segment.classList.add(CSS_CLASSES.ACTIVE_CLASS)
    instance.controller.value = value
    instance.controller.dispatchEvent(new Event('change'))
    state.value = value

    moveTo(instance.controller.selectedIndex)
  }

  function updateState (value) {
    const segment = getSegmentByValue(value)

    if (!segment) return resetOption()

    resetActiveClass()

    segment.classList.add(CSS_CLASSES.ACTIVE_CLASS)
    state.value = value

    moveTo(instance.controller.selectedIndex)
  }

  function moveLeft () {
    const currentIndex = instance.controller.selectedIndex
    const previousIndex = Math.max(currentIndex - 1, 1)
    const value = instance.controller[previousIndex].value

    if (currentIndex === previousIndex) return

    setOption(value)
  }

  function moveRight () {
    const currentIndex = instance.controller.selectedIndex
    const maxIndex = instance.controller.length - 1
    const nextIndex = Math.min(currentIndex + 1, maxIndex)
    const value = instance.controller[nextIndex].value

    if (currentIndex === nextIndex) return

    setOption(value)
  }

  function moveTo (index) {
    const position = getSegmentSelectionPosition(index)

    if (position) {
      instance.segmentSelection.style.transform = `translateX(${position}px)`
      instance.segmentSelection.style.opacity = 1
    } else {
      resetOption()
    }
  }

  function setEnabled () {
    state.disabled = false
    instance.segmentGroup.classList.remove(CSS_CLASSES.DISABLED_CLASS)
  }

  function setDisabled () {
    state.disabled = true
    instance.segmentGroup.classList.add(CSS_CLASSES.DISABLED_CLASS)
  }

  function setTransition () {
    instance.segmentSelection.classList.add(CSS_CLASSES.ANIMATED_CLASS)
  }

  function resizeSelection () {
    const position = getSegmentSelectionPosition(instance.controller.selectedIndex)

    instance.segmentSelection.style.transform = `translateX(${position}px)`
    instance.segmentSelection.style.width = `${getSegmentSelectionWidth()}px`
  }

  function resetOption () {
    state.value = ''
    instance.controller.value = ''
    instance.segmentSelection.style.removeProperty('transform')
    instance.segmentSelection.style.opacity = 0

    resetActiveClass()
  }

  function resetActiveClass () {
    instance.segments.forEach(segment =>
      segment.classList.remove(CSS_CLASSES.ACTIVE_CLASS)
    )
  }

  function getSegmentByValue (value) {
    return instance.segments
      .find(segment => segment.dataset.option === value)
  }

  function getSegmentSelectionPosition (index) {
    return index > 0
      ? (getSegmentSelectionWidth() * index + POSITION.padding).toFixed(3)
      : null
  }

  function getSegmentSelectionWidth () {
    const innerWidth = instance.segmentGroup.offsetWidth - POSITION.space * 2
    const selectionWidth = innerWidth / instance.segments.length

    return selectionWidth
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

  function next () {
    moveRight()
  }

  function previous () {
    moveLeft()
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
