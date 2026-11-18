import { convertHTMLToLexical, type editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'

type EditorConfig = Awaited<ReturnType<typeof editorConfigFactory.default>>

export function importedHtmlToLexical(html: string, mediaIdsByUrl: Map<string, number | string>, editorConfig: EditorConfig) {
  const dom = new JSDOM(html)
  const missingImages: string[] = []
  for (const image of dom.window.document.querySelectorAll('img')) {
    const src = image.getAttribute('src') || ''
    const id = mediaIdsByUrl.get(src)
    if (id) {
      image.setAttribute('data-lexical-upload-id', String(id))
      image.setAttribute('data-lexical-upload-relation-to', 'media')
    } else {
      missingImages.push(src)
      image.replaceWith(dom.window.document.createTextNode(`[Imagen pendiente: ${image.getAttribute('alt') || src}]`))
    }
  }
  const unsupportedEmbeds: string[] = []
  for (const frame of dom.window.document.querySelectorAll('iframe')) {
    const src = frame.getAttribute('src') || ''
    unsupportedEmbeds.push(src)
    const link = dom.window.document.createElement('a')
    link.href = src
    link.textContent = frame.getAttribute('title') || 'Ver video incrustado'
    frame.replaceWith(link)
  }
  const body = convertHTMLToLexical({ editorConfig, html: dom.window.document.body.innerHTML, JSDOM })
  // Payload's HTML converter reads upload IDs as strings; PostgreSQL media IDs must stay numeric.
  const ids = new Map(Array.from(mediaIdsByUrl.values(), id => [String(id), id]))
  type Node = { type?: string; value?: unknown; children?: Node[] }
  const restoreUploadId = (node: Node) => {
    if (node.type === 'upload') {
      const id = ids.get(String(node.value))
      if (id !== undefined) node.value = id
    }
    for (const child of node.children || []) restoreUploadId(child)
  }
  restoreUploadId(body.root)
  return {
    body,
    missingImages,
    unsupportedEmbeds,
  }
}
