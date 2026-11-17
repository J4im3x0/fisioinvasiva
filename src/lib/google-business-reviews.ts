export const googleReviewsUrl = 'https://share.google/ay32o4HwwQOiA1uTV'

export type BusinessCredentials = {
  clientId: string
  clientSecret: string
  refreshToken: string
  location: string
}

type GoogleReview = {
  reviewId?: string
  reviewer?: { displayName?: string; profilePhotoUrl?: string; isAnonymous?: boolean }
  starRating?: string
  comment?: string
  createTime?: string
}

type ReviewPage = {
  reviews?: GoogleReview[]
  averageRating?: number
  totalReviewCount?: number
  nextPageToken?: string
}

const stars: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 }

export async function businessAccessToken(credentials: Pick<BusinessCredentials, 'clientId' | 'clientSecret' | 'refreshToken'>, request: typeof fetch = fetch): Promise<string> {
  const response = await request('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: credentials.clientId, client_secret: credentials.clientSecret, refresh_token: credentials.refreshToken, grant_type: 'refresh_token' }),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`Google OAuth: HTTP ${response.status}`)
  const data = await response.json() as { access_token?: string }
  if (!data.access_token) throw new Error('Google OAuth no devolvió un token de acceso')
  return data.access_token
}

export async function businessReviews(credentials: BusinessCredentials, request: typeof fetch = fetch) {
  if (!/^accounts\/\d+\/locations\/\d+$/.test(credentials.location)) throw new Error('GOOGLE_BUSINESS_LOCATION debe tener el formato accounts/ID/locations/ID')
  const token = await businessAccessToken(credentials, request)
  const reviews: GoogleReview[] = []
  const pageTokens = new Set<string>()
  let pageToken = ''
  let firstPage: ReviewPage | undefined
  do {
    const url = new URL(`https://mybusiness.googleapis.com/v4/${credentials.location}/reviews`)
    url.searchParams.set('pageSize', '50')
    url.searchParams.set('orderBy', 'updateTime desc')
    if (pageToken) url.searchParams.set('pageToken', pageToken)
    const response = await request(url, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
    if (!response.ok) throw new Error(`Google Business Profile reviews: HTTP ${response.status}`)
    const page = await response.json() as ReviewPage
    firstPage ||= page
    reviews.push(...(page.reviews || []))
    pageToken = page.nextPageToken || ''
    if (pageToken && pageTokens.has(pageToken)) throw new Error('Google devolvió una paginación repetida')
    if (pageToken) pageTokens.add(pageToken)
  } while (pageToken)

  return {
    status: 'ok',
    rating: firstPage?.averageRating,
    count: firstPage?.totalReviewCount,
    url: googleReviewsUrl,
    reviews: reviews.map(review => ({
      id: review.reviewId,
      author: review.reviewer?.isAnonymous ? 'Usuario de Google' : review.reviewer?.displayName || 'Usuario de Google',
      photo: review.reviewer?.isAnonymous ? undefined : review.reviewer?.profilePhotoUrl,
      rating: stars[review.starRating || ''] || 0,
      text: review.comment || '',
      date: review.createTime,
    })),
  }
}
