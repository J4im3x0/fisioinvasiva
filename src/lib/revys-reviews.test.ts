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
