import 'dotenv/config'
import assert from 'node:assert/strict'
import { isValidID, type TypeWithID } from 'payload'
import config from '../src/payload.config'
import { editorConfigFactory } from '@payloadcms/richtext-lexical'
import { convertLexicalToHTMLAsync } from '@payloadcms/richtext-lexical/html-async'
import { importedHtmlToLexical } from '../src/lib/imported-html-to-lexical'
import { importedHtmlToSections } from '../src/lib/imported-html-to-sections'
import { youtubeEmbedUrl } from '../src/lib/youtube-embed'

const editorConfig = await editorConfigFactory.default({ config: await config })
const html = '<h2>Tratamiento</h2><p>Texto <strong>importante</strong> <a href="">sin destino</a> <a href="/ruta con espacio">enlace</a></p><ul><li>Beneficio</li></ul><img src="/api/media/file/foto.webp" alt="Tratamiento" /><iframe src="https://www.youtube.com/embed/abc" title="Video"></iframe>'
const result = importedHtmlToLexical(html, new Map([['/api/media/file/foto.webp', 42]]), editorConfig)
const nodes = JSON.stringify(result.body)
assert.match(nodes, /"type":"heading"/)
assert.match(nodes, /"type":"list"/)
assert.match(nodes, /"type":"upload"/)
assert.match(nodes, /"value":42/)
assert.equal(isValidID(42, 'number'), true)
assert.equal(isValidID('42', 'number'), false)
assert.match(nodes, /"type":"link"/)
assert.doesNotMatch(nodes, /"url":""/)
assert.match(nodes, /"url":"\/ruta%20con%20espacio"/)
assert.match(nodes, /sin destino/)
assert.deepEqual(result.missingImages, [])
assert.deepEqual(result.unsupportedEmbeds, ['https://www.youtube.com/embed/abc'])
const populate = async <TData extends object = TypeWithID>(): Promise<TData | undefined> => ({ id: 42, url: '/api/media/file/foto.webp', alt: 'Tratamiento', mimeType: 'image/webp', width: 800, height: 500 }) as unknown as TData
const rendered = await convertLexicalToHTMLAsync({ data: result.body, populate })
assert.match(rendered, /src="\/api\/media\/file\/foto.webp"/)
assert.match(rendered, /alt="Tratamiento"/)
const structured = importedHtmlToSections('<section class="wp-layout-row"><div class="wp-layout-column"><h3>Primero</h3><aside class="wp-note">Nota clínica</aside><div class="wp-video"><iframe src="https://www.youtube-nocookie.com/embed/B7tmSBrSJtw"></iframe></div></div><div class="wp-layout-column"><h3>Segundo</h3><div class="wp-slides"><img src="/api/media/file/foto.webp"></div></div></section>', new Map([['/api/media/file/foto.webp', 42]]), editorConfig)
assert.equal(structured.sections.length, 1)
assert.match(JSON.stringify(structured.sections[0].left.body), /Primero/)
assert.match(JSON.stringify(structured.sections[0].left.body), /"type":"quote"/)
assert.match(JSON.stringify(structured.sections[0].right.body), /Segundo/)
assert.equal(structured.sections[0].left.videoUrl, 'https://www.youtube-nocookie.com/embed/B7tmSBrSJtw')
assert.deepEqual(structured.sections[0].right.gallery, [{ image: 42 }])
assert.deepEqual(structured.unsupportedEmbeds, [])
assert.equal(youtubeEmbedUrl(structured.sections[0].left.videoUrl), 'https://www.youtube-nocookie.com/embed/B7tmSBrSJtw')
assert.equal(youtubeEmbedUrl('https://example.com/embed/B7tmSBrSJtw'), null)
console.log('Conversión de HTML importado a editor visual: OK')
