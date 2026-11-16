import 'dotenv/config'
import { XMLParser } from 'fast-xml-parser'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '../src/payload.config'

type Item = Record<string, any>
const array = <T>(x: T | T[] | undefined): T[] => x === undefined ? [] : Array.isArray(x) ? x : [x]
const value = (v: any): string => String(v?.['#text'] ?? v ?? '')
const meta = (item: Item) => Object.fromEntries(array<Item>(item['wp:postmeta']).map(m => [value(m['wp:meta_key']), value(m['wp:meta_value'])]))
const filename = process.argv[2]
if (!filename) throw new Error('Uso: npm run import:wordpress -- /ruta/exportacion.xml')
const xml = new XMLParser({ ignoreAttributes: false, parseTagValue: false }).parse(await readFile(filename, 'utf8'))
const items = array<Item>(xml.rss.channel.item)
const content = items.filter(i => ['post', 'page'].includes(value(i['wp:post_type'])))
const attachments = items.filter(i => value(i['wp:post_type']) === 'attachment')
if (process.argv.includes('--inventory')) {
  const counts: Record<string, number> = {}
  for (const item of content) { const key = `${value(item['wp:post_type'])}:${value(item['wp:status'])}`; counts[key] = (counts[key] || 0) + 1 }
  const ids = content.map(item => value(item['wp:post_id']))
  if (new Set(ids).size !== ids.length) throw new Error('La exportaci?n contiene IDs duplicados')
  console.log(JSON.stringify({ counts, attachments: attachments.length }, null, 2))
  process.exit(0)
}
const payload = await getPayload({ config })
const report: string[] = ['# Informe de importaci?n', '', `Exportaci?n: ${path.basename(filename)}`, '']
const mediaMap = new Map<string, string>()
const mediaIds = new Map<string, number | string>()
const publicHtml = content.filter(i => value(i['wp:status']) === 'publish').map(i => value(i['content:encoded'])).join('\n')
const featured = new Set(content.filter(i => value(i['wp:status']) === 'publish').map(i => meta(i)._thumbnail_id).filter(Boolean))
for (const item of attachments) {
  const id = value(item['wp:post_id']), url = value(item['wp:attachment_url'])
  if (!url || (!publicHtml.includes(url) && !featured.has(id))) continue
  try {
    const found = await payload.find({ collection: 'media', where: { wordpressId: { equals: Number(id) } }, limit: 1 })
    let doc = found.docs[0]
    if (!doc) {
      const response = await fetch(url); if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const buffer = Buffer.from(await response.arrayBuffer()); const name = decodeURIComponent(new URL(url).pathname.split('/').pop() || `media-${id}`)
      doc = await payload.create({ collection: 'media', data: { wordpressId: Number(id), alt: meta(item)._wp_attachment_image_alt || '', originalUrl: url }, file: { data: buffer, mimetype: response.headers.get('content-type')?.split(';')[0] || 'application/octet-stream', name, size: buffer.length } })
    } else { doc = await payload.update({ collection: 'media', id: doc.id, data: { alt: meta(item)._wp_attachment_image_alt || '', originalUrl: url } }) }
    if (doc.url) mediaMap.set(url, doc.url); mediaIds.set(id, doc.id)
  } catch (error) { report.push(`- Medio ${id} (${url}): ${String(error)}`) }
}
// Las variantes de Elementor pueden no existir como adjuntos independientes.
const embedded = [...new Set(publicHtml.match(/https?:\/\/fisioinvasiva\.cl\/wp-content\/uploads\/[^\s"'<>]+/g) || [])]
for (const url of embedded) {
  if (mediaMap.has(url)) continue
  try {
    const existing = await payload.find({ collection: 'media', where: { originalUrl: { equals: url } }, limit: 1 })
    let doc = existing.docs[0]
    if (!doc) {
      const response = await fetch(url); if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const type = response.headers.get('content-type')?.split(';')[0] || ''
      if (!type.startsWith('image/')) throw new Error('El recurso no es una imagen')
      const buffer = Buffer.from(await response.arrayBuffer())
      const name = decodeURIComponent(new URL(url).pathname.split('/').pop() || 'imagen')
      doc = await payload.create({ collection: 'media', data: { alt: '', originalUrl: url }, file: { data: buffer, mimetype: type, name, size: buffer.length } })
    }
    if (doc.url) mediaMap.set(url, doc.url)
  } catch (error) { report.push(`- Imagen ${url}: ${String(error)}`) }
}
for (const item of content) {
  const id = Number(value(item['wp:post_id'])), metadata = meta(item), link = value(item.link)
  const route = link ? new URL(link).pathname : `/_wordpress/${id}/`
  let html = value(item['content:encoded'])
  for (const [source, target] of mediaMap) html = html.split(source).join(target)
  html = html.replace(/\s+srcset="[^"]*"/gi, '')
  const shortcodes = html.match(/\[(?!\/)[a-z][^\]]*\]/gi) || []
  if (shortcodes.length) report.push(`- ${route}: revisar shortcodes ${[...new Set(shortcodes)].join(', ')}`)
  if (metadata._elementor_data) report.push(`- ${route}: contenido exportado de Elementor; revisar composici?n, widgets e incrustaciones.`)
  const missing = [...new Set(html.match(/https?:\/\/fisioinvasiva\.cl\/wp-content\/uploads\/[^\s"'<>]+/g) || [])]
  if (missing.length) report.push(`- ${route}: ${missing.length} referencias a im?genes originales no copiadas; revisar antes de cambiar el dominio.`)
  if (route === '/contacto/') html = html.replace(/\[contact-form-7[^\]]*\]/g, '')
  const categories = array<Item>(item.category)
  const status = value(item['wp:status']); const visibility = ['publish', 'draft', 'private', 'pending', 'future'].includes(status) ? status as 'publish' | 'draft' | 'private' | 'pending' | 'future' : 'draft'
  const data = { title: value(item.title) || `Sin t?tulo ${id}`, path: route, wordpressId: id, kind: value(item['wp:post_type']) as 'post' | 'page', visibility, publishedAt: value(item['wp:post_date_gmt']) && value(item['wp:post_date_gmt']) !== '0000-00-00 00:00:00' ? value(item['wp:post_date_gmt']).replace(' ', 'T') + 'Z' : undefined, authorName: value(item['dc:creator']), categories: categories.filter(c => c['@_domain'] === 'category').map(value).join(', '), tags: categories.filter(c => c['@_domain'] === 'post_tag').map(value).join(', '), html, featuredImage: mediaIds.get(metadata._thumbnail_id) as number | undefined, seoTitle: metadata.rank_math_title || '', seoDescription: metadata.rank_math_description || '' }
  const found = await payload.find({ collection: 'content', where: { wordpressId: { equals: id } }, limit: 1 })
  if (found.docs[0]) await payload.update({ collection: 'content', id: found.docs[0].id, data }); else await payload.create({ collection: 'content', data })
}
report.push('', `Registros de contenido procesados: ${content.length}`, `Adjuntos asociados importados: ${mediaIds.size}`, '', 'Revisar los medios no p?blicos, el formulario, los t?tulos SEO con variables de Rank Math y los elementos que no aparezcan en content:encoded. La sincronizaci?n sobrescribe los campos importados en Payload.')
await writeFile('informe-importacion.md', report.join('\n') + '\n')
console.log(report.join('\n'))
process.exit(0)
