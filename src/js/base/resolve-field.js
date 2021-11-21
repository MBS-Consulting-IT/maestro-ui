/**
 * Busca por um campo do Orquestra nos formatos `editável`
 * e `vísivel` (input hidden)
 * @param {HTMLElement} config.container - container para busca do campo
 * @param {String} config.editable - queryString para o campo editável
 * @param {String} config.readonly - queryString para o campo visível
 * @param {String} config.errorMsg - mensagem de erro quando campo não encontrado
 * @returns {HTMLElement} campo Orquestra
 */
export function resolveOrquestraField ({ container, editable, readonly, errorMsg }) {
  const field = container.querySelector(editable)
  const fieldReadonly = container.querySelector(readonly)

  if (!field && !fieldReadonly) {
    throw new Error(errorMsg)
  }

  if (!field && fieldReadonly) return

  return field
}
