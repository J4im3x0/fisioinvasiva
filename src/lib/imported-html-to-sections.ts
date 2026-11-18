import { JSDOM } from 'jsdom'
import type { editorConfigFactory } from '@payloadcms/richtext-lexical'
import { importedHtmlToLexical } from './imported-html-to-lexical'
import { youtubeEmbedUrl } from './youtube-embed'

type EditorConfig = Awaited<ReturnType<typeof editorConfigFactory.default>>

export function importedHtmlToSections(html: string, mediaIdsByUrl: Map<string, number>, editorConfig: EditorConfig) {
  const document = new JSDOM(html).window.document
  const missingImages: string[] = []
  const unsupportedEmbeds: string[] = []
  const column = (element: Element) => {
    const copy = element.cloneNode(true) as Element
    for (const note of copy.querySelectorAll('.wp-note')) {
      const quote = document.createElement('blockquote')
      quote.innerHTML = note.innerHTML
      note.replaceWith(quote)
    }
    const frame = copy.querySelector('.wp-video iframe')
    const src = frame?.getAttribute('src') || ''
    const videoUrl = youtubeEmbedUrl(src) ? src : ''
    const videoPortrait = Boolean(videoUrl && frame?.closest('.wp-video-short'))
    if (videoUrl) frame?.closest('.wp-video')?.remove()
    const galleryImages = [...copy.querySelectorAll('.wp-slides img')]
    const gallery = galleryImages.map(image => {
      const src = image.getAttribute('src') || ''
      const id = mediaIdsByUrl.get(src)
      return id ? { image: id } : null
    }).filter((item): item is { image: number } => item !== null)
    if (galleryImages.length && gallery.length === galleryImages.length) copy.querySelector('.wp-slides')?.remove()
    else gallery.length = 0
    const visual = importedHtmlToLexical(copy.innerHTML, mediaIdsByUrl, editorConfig)
    missingImages.push(...visual.missingImages)
    unsupportedEmbeds.push(...visual.unsupportedEmbeds)
    return { body: visual.body, videoUrl, videoPortrait, gallery }
  }
  const sections = [...document.querySelectorAll('.wp-layout-row')]
    .filter(row => !row.parentElement?.closest('.wp-layout-row'))
    .map(row => [...row.children].filter(child => child.classList.contains('wp-layout-column')))
    .filter(columns => columns.length === 2)
    .map(columns => ({ left: column(columns[0]), right: column(columns[1]) }))
  return { sections, missingImages, unsupportedEmbeds }
}
