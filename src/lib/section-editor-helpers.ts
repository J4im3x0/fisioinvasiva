import sanitizeHtml from 'sanitize-html'
import { youtubeEmbedUrl } from './youtube-embed'

type LexicalNode = {
  type?: string
  text?: string
  children?: LexicalNode[]
}

export type ColumnSummaryInput = {
  body?: { root?: LexicalNode } | null
  videoUrl?: string | null
  videoPortrait?: boolean | null
  gallery?: Array<{ image?: unknown } | null> | null
}

function collectLexicalSignals(node?: LexicalNode | null): { text: string; hasMedia: boolean } {
  if (!node) return { text: '', hasMedia: false }
  if (typeof node.text === 'string' && node.text.trim()) return { text: node.text.trim(), hasMedia: false }
  if (node.type === 'upload' || node.type === 'horizontalrule') return { text: '', hasMedia: true }
  let firstText = ''
  let hasMedia = false
  for (const child of node.children || []) {
    const signal = collectLexicalSignals(child)
    if (!firstText && signal.text) firstText = signal.text
    if (signal.hasMedia) hasMedia = true
    if (firstText && hasMedia) break
  }
  return { text: firstText, hasMedia }
}

export function hasLexicalContent(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const root = (value as { root?: LexicalNode }).root
  const signal = collectLexicalSignals(root)
  return Boolean(signal.text || signal.hasMedia)
}

function collectLexicalTextParts(node?: LexicalNode | null, parts: string[] = []): string[] {
  if (!node) return parts
  if (typeof node.text === 'string' && node.text.trim()) parts.push(node.text.trim())
  for (const child of node.children || []) collectLexicalTextParts(child, parts)
  return parts
}

export function extractLexicalText(value: unknown): string {
  if (!value || typeof value !== 'object') return ''
  const root = (value as { root?: LexicalNode }).root
  return collectLexicalTextParts(root).join(' ').replace(/\s+/g, ' ').trim()
}

export type ExcerptPostInput = {
  seoDescription?: string | null
  useVisualEditor?: boolean | null
  sections?: Array<{
    left?: { body?: unknown } | null
    right?: { body?: unknown } | null
  }> | null
  body?: unknown
  html?: string | null
}

export function getTreatmentExcerpt(post: ExcerptPostInput, maxLength = 155): string {
  let raw = ''
  if (post.useVisualEditor) {
    if (Array.isArray(post.sections) && post.sections.length > 0) {
      for (const section of post.sections) {
        const leftText = extractLexicalText(section?.left?.body)
        if (leftText) {
          raw = leftText
          break
        }
        const rightText = extractLexicalText(section?.right?.body)
        if (rightText) {
          raw = rightText
          break
        }
      }
    }
    if (!raw && post.body) raw = extractLexicalText(post.body)
  }
  if (!raw && post.html) {
    const summary = post.html.match(/<(?:h5|p)\b[^>]*>([\s\S]*?)<\/(?:h5|p)>/i)?.[1] || post.html
    raw = sanitizeHtml(summary, { allowedTags: [], allowedAttributes: {} })
  }
  if (!raw && post.seoDescription) raw = post.seoDescription
  const clean = raw.replace(/\s+/g, ' ').trim()
  if (!clean) return ''
  return clean.length > maxLength ? `${clean.slice(0, maxLength).trimEnd()}…` : clean
}

export function countGalleryImages(gallery?: Array<{ image?: unknown } | null> | null): number {
  if (!Array.isArray(gallery)) return 0
  return gallery.filter(item => Boolean(item?.image)).length
}

export function summarizeColumn(column?: ColumnSummaryInput | null): string {
  if (!column) return 'Vacía'
  const parts: string[] = []
  const signal = collectLexicalSignals(column.body?.root)
  if (signal.text) {
    const clean = signal.text.replace(/\s+/g, ' ').trim()
    parts.push(clean.length > 36 ? `${clean.slice(0, 35).trimEnd()}…` : clean)
  } else if (signal.hasMedia) {
    parts.push('Imagen')
  }
  if (youtubeEmbedUrl(column.videoUrl)) parts.push('Video')
  const galleryCount = countGalleryImages(column.gallery)
  if (galleryCount > 0) parts.push(galleryCount === 1 ? '1 foto' : `${galleryCount} fotos`)
  return parts.length > 0 ? parts.join(' · ') : 'Vacía'
}

export function swapSectionColumnsState<T extends Record<string, unknown>>(
  fields: T,
  rowIndex: number,
  arrayPath = 'sections',
): Record<string, unknown> {
  const prefix = `${arrayPath}.${rowIndex}.`
  const subFieldState: Record<string, unknown> = {}
  for (const [key, field] of Object.entries(fields)) {
    if (!key.startsWith(prefix)) continue
    const subPath = key.slice(prefix.length)
    let nextPath = subPath
    if (subPath.startsWith('left.')) nextPath = `right.${subPath.slice(5)}`
    else if (subPath.startsWith('right.')) nextPath = `left.${subPath.slice(6)}`
    subFieldState[nextPath] = field && typeof field === 'object' ? { ...field } : field
  }
  return subFieldState
}
