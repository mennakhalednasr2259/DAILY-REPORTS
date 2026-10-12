const allowedTags = new Set(['P', 'BR', 'H1', 'H2', 'H3', 'H4', 'UL', 'OL', 'LI', 'STRONG', 'B', 'EM', 'I', 'U', 'A', 'BLOCKQUOTE'])

export function sanitizeReportHtml(value) {
  if (typeof document === 'undefined') return ''
  const template = document.createElement('template')
  template.innerHTML = String(value || '')

  const cleanNode = (node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType !== Node.ELEMENT_NODE) return
      if (!allowedTags.has(child.tagName)) {
        child.replaceWith(document.createTextNode(child.textContent || ''))
        return
      }
      const href = child.tagName === 'A' ? child.getAttribute('href') : null
      Array.from(child.attributes).forEach(attribute => child.removeAttribute(attribute.name))
      if (child.tagName === 'A' && href && /^https?:\/\//i.test(href)) {
        child.setAttribute('href', href)
        child.setAttribute('target', '_blank')
        child.setAttribute('rel', 'noopener noreferrer')
      }
      cleanNode(child)
    })
  }
  cleanNode(template.content)
  return template.innerHTML
}
