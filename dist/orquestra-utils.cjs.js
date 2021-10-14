'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const PADDING_IN_PIXELS = 3;
const BORDER_IN_PIXELS = 1;

const NAME$1 = 'Segment';

const FIELD$1 = {
  EDITABLE: 'select[xname]',
  READONLY: 'input[type=hidden][xname]',
  TEXT: 'div[xid]'
};

const CSS_CLASSES$1 = {
  GROUP_CLASS: 'o-segments',
  LABEL_CLASS: 'o-segment',
  SELECTION_CLASS: 'o-segment-selection',
  ACTIVE_CLASS: '-active',
  DISABLED_CLASS: '-disabled',
  ANIMATED_CLASS: '-animated'
};

const POSITION = {
  space: PADDING_IN_PIXELS + BORDER_IN_PIXELS,
  padding: PADDING_IN_PIXELS
};

function resolveReference (reference, { name, root }) {
  root = root || document;

  /**
   * @type { HTMLElement }
   * @example `document.querySelector('div')`
   */
  if (reference instanceof HTMLElement) {
    return reference
  }

  /**
   * @type { HTMLCollection, NodeList }
   * @example
   *  - HTMLCollection: `document.getElementsByClassName('myClass')`
   *  - NodeList: `document.querySelectorAll('div')`
   */
  if (
    reference instanceof HTMLCollection ||
    reference instanceof NodeList
  ) {
    return [...reference]
  }

  /**
   * @type { HTMLElement[] }
   * @example `[document.querySelector('#a'), document.querySelector('#b')]`
   */
  if (Array.isArray(reference)) {
    if (!reference.length) return null

    return reference.filter(element => {
      const isHtmlElement = element instanceof HTMLElement;

      if (!isHtmlElement) console.warn(`[${name}]: não foi possível incluir o seguinte elemento no construtor: ${element}`);

      return isHtmlElement
    })
  }

  /**
   * @type { String } - QuerySelector
   * @example `div > .class`
   */
  if (typeof reference === 'string') {
    try {
      root.querySelectorAll(reference);
    } catch (error) {
      return console.warn(`[${name}]: ${reference} não é um seletor válido`)
    }

    const elements = [...root.querySelectorAll(reference)];

    if (!elements.length) return console.warn(`[${name}]: nenhum elemento encontrado para o seletor ${reference}`)

    return elements
  }

  return console.warn(`[${name}]: referência desconhecida. O construtor somente pode ser inicializado com QueryStrings (seletores CSS), HTMLElement, HTMLCollection, NodeList ou array de HTMLElements`)
}

/**
 * Utilitário para resolução de instâncias conforme o tipo de referência
 * Quando a referência for somente um elemento é retornado uma única instância,
 * caso contrário é retornado um array de instâncias para cada elemento.
 *
 * @param {HTMLElement|Array} config.reference - referência(s) do componente
 * @param {Object} config.props - propriedades de configuração do componente
 * @param {Function} config.factory - factory de construção do componente
 * @returns {Object[]|Object} instância(s) de componentes
 */
function resolveInstance ({ reference, props, factory }) {
  if (!reference) return

  if (reference instanceof HTMLElement) {
    return factory(reference, props)
  }

  return reference
    .map(element => factory(element, props))
    .filter(instance => !!instance)
}

/**
 * Busca por um campo do Orquestra nos formatos `editável`
 * e `vísivel` (input hidden)
 * @param {HTMLElement} config.container - container para busca do campo
 * @param {String} config.editable - queryString para o campo editável
 * @param {String} config.readonly - queryString para o campo visível
 * @param {String} config.errorMsg - mensagem de erro quando campo não encontrado
 * @returns {HTMLElement} campo Orquestra
 */
function resolveOrquestraField ({ container, editable, readonly, errorMsg }) {
  const field = container.querySelector(editable);
  const fieldReadonly = container.querySelector(readonly);

  if (!field && !fieldReadonly) {
    throw new Error(errorMsg)
  }

  if (!field && fieldReadonly) return

  return field
}

function Segment (reference, props = {}) {
  const container = resolveReference(reference, {
    name: NAME$1,
    root: props.root
  });

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
  };

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
  };

  const movements = {
    ArrowLeft: moveLeft,
    ArrowRight: moveRight
  };

  try {
    mount();
  } catch (error) {
    return console.warn(error)
  }

  if (!instance.controller) return

  container[`_${NAME$1}`] = instance;

  return instance

  // ---------------------------------
  // 🔒 Métodos Privados
  // ---------------------------------

  function mount () {
    const field = resolveOrquestraField({
      container: instance.container,
      editable: FIELD$1.EDITABLE,
      readonly: FIELD$1.READONLY,
      errorMsg: `[${NAME$1}]: nenhum campo Orquestra do tipo caixa de seleção encontrado`
    });

    if (!field) return

    instance.controller = field;
    state.value = instance.controller.value;

    createSegment();
    addTriggers();

    if (!state.value && !props.nullable) {
      setOption(instance.controller[1].value);
    }

    setTransition();
  }

  function unmount () {
    instance.controller.removeEventListener('change', onControllerChange);
    instance.controller.style.removeProperty('display');
    instance.segmentGroup.remove();

    delete instance.container[`_${NAME$1}`];

    for (const propertyName of Object.getOwnPropertyNames(instance)) {
      instance[propertyName] = null;
    }
  }

  function createSegment () {
    const segmentGroup = document.createElement('div');
    const segmentSelection = document.createElement('div');
    const segments = [...instance.controller.querySelectorAll('option')]
      .filter(option => !!option.value)
      .map(option => {
        const segment = document.createElement('label');

        segment.classList.add(CSS_CLASSES$1.LABEL_CLASS);
        segment.dataset.option = option.value;
        segment.textContent = option.textContent;

        return segment
      });

    segmentGroup.setAttribute('tabIndex', '0');
    segmentGroup.appendChild(segmentSelection);
    segmentGroup.classList.add(CSS_CLASSES$1.GROUP_CLASS);
    segmentSelection.classList.add(CSS_CLASSES$1.SELECTION_CLASS);
    segments.forEach(segment => segmentGroup.appendChild(segment));

    // ⚠️ inserir `segmentGroup` ao DOM antes de calcular o tamanho
    container.insertAdjacentElement('beforeend', segmentGroup);

    instance.controller.style.display = 'none';
    instance.segmentGroup = segmentGroup;
    instance.segments = segments;
    instance.segmentSelection = segmentSelection;
    instance.segmentSelection.style.width = `${getSegmentSelectionWidth()}px`;
  }

  function addTriggers () {
    const SegmentObserver = new ResizeObserver(resizeSelection);

    SegmentObserver.observe(instance.segmentGroup);

    instance.segments.forEach(segment =>
      segment.addEventListener('click', onClick)
    );
    instance.segmentGroup.addEventListener('keydown', onKeydown);
    instance.controller.addEventListener('change', onControllerChange);
  }

  function onClick () {
    const value = this.dataset.option;
    const isCurrent = state.value === value;

    if (state.disabled || isCurrent || !value) return

    setOption(value);
  }

  function onKeydown (event) {
    if (state.disabled || !movements[event.key]) return

    event.preventDefault();
    movements[event.key](instance.controller.selectedIndex);
  }

  function onControllerChange () {
    updateState(this.value);
  }

  function setOption (value) {
    const segment = getSegmentByValue(value);

    if (!segment) return resetOption()

    resetActiveClass();

    segment.classList.add(CSS_CLASSES$1.ACTIVE_CLASS);
    instance.controller.value = value;
    instance.controller.dispatchEvent(new Event('change'));
    state.value = value;

    moveTo(instance.controller.selectedIndex);
  }

  function updateState (value) {
    const segment = getSegmentByValue(value);

    if (!segment) return resetOption()

    resetActiveClass();

    segment.classList.add(CSS_CLASSES$1.ACTIVE_CLASS);
    state.value = value;

    moveTo(instance.controller.selectedIndex);
  }

  function moveLeft () {
    const currentIndex = instance.controller.selectedIndex;
    const previousIndex = Math.max(currentIndex - 1, 1);
    const value = instance.controller[previousIndex].value;

    if (currentIndex === previousIndex) return

    setOption(value);
  }

  function moveRight () {
    const currentIndex = instance.controller.selectedIndex;
    const maxIndex = instance.controller.length - 1;
    const nextIndex = Math.min(currentIndex + 1, maxIndex);
    const value = instance.controller[nextIndex].value;

    if (currentIndex === nextIndex) return

    setOption(value);
  }

  function moveTo (index) {
    const position = getSegmentSelectionPosition(index);

    if (position) {
      instance.segmentSelection.style.transform = `translateX(${position}px)`;
      instance.segmentSelection.style.opacity = 1;
    } else {
      resetOption();
    }
  }

  function setEnabled () {
    state.disabled = false;
    instance.segmentGroup.classList.remove(CSS_CLASSES$1.DISABLED_CLASS);
  }

  function setDisabled () {
    state.disabled = true;
    instance.segmentGroup.classList.add(CSS_CLASSES$1.DISABLED_CLASS);
  }

  function setTransition () {
    instance.segmentSelection.classList.add(CSS_CLASSES$1.ANIMATED_CLASS);
  }

  function resizeSelection () {
    const position = getSegmentSelectionPosition(instance.controller.selectedIndex);

    instance.segmentSelection.style.transform = `translateX(${position}px)`;
    instance.segmentSelection.style.width = `${getSegmentSelectionWidth()}px`;
  }

  function resetOption () {
    state.value = '';
    instance.controller.value = '';
    instance.segmentSelection.style.removeProperty('transform');
    instance.segmentSelection.style.opacity = 0;

    resetActiveClass();
  }

  function resetActiveClass () {
    instance.segments.forEach(segment =>
      segment.classList.remove(CSS_CLASSES$1.ACTIVE_CLASS)
    );
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
    const innerWidth = instance.segmentGroup.offsetWidth - POSITION.space * 2;
    const selectionWidth = innerWidth / instance.segments.length;

    return selectionWidth
  }

  // ---------------------------------
  // 🔑 Métodos Públicos
  // ---------------------------------

  function select (value) {
    setOption(value);
  }

  function reset () {
    resetOption();
  }

  function next () {
    moveRight();
  }

  function previous () {
    moveLeft();
  }

  function disable () {
    setDisabled();
  }

  function enable () {
    setEnabled();
  }

  function value () {
    return state.value
  }

  function destroy () {
    unmount();
  }
}

const NAME = 'Switch';

const FIELD = {
  EDITABLE: 'select[xname]',
  READONLY: 'input[type=hidden][xname]',
  TEXT: 'div[xid]'
};

const CSS_CLASSES = {
  CTRL_CLASS: 'o-switch',
  INNER_CLASS: 'o-switch-inner',
  LABEL_CLASS: 'o-switch-label',
  ACTIVE_CLASS: '-active',
  DISABLED_CLASS: '-disabled'
};

function Switch (reference, props = {}) {
  const container = resolveReference(reference, {
    name: NAME,
    root: props.root
  });

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
  };

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
  };

  try {
    mount();
  } catch (error) {
    return console.warn(error)
  }

  if (!instance.controller) return

  container[`_${NAME}`] = instance;

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
    });

    if (!field) return

    instance.controller = field;
    state.active = isFieldActive();
    state.value = getFieldValueByState();

    createSwitch();
    addTriggers();
  }

  function unmount () {
    instance.controller.removeEventListener('change', onControllerChange);
    instance.controller.style.removeProperty('display');
    instance.switch.remove();

    delete instance.container[`_${NAME}`];

    for (const propertyName of Object.getOwnPropertyNames(instance)) {
      instance[propertyName] = null;
    }
  }

  function createSwitch () {
    const switchContainer = document.createElement('div');
    const switchInner = document.createElement('div');
    const switchLabel = document.createElement('label');

    switchContainer.classList.add(CSS_CLASSES.CTRL_CLASS);
    switchContainer.setAttribute('tabIndex', '0');
    switchInner.classList.add(CSS_CLASSES.INNER_CLASS);
    switchLabel.classList.add(CSS_CLASSES.LABEL_CLASS);
    switchLabel.textContent = instance.controller[1].value;

    if (state.active) switchContainer.classList.add(CSS_CLASSES.ACTIVE_CLASS);

    switchContainer.appendChild(switchInner);
    switchContainer.appendChild(switchLabel);

    container.insertAdjacentElement('beforeend', switchContainer);

    instance.switch = switchContainer;
    instance.controller.style.display = 'none';
  }

  function addTriggers () {
    instance.switch.addEventListener('click', onClick);
    instance.switch.addEventListener('keypress', onKeypress);
    instance.controller.addEventListener('change', onControllerChange);
  }

  function onClick () {
    if (state.disabled) return

    toggleState();
  }

  function onKeypress (event) {
    if (state.disabled || event.code !== 'Space') return

    event.preventDefault();
    toggleState();
  }

  function onControllerChange () {
    updateState();
  }

  function toggleState () {
    state.active = !isFieldActive();
    state.value = getFieldValueByState();

    instance.controller.value = state.value;
    instance.controller.dispatchEvent(new Event('change'));

    toggleActiveClass();
  }

  function updateState () {
    state.active = isFieldActive();
    state.value = getFieldValueByState();

    toggleActiveClass();
  }

  function setEnabled () {
    state.disabled = false;
    instance.switch.classList.remove(CSS_CLASSES.DISABLED_CLASS);
  }

  function setDisabled () {
    state.disabled = true;
    instance.switch.classList.add(CSS_CLASSES.DISABLED_CLASS);
  }

  function toggleActiveClass () {
    state.active
      ? instance.switch.classList.add(CSS_CLASSES.ACTIVE_CLASS)
      : instance.switch.classList.remove(CSS_CLASSES.ACTIVE_CLASS);
  }

  function getFieldValueByState () {
    const currentOptionIndex = state.active ? 1 : 0;
    return instance.controller[currentOptionIndex].value
  }

  function isFieldActive () {
    return !!instance.controller?.value
  }

  // ---------------------------------
  // 🔑 Métodos Públicos
  // ---------------------------------

  function check () {
    instance.controller.value = instance.controller[1].value;
    updateState();
  }

  function uncheck () {
    instance.controller.value = instance.controller[0].value;
    updateState();
  }

  function disable () {
    setDisabled();
  }

  function enable () {
    setEnabled();
  }

  function value () {
    return state.value
  }

  function destroy () {
    unmount();
  }
}

var main = {
  Segment,
  Switch
};

exports["default"] = main;
