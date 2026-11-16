import sanitizeHtml from 'sanitize-html'

type Element = { elType: string; widgetType?: string; settings?: Record<string, any>; elements?: Element[] }
const text = (value: unknown) => sanitizeHtml(String(value || ''), { allowedTags: ['br', 'strong', 'em', 'a'], allowedAttributes: { a: ['href'] } })
const attr = (value: unknown) => String(value || '').replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')

export function renderElementorPost(elements: Element[], media: Map<string, string>, mediaAlt = new Map<string, string>()): string {
  const image = (source: { url?: string; alt?: string } = {}) => {
    if (!source.url) return ''
    return `<img src="${attr(media.get(source.url) || source.url)}" alt="${attr(source.alt || mediaAlt.get(source.url))}" loading="lazy">`
  }
  const render = (element: Element): string => {
    const children = element.elements || []
    if (element.elType === 'section' || element.elType === 'container') {
      const columns = children.filter(child => child.elType === 'column')
      return columns.length > 1 ? `<section class="wp-layout-row">${columns.map(render).join('')}</section>` : children.map(render).join('')
    }
    if (element.elType === 'column') return `<div class="wp-layout-column">${children.map(render).join('')}</div>`
    const settings = element.settings || {}
    if (element.widgetType === 'heading') {
      const tag = ['h2', 'h3', 'h4', 'h5', 'h6'].includes(settings.header_size) ? settings.header_size : 'h3'
      return `<${tag}>${text(settings.title)}</${tag}>`
    }
    if (element.widgetType === 'image') return image(settings.image)
    if (element.widgetType === 'video') {
      const url = String(settings.youtube_url || '')
      const id = url.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/)([\w-]{11})/)?.[1]
      return id ? `<div class="wp-video${url.includes('/shorts/') ? ' wp-video-short' : ''}"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="Video del tratamiento" loading="lazy" allowfullscreen></iframe></div>` : ''
    }
    if (element.widgetType === 'icon-list') return `<ul class="wp-check-list">${(settings.icon_list || []).map((entry: { text?: string }) => `<li>${text(entry.text)}</li>`).join('')}</ul>`
    if (element.widgetType === 'slides') return `<div class="wp-slides">${(settings.slides || []).map((slide: { background_image?: { url?: string; alt?: string } }) => image(slide.background_image)).join('')}</div>`
    if (element.widgetType === 'mfn_blockquote') return `<blockquote>${text(settings.content)}</blockquote>`
    if (element.widgetType === 'mfn_list') return `<aside class="wp-note"><h3>${text(settings.title)}</h3>${sanitizeHtml(String(settings.content || ''))}</aside>`
    return ''
  }
  return elements.map(render).join('')
}
