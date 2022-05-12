(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Maestro = factory());
})(this, (function () { 'use strict';

  const PADDING_IN_PIXELS = 3;
  const BORDER_IN_PIXELS = 1;

  const NAME$6 = 'Segment';

  const FIELD$4 = {
    EDITABLE: 'select[xname]',
    READONLY: 'input[type=hidden][xname]',
    TEXT: 'div[xid]'
  };

  const CSS_CLASSES$6 = {
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
    const fields = container.querySelectorAll(editable);
    const fieldReadonly = container.querySelector(readonly);

    if (!fields.length && !fieldReadonly) {
      throw new Error(errorMsg)
    }

    if (!fields.length && fieldReadonly) return

    return fields.length > 1
      ? [...fields]
      : fields[0]
  }

  function Segment (reference, props = {}) {
    const container = resolveReference(reference, {
      name: NAME$6,
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

    container[`_${NAME$6}`] = instance;

    return instance

    // ---------------------------------
    // 🔒 Métodos Privados
    // ---------------------------------

    function mount () {
      const field = resolveOrquestraField({
        container: instance.container,
        editable: FIELD$4.EDITABLE,
        readonly: FIELD$4.READONLY,
        errorMsg: `[${NAME$6}]: nenhum campo Orquestra do tipo caixa de seleção encontrado`
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

      delete instance.container[`_${NAME$6}`];

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

          segment.classList.add(CSS_CLASSES$6.LABEL_CLASS);
          segment.dataset.option = option.value;
          segment.textContent = option.textContent;

          return segment
        });

      segmentGroup.setAttribute('tabIndex', '0');
      segmentGroup.appendChild(segmentSelection);
      segmentGroup.classList.add(CSS_CLASSES$6.GROUP_CLASS);
      segmentSelection.classList.add(CSS_CLASSES$6.SELECTION_CLASS);
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

      segment.classList.add(CSS_CLASSES$6.ACTIVE_CLASS);
      instance.controller.value = value;
      instance.controller.dispatchEvent(new Event('change'));
      state.value = value;

      moveTo(instance.controller.selectedIndex);
    }

    function updateState (value) {
      const segment = getSegmentByValue(value);

      if (!segment) return resetOption()

      resetActiveClass();

      segment.classList.add(CSS_CLASSES$6.ACTIVE_CLASS);
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
      instance.segmentGroup.classList.remove(CSS_CLASSES$6.DISABLED_CLASS);
    }

    function setDisabled () {
      state.disabled = true;
      instance.segmentGroup.classList.add(CSS_CLASSES$6.DISABLED_CLASS);
    }

    function setTransition () {
      instance.segmentSelection.classList.add(CSS_CLASSES$6.ANIMATED_CLASS);
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
        segment.classList.remove(CSS_CLASSES$6.ACTIVE_CLASS)
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

  const NAME$5 = 'Switch';

  const FIELD$3 = {
    EDITABLE: 'select[xname]',
    READONLY: 'input[type=hidden][xname]',
    TEXT: 'div[xid]'
  };

  const CSS_CLASSES$5 = {
    CTRL_CLASS: 'o-switch',
    INNER_CLASS: 'o-switch-inner',
    LABEL_CLASS: 'o-switch-label',
    ACTIVE_CLASS: '-active',
    DISABLED_CLASS: '-disabled'
  };

  function Switch (reference, props = {}) {
    const container = resolveReference(reference, {
      name: NAME$5,
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

    container[`_${NAME$5}`] = instance;

    return instance

    // ---------------------------------
    // 🔒 Métodos Privados
    // ---------------------------------

    function mount () {
      const field = resolveOrquestraField({
        container: instance.container,
        editable: FIELD$3.EDITABLE,
        readonly: FIELD$3.READONLY,
        errorMsg: `[${NAME$5}]: nenhum campo Orquestra do tipo caixa de seleção encontrado`
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

      delete instance.container[`_${NAME$5}`];

      for (const propertyName of Object.getOwnPropertyNames(instance)) {
        instance[propertyName] = null;
      }
    }

    function createSwitch () {
      const switchContainer = document.createElement('div');
      const switchInner = document.createElement('div');
      const switchLabel = document.createElement('label');

      switchContainer.classList.add(CSS_CLASSES$5.CTRL_CLASS);
      switchContainer.setAttribute('tabIndex', '0');
      switchInner.classList.add(CSS_CLASSES$5.INNER_CLASS);
      switchLabel.classList.add(CSS_CLASSES$5.LABEL_CLASS);
      switchLabel.textContent = instance.controller[1].value;

      if (state.active) switchContainer.classList.add(CSS_CLASSES$5.ACTIVE_CLASS);

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
      instance.switch.classList.remove(CSS_CLASSES$5.DISABLED_CLASS);
    }

    function setDisabled () {
      state.disabled = true;
      instance.switch.classList.add(CSS_CLASSES$5.DISABLED_CLASS);
    }

    function toggleActiveClass () {
      state.active
        ? instance.switch.classList.add(CSS_CLASSES$5.ACTIVE_CLASS)
        : instance.switch.classList.remove(CSS_CLASSES$5.ACTIVE_CLASS);
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

  const NAME$4 = 'Collapse';

  const CSS_CLASSES$4 = {
    CONTAINER_CLASS: 'o-collapse',
    ITEM_CLASS: 'o-collapse-item',
    ITEM_HEADER_CLASS: 'o-collapse-header',
    ACTIVE_CLASS: '-active',
    DISABLED_CLASS: '-disabled'
  };

  function Collapse (reference, props = {}) {
    const container = resolveReference(reference, {
      name: NAME$4,
      root: props.root
    });

    return resolveInstance({
      reference: container,
      factory: CollapseFactory
    })
  }

  function CollapseFactory (container) {

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
    };

    mount();

    container[`_${NAME$4}`] = instance;

    return instance

    // ---------------------------------
    // 🔒 Métodos Privados
    // ---------------------------------

    function mount () {
      createCollapse();
      addTriggers();
    }

    function unmount () {
      instance.items.forEach(item => {
        const itemHeader = getCollapseHeader(item);

        if (!itemHeader) return

        itemHeader.removeEventListener('click', onClick);
        itemHeader.removeEventListener('click', onKeydown);
      });

      delete instance.container[`_${NAME$4}`];

      for (const propertyName of Object.getOwnPropertyNames(instance)) {
        instance[propertyName] = null;
      }
    }

    function createCollapse () {
      instance.items = [...instance.container.querySelectorAll(`.${CSS_CLASSES$4.ITEM_CLASS}`)];

      instance.items.forEach(item => {
        const itemHeader = getCollapseHeader(item);

        if (!itemHeader) return

        itemHeader.setAttribute('tabIndex', '0');
      });
    }

    function addTriggers () {
      instance.items.forEach(item => {
        const itemHeader = getCollapseHeader(item);

        if (!itemHeader) return

        itemHeader.addEventListener('click', onClick);
        itemHeader.addEventListener('keydown', onKeydown);
      });
    }

    function onClick (event) {
      const collapse = getCollapseContainer(event.srcElement);

      if (isDisabled(collapse)) return

      toggleCollapse(collapse);
    }

    function onKeydown (event) {
      const collapse = getCollapseContainer(event.srcElement);

      if (isDisabled(collapse) || event.code !== 'Space') return

      event.preventDefault();

      toggleCollapse(collapse);
    }

    function toggleCollapse (collapse) {
      collapse.classList.toggle(CSS_CLASSES$4.ACTIVE_CLASS);

      updateCurrent();
    }

    function showCollapse (collapse) {
      collapse.classList.add(CSS_CLASSES$4.ACTIVE_CLASS);

      updateCurrent();
    }

    function hideCollapse (collapse) {
      collapse.classList.remove(CSS_CLASSES$4.ACTIVE_CLASS);

      updateCurrent();
    }

    function setEnabled (collapse) {
      collapse.classList.remove(CSS_CLASSES$4.DISABLED_CLASS);
    }

    function setDisabled (collapse) {
      collapse.classList.add(CSS_CLASSES$4.DISABLED_CLASS);

      hideCollapse(collapse);
    }

    function updateCurrent () {
      instance.items.filter(item =>
        isActive(item)
      );
    }

    function isDisabled (collapse) {
      return collapse.classList.contains(CSS_CLASSES$4.DISABLED_CLASS)
    }

    function isActive (collapse) {
      return collapse.classList.contains(CSS_CLASSES$4.ACTIVE_CLASS)
    }

    function getCollapseContainer (innerElement) {
      return innerElement.closest(`.${CSS_CLASSES$4.ITEM_CLASS}`)
    }

    function getCollapseHeader (collapse) {
      return collapse.querySelector(`.${CSS_CLASSES$4.ITEM_HEADER_CLASS}`)
    }

    function getItemByIndex (index) {
      const item = instance.items[index];

      if (!item) console.warn(`[${NAME$4}]: item não encontrado para o índice ${index}`);

      return item
    }

    function resolveAction (index, callback) {
      const item = getItemByIndex(index);

      if (!item) return

      callback(item);
    }

    // ---------------------------------
    // 🔑 Métodos Públicos
    // ---------------------------------

    function toggle (index) {
      resolveAction(index, toggleCollapse);
    }

    function show (index) {
      resolveAction(index, showCollapse);
    }

    function hide (index) {
      resolveAction(index, hideCollapse);
    }

    function disable (index) {
      resolveAction(index, setDisabled);
    }

    function enable (index) {
      resolveAction(index, setEnabled);
    }

    function destroy () {
      unmount();
    }
  }

  const NAME$3 = 'Toggler';

  const CSS_CLASSES$3 = {
    OPEN_CLASS: '-open'
  };

  function Toggler (reference, props = {}) {
    const trigger = resolveReference(reference, {
      name: NAME$3,
      root: props.root
    });

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
    };

    mount();

    trigger[`_${NAME$3}`] = instance;

    return instance

    // ---------------------------------
    // 🔒 Métodos Privados
    // ---------------------------------

    function mount () {
      instance.content = props.content;

      createToggler();
      addTriggers();
    }

    function unmount () {
      instance.trigger.removeEventListener('click', onClick);
      instance.trigger.removeEventListener('click', onKeydown);

      delete instance.trigger[`_${NAME$3}`];

      for (const propertyName of Object.getOwnPropertyNames(instance)) {
        instance[propertyName] = null;
      }
    }

    function createToggler () {
      instance.trigger.setAttribute('tabIndex', '0');
    }

    function addTriggers () {
      instance.trigger.addEventListener('click', onClick);
      instance.trigger.addEventListener('keydown', onKeydown);
    }

    function onClick () {
      toggle();
    }

    function onKeydown (event) {
      if (event.code !== 'Space') return

      event.preventDefault();
      toggle();
    }

    // ---------------------------------
    // 🔑 Métodos Públicos
    // ---------------------------------

    function toggle () {
      instance.content.classList.toggle(CSS_CLASSES$3.OPEN_CLASS);
    }

    function show () {
      instance.content.classList.add(CSS_CLASSES$3.OPEN_CLASS);
    }

    function hide () {
      instance.content.classList.remove(CSS_CLASSES$3.OPEN_CLASS);
    }

    function destroy () {
      unmount();
    }
  }

  const NAME$2 = 'ButtonRadio';

  const FIELD$2 = {
    EDITABLE: 'select[xname]',
    READONLY: 'input[type=hidden][xname]',
    TEXT: 'div[xid]'
  };

  const CSS_CLASSES$2 = {
    GROUP_CLASS: 'btn-group',
    BTN_CLASSES: ['btn', 'btn-radio'],
    ACTIVE_CLASS: '-active',
    DISABLED_CLASS: '-disabled'
  };

  function ButtonRadio (reference, props = {}) {
    const container = resolveReference(reference, {
      name: NAME$2,
      root: props.root
    });

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
    };

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
    };

    try {
      mount();
    } catch (error) {
      return console.warn(error)
    }

    container[`_${NAME$2}`] = instance;

    return instance

    // ---------------------------------
    // 🔒 Métodos Privados
    // ---------------------------------
    function mount () {
      const field = resolveOrquestraField({
        container: instance.container,
        editable: FIELD$2.EDITABLE,
        readonly: FIELD$2.READONLY,
        errorMsg: `[${NAME$2}]: nenhum campo Orquestra do tipo caixa de seleção encontrado`
      });

      if (!field) return

      instance.controller = field;
      state.value = instance.controller.value;

      createButtonGroup();
      addTriggers();
    }

    function unmount () {
      instance.controller.removeEventListener('change', onControllerChange);
      instance.controller.style.removeProperty('display');
      instance.buttonGroup.remove();

      delete instance.container[`_${NAME$2}`];

      for (const propertyName of Object.getOwnPropertyNames(instance)) {
        instance[propertyName] = null;
      }
    }

    function createButtonGroup () {
      const buttonGroup = document.createElement('div');
      const buttons = [...instance.controller.querySelectorAll('option')]
        .filter(option => !!option.value)
        .map(option => {
          const button = document.createElement('button');

          button.classList.add(...CSS_CLASSES$2.BTN_CLASSES);
          button.dataset.option = option.value;
          button.textContent = option.textContent;
          button.type = 'button';

          return button
        });

      buttonGroup.classList.add(CSS_CLASSES$2.GROUP_CLASS);
      buttons.forEach(button => buttonGroup.appendChild(button));
      container.insertAdjacentElement('beforeend', buttonGroup);

      instance.controller.style.display = 'none';
      instance.buttonGroup = buttonGroup;
      instance.buttons = buttons;
    }

    function addTriggers () {
      instance.buttons.forEach(button =>
        button.addEventListener('click', onClick)
      );

      instance.controller
        .addEventListener('change', onControllerChange);
    }

    function onClick (event) {
      const value = this.dataset.option;
      const isCurrent = state.value === value;

      event.preventDefault();

      if (state.disabled || isCurrent || !value) return

      setOption(value);
    }

    function onControllerChange () {
      setOption(this.value, { silent: true });
    }

    function setOption (value, { silent } = {}) {
      const button = getButtonByValue(value);

      if (!button) return resetOption()

      resetActiveClass();

      button.classList.add(CSS_CLASSES$2.ACTIVE_CLASS);
      state.value = value;

      if (silent) return

      instance.controller.value = value;
      instance.controller.dispatchEvent(new Event('change'));
    }

    function getButtonByValue (value) {
      return instance.buttons
        .find(button => button.dataset.option === value)
    }

    function resetOption () {
      state.value = '';
      instance.controller.value = '';

      resetActiveClass();
    }

    function resetActiveClass () {
      instance.buttons.forEach(button =>
        button.classList.remove(CSS_CLASSES$2.ACTIVE_CLASS)
      );
    }

    function setEnabled () {
      state.disabled = false;
      instance.buttonGroup.classList.remove(CSS_CLASSES$2.DISABLED_CLASS);
    }

    function setDisabled () {
      state.disabled = true;
      instance.buttonGroup.classList.add(CSS_CLASSES$2.DISABLED_CLASS);
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

  const NAME$1 = 'RadioCard';

  const FIELD$1 = {
    EDITABLE: 'input[type=radio][xname]',
    READONLY: 'input[type=hidden][xname]',
    TEXT: 'div[xid]'
  };

  const CSS_CLASSES$1 = {
    RADIO_CLASS: 'o-radio-card',
    RADIO_MARKER_CLASS: 'o-radio-card-marker'
  };

  function RadioCard (reference, props = {}) {
    const container = resolveReference(reference, {
      name: NAME$1,
      root: props.root
    });

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
    };

    const instance = {
      container,
      radios: null,
      reset,
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

    container[`_${NAME$1}`] = instance;

    return instance

    // ---------------------------------
    // 🔒 Métodos Privados
    // ---------------------------------

    function mount () {
      const fields = resolveOrquestraField({
        container: instance.container,
        editable: FIELD$1.EDITABLE,
        readonly: FIELD$1.READONLY,
        errorMsg: `[${NAME$1}]: nenhum campo Orquestra do tipo input radio encontrado`
      });

      if (!fields) return

      instance.radios = fields;

      createRadioCard();
      setValue();
      addTriggers();
    }

    function unmount () {
      instance.radios.forEach(radio =>
        radio.removeEventListener('change', setValue)
      );

      delete instance.container[`_${NAME$1}`];

      for (const propertyName of Object.getOwnPropertyNames(instance)) {
        instance[propertyName] = null;
      }
    }

    function createRadioCard () {
      const radioMarker = `<div class="${CSS_CLASSES$1.RADIO_MARKER_CLASS}"></div>`;

      instance.radios.forEach(radio => {
        const label = radio.closest('label');
        const option = radio.value;
        const textNode = radio.nextSibling;
        const radioText = textNode.textContent;

        const radioHelp = getRadioElementByOption({
          option,
          dataProp: 'help',
          container: instance.container
        });

        const radioIcon = getRadioElementByOption({
          option,
          dataProp: 'icon',
          container: instance.container
        });

        textNode.remove();
        label.classList.add(CSS_CLASSES$1.RADIO_CLASS);

        if (radioHelp) radio.insertAdjacentElement('afterend', radioHelp);

        radio.insertAdjacentHTML('afterend', `<span>${radioText}</span>`);

        if (radioIcon) radio.insertAdjacentElement('afterend', radioIcon);

        radio.insertAdjacentHTML('afterend', radioMarker);
      });
    }

    function addTriggers () {
      instance.radios.forEach(radio =>
        radio.addEventListener('change', setValue)
      );
    }

    function getValue () {
      return instance.radios
        .find(radio => radio.checked)?.value
    }

    function setValue () {
      state.value = getValue();
    }

    function resetValue () {
      instance.radios
        .forEach(radio => {
          radio.checked = false;
        });
    }

    function setEnabled () {
      state.disabled = false;

      instance.radios
        .forEach(radio => {
          radio.disabled = false;
        });
    }

    function setDisabled () {
      state.disabled = true;

      instance.radios
        .forEach(radio => {
          radio.disabled = true;
        });
    }

    function getRadioElementByOption ({ container, dataProp, option }) {
      const partial = container
        .querySelector(`[data-radio-${dataProp}="${option}"]`);

      if (!partial) return null

      const partialClone = partial.cloneNode(true);

      partialClone.removeAttribute('data-radio-help');
      partial.remove();

      return partialClone
    }

    // ---------------------------------
    // 🔑 Métodos Públicos
    // ---------------------------------

    function reset () {
      resetValue();
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

  const NAME = 'SelectCard';

  const FIELD = {
    EDITABLE: 'select[xname]',
    READONLY: 'input[type=hidden][xname]',
    TEXT: 'div[xid]'
  };

  const CSS_CLASSES = {
    RADIO_CLASS: 'o-radio-card',
    RADIO_MARKER_CLASS: 'o-radio-card-marker'
  };

  function SelectCard (reference, props = {}) {
    const container = resolveReference(reference, {
      name: NAME,
      root: props.root
    });

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
    };

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
    };

    try {
      mount();
    } catch (error) {
      return console.warn(error)
    }

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
        errorMsg: `[${NAME}]: nenhum campo Orquestra do tipo input radio encontrado`
      });

      if (!field) return

      instance.select = field;
      instance.fieldId = field.getAttribute('xname').substring(3);

      createSelectCard();

      instance.radios = [
        ...instance.container
          .querySelectorAll(`input[name=${instance.fieldId}]`)
      ];

      setInitialValue();
      addTriggers();

      // Forçar change para verificação de fontes de dados mapeadas ao campo
      // É preciso agendar com `setTimeout` para o Zeev detectar o evento
      setTimeout(() => {
        instance.select.dispatchEvent(new Event('change'));
      }, 0);
    }

    function unmount () {
      instance.radios.forEach(radio =>
        radio.remove()
      );

      instance.select.removeAttribute('style');

      delete instance.container[`_${NAME}`];

      for (const propertyName of Object.getOwnPropertyNames(instance)) {
        instance[propertyName] = null;
      }
    }

    function createSelectCard () {
      const radioMarker = `<div class="${CSS_CLASSES.RADIO_MARKER_CLASS}"></div>`;
      const radioCards = [...instance.select.options]
        .filter(({ value }) => !!value)
        .map((option, index) => {
          const { value, textContent } = option;

          const cardHelp = retrieveComplementByOption({
            option: value,
            dataProp: 'help',
            container: instance.container
          });

          const cardIcon = retrieveComplementByOption({
            option,
            dataProp: 'icon',
            container: instance.container
          });

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
        }).join('');

      instance.container.insertAdjacentHTML(
        'afterbegin',
        radioCards
      );

      instance.select.style.display = 'none';
    }

    function addTriggers () {
      instance.radios.forEach(radio =>
        radio.addEventListener('change', setValue)
      );
    }

    function getValue () {
      return instance.radios
        .find(radio => radio.checked)?.value || ''
    }

    function setInitialValue () {
      state.value = instance.select.value;

      if (!state.value) return

      const radioToSelect = instance.radios
        .find(radio => radio.value === state.value);

      radioToSelect.checked = true;
    }

    function setValue () {
      state.value = getValue();
      instance.select.value = state.value;
      instance.select.dispatchEvent(new Event('change'));
    }

    function resetValue () {
      instance.radios
        .forEach(radio => {
          radio.checked = false;
        });

      instance.select.value = '';
      state.value = '';
    }

    function setEnabled () {
      state.disabled = false;

      instance.radios
        .forEach(radio => {
          radio.disabled = false;
        });
    }

    function setDisabled () {
      state.disabled = true;

      instance.radios
        .forEach(radio => {
          radio.disabled = true;
        });
    }

    function retrieveComplementByOption ({ container, dataProp, option }) {
      const partial = container
        .querySelector(`[data-radio-${dataProp}="${option}"]`);

      if (!partial) return ''

      partial.removeAttribute('data-radio-help');

      const markup = partial.outerHTML;

      partial.remove();

      return markup
    }

    // ---------------------------------
    // 🔑 Métodos Públicos
    // ---------------------------------

    function reset () {
      resetValue();
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
    Switch,
    Collapse,
    Toggler,
    ButtonRadio,
    RadioCard,
    SelectCard
  };

  return main;

}));
