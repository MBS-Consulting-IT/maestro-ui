export default function mount () {
  const appShell = document.querySelector('.app-shell')
  let appShellActive = false

  const getNavText = (isActive) => {
    return isActive
      ? 'Desativar Colorbox'
      : 'Ativar Colorbox'
  }

  document.querySelector('.js-toggle-colorbox')
    .addEventListener('click', function () {
      appShell.classList.toggle('colorboxed')
      appShellActive = !appShellActive
      this.innerText = getNavText(appShellActive)
    })
}
