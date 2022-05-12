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
  const fields = container.querySelectorAll(editable)
  const fieldReadonly = container.querySelector(readonly)

  if (!fields.length && !fieldReadonly) {
    throw new Error(errorMsg)
  }

  if (!fields.length && fieldReadonly) return

  return fields.length > 1
    ? [...fields]
    : fields[0]
}
