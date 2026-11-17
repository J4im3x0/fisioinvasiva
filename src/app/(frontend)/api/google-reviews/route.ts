import { businessReviews, googleReviewsUrl } from '@/lib/google-business-reviews'
import type { BusinessCredentials } from '@/lib/google-business-reviews'

export const dynamic = 'force-dynamic'

let cached: { value: Awaited<ReturnType<typeof businessReviews>>; until: number } | undefined
let pending: Promise<Awaited<ReturnType<typeof businessReviews>>> | undefined

export async function GET() {
  const credentials: BusinessCredentials = {
    clientId: process.env.GOOGLE_BUSINESS_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_BUSINESS_CLIENT_SECRET || '',
    refreshToken: process.env.GOOGLE_BUSINESS_REFRESH_TOKEN || '',
    location: process.env.GOOGLE_BUSINESS_LOCATION || '',
  }
  if (Object.values(credentials).some(value => !value)) return Response.json({ status: 'unconfigured', url: googleReviewsUrl }, { headers: { 'Cache-Control': 'no-store' } })

  try {
    if (!cached || Date.now() >= cached.until) {
      pending ||= businessReviews(credentials).then(value => { cached = { value, until: Date.now() + 60 * 60 * 1000 }; return value }).finally(() => { pending = undefined })
      await pending
    }
    return Response.json(cached!.value, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Reseñas de Google Business Profile no disponibles:', error)
    return Response.json({ status: 'unavailable', url: googleReviewsUrl }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
