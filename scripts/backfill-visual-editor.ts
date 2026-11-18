import 'dotenv/config'
import { getPayload } from 'payload'
import { editorConfigFactory } from '@payloadcms/richtext-lexical'
import config from '../src/payload.config'
import { importedHtmlToLexical } from '../src/lib/imported-html-to-lexical'

const payload = await getPayload({ config })
const editorConfig = await editorConfigFactory.default({ config: payload.config })
const mediaIdsByUrl = new Map<string, number | string>()

for (let page = 1; ; page++) {
  const result = await payload.find({ collection: 'media', page, limit: 100, depth: 0 })
  for (const media of result.docs) if (media.url) mediaIdsByUrl.set(new URL(media.url, 'http://localhost').pathname, media.id)
  if (!result.hasNextPage) break
}

let converted = 0
let skipped = 0
let pendingImages = 0
let pendingEmbeds = 0
for (let page = 1; ; page++) {
  const result = await payload.find({ collection: 'content', page, limit: 100, depth: 0, sort: 'id' })
  for (const entry of result.docs) {
    if (!entry.html || entry.body) { skipped++; continue }
    const visual = importedHtmlToLexical(entry.html, mediaIdsByUrl, editorConfig)
    await payload.update({ collection: 'content', id: entry.id, data: { body: visual.body } })
    converted++
    pendingImages += visual.missingImages.length
    pendingEmbeds += visual.unsupportedEmbeds.length
    if (visual.missingImages.length || visual.unsupportedEmbeds.length) console.warn(`${entry.path}: revisar ${visual.missingImages.length} imágenes y ${visual.unsupportedEmbeds.length} videos en el editor visual`)
  }
  if (!result.hasNextPage) break
}
console.log(`Editor visual preparado: ${converted} contenidos; ${skipped} ya preparados o vacíos. Pendientes de revisión: ${pendingImages} imágenes y ${pendingEmbeds} videos.`)
process.exit(0)
