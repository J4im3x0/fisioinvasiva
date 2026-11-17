import assert from 'node:assert/strict'
import { test } from 'node:test'
import { businessReviews } from './google-business-reviews'

test('loads all review pages and maps Google ratings without Places calls', async () => {
  const calls: string[] = []
  const request = (async (input: RequestInfo | URL) => {
    const url = String(input)
    calls.push(url)
    if (url.endsWith('/token')) return Response.json({ access_token: 'test-access-token' })
    if (url.includes('pageToken=next')) return Response.json({ reviews: [{ reviewId: '2', reviewer: { isAnonymous: true }, starRating: 'FOUR', createTime: '2025-02-01T00:00:00Z' }] })
    if (url.includes('/reviews')) return Response.json({ averageRating: 4.5, totalReviewCount: 2, nextPageToken: 'next', reviews: [{ reviewId: '1', reviewer: { displayName: 'Ana', profilePhotoUrl: 'https://example.com/ana.jpg' }, starRating: 'FIVE', comment: 'Excelente', createTime: '2025-01-01T00:00:00Z' }] })
    throw new Error(`Unexpected URL: ${url}`)
  }) as typeof fetch
  const result = await businessReviews({ clientId: 'id', clientSecret: 'secret', refreshToken: 'refresh', location: 'accounts/12/locations/34' }, request)
  assert.equal(result.count, 2)
  assert.equal(result.rating, 4.5)
  assert.deepEqual(result.reviews.map(review => [review.author, review.rating]), [['Ana', 5], ['Usuario de Google', 4]])
  assert.equal(calls.length, 3)
  assert.ok(calls.every(url => !url.includes('places.googleapis.com')))
})

test('rejects an invalid location before sending credentials', async () => {
  await assert.rejects(businessReviews({ clientId: 'id', clientSecret: 'secret', refreshToken: 'refresh', location: '../places' }, (() => { throw new Error('Network was called') }) as typeof fetch), /GOOGLE_BUSINESS_LOCATION/)
})
