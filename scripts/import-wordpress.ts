import 'dotenv/config'
import { XMLParser } from 'fast-xml-parser'
import { readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { renderElementorPost } from './elementor-post'

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
  if (new Set(ids).size !== ids.length) throw new Error('La exportación contiene IDs duplicados')
  console.log(JSON.stringify({ counts, attachments: attachments.length }, null, 2))
  process.exit(0)
}
const payload = await getPayload({ config })
const report: string[] = ['# Informe de importación', '', `Exportación: ${path.basename(filename)}`, '']
const mediaMap = new Map<string, string>()
const mediaAlt = new Map<string, string>()
const mediaIds = new Map<string, number | string>()
const localFileExists = async (name?: string | null) => {
  if (!name) return false
  try { const file = await stat(path.resolve('media', path.basename(name))); return file.isFile() && file.size > 0 } catch { return false }
}
const localUrl = (url?: string | null) => {
  if (!url) throw new Error('Payload no devolvió la URL del archivo local')
  const pathname = new URL(url, 'http://localhost').pathname
  if (pathname.includes('/wp-content/uploads/')) throw new Error(`Payload devolvió una URL de WordPress: ${url}`)
  return pathname
}
let downloaded = 0
let failed = 0
const publicHtml = content.filter(i => value(i['wp:status']) === 'publish').map(i => [value(i['content:encoded']), value(i['wp:post_type']) === 'post' ? meta(i)._elementor_data?.replaceAll('\\/', '/') : ''].join('\n').replace(/\s+srcset="[^"]*"/gi, '')).join('\n')
const featured = new Set(content.filter(i => value(i['wp:status']) === 'publish').map(i => meta(i)._thumbnail_id).filter(Boolean))
for (const item of attachments) {
  const id = value(item['wp:post_id']), url = value(item['wp:attachment_url'])
  if (!url || (!publicHtml.includes(url) && !featured.has(id))) continue
  try {
    const found = await payload.find({ collection: 'media', where: { wordpressId: { equals: Number(id) } }, limit: 1 })
    let doc = found.docs[0]
    const needsFile = !doc || !await localFileExists(doc.filename)
    if (needsFile) {
      const response = await fetch(url); if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const buffer = Buffer.from(await response.arrayBuffer()); const name = decodeURIComponent(new URL(url).pathname.split('/').pop() || `media-${id}`)
      const data = { wordpressId: Number(id), alt: meta(item)._wp_attachment_image_alt || '', originalUrl: url }
      const file = { data: buffer, mimetype: response.headers.get('content-type')?.split(';')[0] || 'application/octet-stream', name, size: buffer.length }
      doc = doc ? await payload.update({ collection: 'media', id: doc.id, data, file }) : await payload.create({ collection: 'media', data, file })
    } else { doc = await payload.update({ collection: 'media', id: doc.id, data: { alt: meta(item)._wp_attachment_image_alt || '', originalUrl: url } }) }
    if (!await localFileExists(doc.filename)) throw new Error('El archivo no quedó guardado en el volumen media')
    if (needsFile) downloaded++
    mediaMap.set(url, localUrl(doc.url)); mediaAlt.set(url, meta(item)._wp_attachment_image_alt || ''); mediaIds.set(id, doc.id)
  } catch (error) { failed++; report.push(`- Medio ${id} (${url}): ${String(error)}`) }
}
// Las variantes de Elementor pueden no existir como adjuntos independientes.
const embedded = [...new Set(publicHtml.match(/https?:\/\/fisioinvasiva\.cl\/wp-content\/uploads\/[^\s"'<>]+/g) || [])]
for (const url of embedded) {
  if (mediaMap.has(url)) continue
  try {
    const existing = await payload.find({ collection: 'media', where: { originalUrl: { equals: url } }, limit: 1 })
    let doc = existing.docs[0]
    const needsFile = !doc || !await localFileExists(doc.filename)
    if (needsFile) {
      const response = await fetch(url); if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const type = response.headers.get('content-type')?.split(';')[0] || ''
      if (!type.startsWith('image/')) throw new Error('El recurso no es una imagen')
      const buffer = Buffer.from(await response.arrayBuffer())
      const name = decodeURIComponent(new URL(url).pathname.split('/').pop() || 'imagen')
      const data = { alt: '', originalUrl: url }
      const file = { data: buffer, mimetype: type, name, size: buffer.length }
      doc = doc ? await payload.update({ collection: 'media', id: doc.id, data, file }) : await payload.create({ collection: 'media', data, file })
    }
    if (!await localFileExists(doc.filename)) throw new Error('El archivo no quedó guardado en el volumen media')
    if (needsFile) downloaded++
    mediaMap.set(url, localUrl(doc.url))
  } catch (error) { failed++; report.push(`- Imagen ${url}: ${String(error)}`) }
}
for (const item of content) {
  const id = Number(value(item['wp:post_id'])), metadata = meta(item), link = value(item.link)
  const route = link ? new URL(link).pathname : `/_wordpress/${id}/`
  let html = value(item['content:encoded'])
  let reconstructed = false
  if (value(item['wp:post_type']) === 'post' && metadata._elementor_data) {
    try { html = renderElementorPost(JSON.parse(metadata._elementor_data), mediaMap, mediaAlt); reconstructed = true }
    catch (error) { report.push(`- ${route}: no se pudo reconstruir la composición de Elementor: ${String(error)}`) }
  }
  for (const [source, target] of mediaMap) html = html.split(source).join(target)
  html = html.replace(/\s+srcset="[^"]*"/gi, '')
  if (['/', '/testimonios/'].includes(route) && /\[trustindex(?:\s+[^\]]*)?\]/i.test(html)) {
    html = html.replace(/\[trustindex(?:\s+[^\]]*)?\]/gi, '')
    report.push(`- ${route}: shortcode Trustindex reemplazado por el componente de reseñas de Google.`)
  }
  if (route === '/contacto/' && /\[contact-form-7(?:\s+[^\]]*)?\]/i.test(html)) {
    html = html.replace(/\[contact-form-7(?:\s+[^\]]*)?\]/gi, '')
    report.push(`- ${route}: shortcode Contact Form 7 reemplazado por el formulario del sitio.`)
  }
  const shortcodes = html.match(/\[(?!\/)[a-z][\w-]*(?:\s+[^\]]*)?\]/gi) || []
  if (shortcodes.length) report.push(`- ${route}: revisar shortcodes ${[...new Set(shortcodes)].join(', ')}`)
  if (reconstructed) report.push(`- ${route}: columnas, imágenes, listas y videos de Elementor reconstruidos en HTML editable.${metadata._elementor_data.includes('"widgetType":"slides"') ? ' El carrusel de imágenes se muestra como galería.' : ''}`)
  else if (metadata._elementor_data) report.push(`- ${route}: contenido exportado de Elementor; revisar composición, widgets e incrustaciones.`)
  const missing = [...new Set(html.match(/https?:\/\/fisioinvasiva\.cl\/wp-content\/uploads\/[^\s"'<>]+/g) || [])]
  if (missing.length) { failed++; report.push(`- ${route}: ${missing.length} referencias a imágenes originales no copiadas; contenido no actualizado.`); continue }
  const categories = array<Item>(item.category)
  const status = value(item['wp:status']); const visibility = ['publish', 'draft', 'private', 'pending', 'future'].includes(status) ? status as 'publish' | 'draft' | 'private' | 'pending' | 'future' : 'draft'
  const data = { title: value(item.title) || `Sin título ${id}`, path: route, wordpressId: id, kind: value(item['wp:post_type']) as 'post' | 'page', visibility, publishedAt: value(item['wp:post_date_gmt']) && value(item['wp:post_date_gmt']) !== '0000-00-00 00:00:00' ? value(item['wp:post_date_gmt']).replace(' ', 'T') + 'Z' : undefined, authorName: value(item['dc:creator']), categories: categories.filter(c => c['@_domain'] === 'category').map(value).join(', '), tags: categories.filter(c => c['@_domain'] === 'post_tag').map(value).join(', '), html, featuredImage: mediaIds.get(metadata._thumbnail_id) as number | undefined, seoTitle: metadata.rank_math_title || '', seoDescription: metadata.rank_math_description || '' }
  const found = await payload.find({ collection: 'content', where: { wordpressId: { equals: id } }, limit: 1 })
  if (found.docs[0]) await payload.update({ collection: 'content', id: found.docs[0].id, data }); else await payload.create({ collection: 'content', data })
}
report.push('', `Registros de contenido procesados: ${content.length}`, `Adjuntos asociados importados: ${mediaIds.size}`, `Medios con archivo local verificado: ${mediaMap.size}`, `Archivos descargados o reparados en el volumen: ${downloaded}`, `Errores de medios o contenido: ${failed}`, '', 'Revisar los medios no públicos, el formulario, los títulos SEO con variables de Rank Math y los elementos que no aparezcan en content:encoded. La sincronización sobrescribe los campos importados en Payload.')
await writeFile('informe-importacion.md', report.join('\n') + '\n')
console.log(report.join('\n'))
process.exit(failed ? 1 : 0)
