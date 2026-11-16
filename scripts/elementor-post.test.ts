import assert from 'node:assert/strict'
import { test } from 'node:test'
import { renderElementorPost } from './elementor-post'
import { taxonomySlug, taxonomyValues } from '../src/lib/treatment-taxonomy'

test('rebuilds treatment columns and local media without dropping video or lists', () => {
  const source = 'https://fisioinvasiva.cl/wp-content/uploads/example.webp'
  const html = renderElementorPost([{ elType: 'section', elements: [
    { elType: 'column', elements: [{ elType: 'widget', widgetType: 'heading', settings: { title: 'Qué tratamos', header_size: 'h3' } }, { elType: 'widget', widgetType: 'icon-list', settings: { icon_list: [{ text: 'Dolor crónico' }] } }, { elType: 'widget', widgetType: 'video', settings: { youtube_url: 'https://www.youtube.com/watch?v=B7tmSBrSJtw' } }] },
    { elType: 'column', elements: [{ elType: 'widget', widgetType: 'image', settings: { image: { url: source } } }] },
  ] }], new Map([[source, '/api/media/file/example.webp']]), new Map([[source, 'Terapia']]))
  assert.match(html, /<section class="wp-layout-row">/)
  assert.match(html, /<h3>Qué tratamos<\/h3>/)
  assert.match(html, /<li>Dolor crónico<\/li>/)
  assert.match(html, /youtube-nocookie\.com\/embed\/B7tmSBrSJtw/)
  assert.match(html, /src="\/api\/media\/file\/example.webp" alt="Terapia"/)
  assert.ok(!html.includes(source))
  assert.match(renderElementorPost([{ elType: 'widget', widgetType: 'video', settings: { youtube_url: 'https://youtube.com/shorts/b7IpYvg3EWQ' } }], new Map()), /wp-video-short.*embed\/b7IpYvg3EWQ/)
})

test('matches the imported category and tag slugs', () => {
  assert.equal(taxonomySlug('Tratamientos kinésicos'), 'tratamientos-kinesicos')
  assert.deepEqual(taxonomyValues('Fisio invasiva, Dolor crónico'), ['Fisio invasiva', 'Dolor crónico'])
})
