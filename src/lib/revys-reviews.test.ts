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

test('mantiene la atribución y traduce las etiquetas sin ejecutar el autoplay', async () => {
  const fragment = '<div class="revys-w revys-w--head-side" lang="en"><p>Excellent</p><p>Based on <a>505 reviews</a></p><ul data-rw-autoplay="5000" aria-label="Customer reviews, scroll horizontally"><li><time class="revys-w__date" datetime="2026-11-17">1 day ago</time><details><summary><span>Read more</span><span>Show less</span></summary></details><p>Posted on Google</p></li></ul><p>Free widget by Revys</p></div><script type="application/ld+json">{"@type":"MedicalBusiness"}</script><script>alert(1)</script>'
  const html = await revysReviewsHtml('widget_123', (async () => new Response(fragment)) as typeof fetch)

  assert.match(html!, /Free widget by Revys/)
  assert.match(html!, /<script type="application\/ld\+json">/)
  assert.doesNotMatch(html!, /alert\(1\)|data-rw-autoplay/)
  assert.doesNotMatch(html!, /<div class="revys-w revys-w--head-side"/)
  assert.match(html!, /Excelente|Basado en|Leer más|Mostrar menos|Publicado en Google/)
  assert.match(html!, /17 nov 2026/)
  assert.equal(await revysReviewsHtml('widget_123', (async () => new Response('<img src="x" onerror="alert(1)">')) as typeof fetch), null)
})
