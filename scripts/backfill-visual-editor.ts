import 'dotenv/config'
import { getPayload } from 'payload'
import { editorConfigFactory } from '@payloadcms/richtext-lexical'
import config from '../src/payload.config'
import { importedHtmlToLexical } from '../src/lib/imported-html-to-lexical'
import { importedHtmlToSections } from '../src/lib/imported-html-to-sections'

const payload = await getPayload({ config })
const editorConfig = await editorConfigFactory.default({ config: payload.config })
const mediaIdsByUrl = new Map<string, number>()

for (let page = 1; ; page++) {
  const result = await payload.find({ collection: 'media', page, limit: 100, depth: 0 })
  for (const media of result.docs) if (media.url) mediaIdsByUrl.set(new URL(media.url, 'http://localhost').pathname, media.id)
  if (!result.hasNextPage) break
}

let converted = 0
let skipped = 0
let failed = 0
let pendingImages = 0
let pendingEmbeds = 0
for (let page = 1; ; page++) {
  const result = await payload.find({ collection: 'content', page, limit: 100, depth: 0, sort: 'id' })
  for (const entry of result.docs) {
    if (!entry.html || entry.useVisualEditor || (entry.kind === 'post' ? entry.sections?.length : entry.body)) { skipped++; continue }
    try {
      const structured = entry.kind === 'post' ? importedHtmlToSections(entry.html, mediaIdsByUrl, editorConfig) : null
      let visual: { missingImages: string[]; unsupportedEmbeds: string[] }
      if (structured?.sections.length) {
        visual = structured
        await payload.update({ collection: 'content', id: entry.id, data: { sections: structured.sections, body: null } })
      } else {
        const plain = importedHtmlToLexical(entry.html, mediaIdsByUrl, editorConfig)
        visual = plain
        await payload.update({ collection: 'content', id: entry.id, data: { body: plain.body } })
      }
      converted++
      pendingImages += visual.missingImages.length
      pendingEmbeds += visual.unsupportedEmbeds.length
      if (visual.missingImages.length || visual.unsupportedEmbeds.length) console.warn(`${entry.path}: revisar ${visual.missingImages.length} imágenes y ${visual.unsupportedEmbeds.length} incrustaciones en el editor`)
    } catch (error) {
      failed++
      console.error(`${entry.path}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  if (!result.hasNextPage) break
}
console.log(`Editor visual preparado: ${converted} contenidos; ${skipped} ya preparados o vacíos; ${failed} errores. Pendientes de revisión: ${pendingImages} imágenes y ${pendingEmbeds} videos.`)
process.exit(failed ? 1 : 0)
