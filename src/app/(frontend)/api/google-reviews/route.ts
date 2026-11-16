const reviewUrl = 'https://share.google/ay32o4HwwQOiA1uTV'

type Place = {
  id?: string
  displayName?: { text?: string }
  formattedAddress?: string
  googleMapsUri?: string
  rating?: number
  userRatingCount?: number
  reviews?: {
    rating?: number
    text?: { text?: string }
    authorAttribution?: { displayName?: string; uri?: string; photoUri?: string }
    googleMapsUri?: string
    publishTime?: string
    relativePublishTimeDescription?: string
  }[]
}

export const dynamic = 'force-dynamic'

export async function GET() {
  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key) return Response.json({ status: 'unconfigured', url: reviewUrl }, { headers: { 'Cache-Control': 'no-store' } })

  try {
    let placeId = process.env.GOOGLE_PLACE_ID
    if (!placeId) {
      const search = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress' },
        body: JSON.stringify({ textQuery: 'Fisioterapia Invasiva Chile, Coyancura 2283 oficina 302, Providencia, Santiago', languageCode: 'es' }),
        cache: 'no-store',
      })
      if (!search.ok) throw new Error(`Google Places search: ${search.status}`)
      const results = (await search.json()) as { places?: Place[] }
      placeId = results.places?.find(place => /2283/.test(place.formattedAddress || '') && /fisio/i.test(place.displayName?.text || ''))?.id
      if (!placeId) throw new Error('No se encontró la ficha de Coyancura 2283')
    }

    const details = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=es&regionCode=CL`, {
      headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'displayName,rating,userRatingCount,reviews,googleMapsUri' },
      cache: 'no-store',
    })
    if (!details.ok) throw new Error(`Google Places details: ${details.status}`)
    const place = (await details.json()) as Place
    return Response.json({
      status: 'ok',
      name: place.displayName?.text,
      rating: place.rating,
      count: place.userRatingCount,
      url: place.googleMapsUri || reviewUrl,
      reviews: (place.reviews || []).slice(0, 5).map(review => ({
        author: review.authorAttribution?.displayName || 'Paciente',
        authorUrl: review.authorAttribution?.uri,
        photo: review.authorAttribution?.photoUri,
        rating: review.rating,
        text: review.text?.text,
        date: review.publishTime,
        relativeDate: review.relativePublishTimeDescription,
        url: review.googleMapsUri || place.googleMapsUri || reviewUrl,
      })),
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Reseñas de Google no disponibles:', error)
    return Response.json({ status: 'unavailable', url: reviewUrl }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
