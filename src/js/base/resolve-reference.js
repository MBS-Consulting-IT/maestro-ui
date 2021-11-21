export function resolveReference (reference, { name, root }) {
  root = root || document

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
      const isHtmlElement = element instanceof HTMLElement

      if (!isHtmlElement) console.warn(`[${name}]: não foi possível incluir o seguinte elemento no construtor: ${element}`)

      return isHtmlElement
    })
  }

  /**
   * @type { String } - QuerySelector
   * @example `div > .class`
   */
  if (typeof reference === 'string') {
    try {
      root.querySelectorAll(reference)
    } catch (error) {
      return console.warn(`[${name}]: ${reference} não é um seletor válido`)
    }

    const elements = [...root.querySelectorAll(reference)]

    if (!elements.length) return console.warn(`[${name}]: nenhum elemento encontrado para o seletor ${reference}`)

    return elements
  }

  return console.warn(`[${name}]: referência desconhecida. O construtor somente pode ser inicializado com QueryStrings (seletores CSS), HTMLElement, HTMLCollection, NodeList ou array de HTMLElements`)
}
