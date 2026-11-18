import 'dotenv/config'
import assert from 'node:assert/strict'
import type { TypeWithID } from 'payload'
import config from '../src/payload.config'
import { editorConfigFactory } from '@payloadcms/richtext-lexical'
import { convertLexicalToHTMLAsync } from '@payloadcms/richtext-lexical/html-async'
import { importedHtmlToLexical } from '../src/lib/imported-html-to-lexical'

const editorConfig = await editorConfigFactory.default({ config: await config })
const html = '<h2>Tratamiento</h2><p>Texto <strong>importante</strong></p><ul><li>Beneficio</li></ul><img src="/api/media/file/foto.webp" alt="Tratamiento" /><iframe src="https://www.youtube.com/embed/abc" title="Video"></iframe>'
const result = importedHtmlToLexical(html, new Map([['/api/media/file/foto.webp', 42]]), editorConfig)
const nodes = JSON.stringify(result.body)
assert.match(nodes, /"type":"heading"/)
assert.match(nodes, /"type":"list"/)
assert.match(nodes, /"type":"upload"/)
assert.match(nodes, /"value":"42"/)
assert.match(nodes, /"type":"link"/)
assert.deepEqual(result.missingImages, [])
assert.deepEqual(result.unsupportedEmbeds, ['https://www.youtube.com/embed/abc'])
const populate = async <TData extends object = TypeWithID>(): Promise<TData | undefined> => ({ id: 42, url: '/api/media/file/foto.webp', alt: 'Tratamiento', mimeType: 'image/webp', width: 800, height: 500 }) as unknown as TData
const rendered = await convertLexicalToHTMLAsync({ data: result.body, populate })
assert.match(rendered, /src="\/api\/media\/file\/foto.webp"/)
assert.match(rendered, /alt="Tratamiento"/)
console.log('Conversión de HTML importado a editor visual: OK')
