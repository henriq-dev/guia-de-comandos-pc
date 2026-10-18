// ÂNCORA: rolagem explícita para regiões longas focáveis, inclusive em navegadores que não rolam <pre> com as teclas padrão.
export function scrollRegionWithKeyboard(event) {
  const element = event.currentTarget
  if (element.scrollHeight <= element.clientHeight) return

  const page = Math.max(40, Math.floor(element.clientHeight * 0.85))
  let delta
  switch (event.key) {
    case 'ArrowDown': delta = 40; break
    case 'ArrowUp': delta = -40; break
    case 'PageDown': delta = page; break
    case 'PageUp': delta = -page; break
    case 'Home': delta = -element.scrollTop; break
    case 'End': delta = element.scrollHeight - element.clientHeight - element.scrollTop; break
    case ' ': delta = event.shiftKey ? -page : page; break
    default: return
  }

  event.preventDefault()
  element.scrollTop = Math.max(0, Math.min(element.scrollHeight - element.clientHeight, element.scrollTop + delta))
}
