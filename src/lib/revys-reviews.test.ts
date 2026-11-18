import assert from 'node:assert/strict'
import test from 'node:test'
import { revysReviewsHtml } from './revys-reviews'

test('obtiene el widget gratuito de Revys y rechaza IDs inválidos', async () => {
  const requests: string[] = []
  const fetcher = (async (url: string) => {
    requests.push(url)
    return new Response('<div>Reseña real</div>')
  }) as typeof fetch

  assert.equal(await revysReviewsHtml('widget_123', fetcher), '<div>Reseña real</div>')
  assert.deepEqual(requests, ['https://revys.io/api/embed/widget_123/html'])
  assert.equal(await revysReviewsHtml('../otro', fetcher), null)
  assert.equal(requests.length, 1)
})

test('elimina la marca de Revys y traduce las etiquetas sin ejecutar el autoplay', async () => {
  const fragment = '<div class="revys-w revys-w--head-side" lang="en"><p>Excellent</p><p>Based on <a>505 reviews</a></p><ul data-rw-autoplay="5000" aria-label="Customer reviews, scroll horizontally"><li><time class="revys-w__date" datetime="2026-11-17">1 day ago</time><details><summary><span>Read more</span><span>Show less</span></summary></details><p>Posted on Google</p></li></ul><p>Free widget by Revys</p></div><script type="application/ld+json">{"@type":"MedicalBusiness"}</script><script>alert(1)</script>'
  const html = await revysReviewsHtml('widget_123', (async () => new Response(fragment)) as typeof fetch)

  assert.doesNotMatch(html!, /Free widget by Revys/)
  assert.doesNotMatch(html!, /<p>\s*<\/p>/)
  assert.match(html!, /<script type="application\/ld\+json">/)
  assert.doesNotMatch(html!, /alert\(1\)|data-rw-autoplay/)
  assert.doesNotMatch(html!, /<div class="revys-w revys-w--head-side"/)
  assert.match(html!, /Excelente|Basado en|Leer más|Mostrar menos|Publicado en Google/)
  assert.match(html!, /17 nov 2026/)
  assert.equal(await revysReviewsHtml('widget_123', (async () => new Response('<img src="x" onerror="alert(1)">')) as typeof fetch), null)
})

test('quita el contenedor de atribución y conserva el resto del carrusel', async () => {
  const fragment = '<div class="revys-w"><ul class="revys-w__list"><li class="revys-w__card"><div class="revys-w__foot"><p>Posted on Google</p><div class="revys-w__powered"><div><a href="https://revys.io/?utm_source=embed" target="_blank" rel="noopener"><span class="revys-w__pw-mark">R</span><span class="revys-w__pw-word">Free widget by</span><span class="revys-w__pw-go">Revys</span></a></div></div></div></li></ul></div>'
  const html = await revysReviewsHtml('widget_123', (async () => new Response(fragment)) as typeof fetch)

  assert.match(html!, /Publicado en Google/)
  assert.match(html!, /<ul class="revys-w__list">[\s\S]*<\/ul>/)
  assert.doesNotMatch(html!, /Free widget by|revys-w__powered|revys-w__pw-|revys\.io/)
  assert.equal((html!.match(/<div\b/g) ?? []).length, (html!.match(/<\/div>/g) ?? []).length)
})

test('también elimina la atribución si cambia el nombre de la clase', async () => {
  const fragment = '<div><p>Reseña</p><a href="https://revys.io"><span>Free widget by</span> <b>Revys</b></a></div>'
  const html = await revysReviewsHtml('widget_123', (async () => new Response(fragment)) as typeof fetch)

  assert.equal(html, '<div><p>Reseña</p></div>')
  assert.equal(
    await revysReviewsHtml('widget_123', (async () => new Response('<span class="revys-w__pw-mark"/><p>ok</p>')) as typeof fetch),
    '<span class="revys-w__pw-mark"/><p>ok</p>',
  )
})
