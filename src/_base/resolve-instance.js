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
export function resolveInstance ({ reference, props, factory }) {
  if (!reference) return

  if (reference instanceof HTMLElement) {
    return factory(reference, props)
  }

  return reference
    .map(element => factory(element, props))
    .filter(instance => !!instance)
}
