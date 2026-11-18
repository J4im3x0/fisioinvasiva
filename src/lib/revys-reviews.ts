export async function revysReviewsHtml(widgetId: string, fetcher: typeof fetch = fetch): Promise<string | null> {
  if (!/^[A-Za-z0-9_-]+$/.test(widgetId)) return null

  try {
    const response = await fetcher(`https://revys.io/api/embed/${widgetId}/html`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(2000),
    } as RequestInit)
    if (!response.ok) return null
    const html = await response.text()
    const date = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

    // Revys now includes an autoplay script in its HTML fragment; keep only inert JSON-LD.
    const withoutScripts = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, script => /\btype\s*=\s*["']application\/ld\+json["']/i.test(script.slice(0, script.indexOf('>'))) ? script : '')
    if (/<[a-z][^>]*\son[a-z]+\s*=|<(?:a|img|svg)[^>]*(?:href|src)\s*=\s*["']\s*javascript:/i.test(withoutScripts)) return null

    return withoutScripts
      .replace(/(<div class="revys-w[^"]*)\srevys-w--head-side/, '$1')
      .replace(/\sdata-rw-autoplay="[^"]*"/g, '')
      .replace('lang="en"', 'lang="es"')
      .replaceAll('>Excellent<', '>Excelente<')
      .replaceAll('>Based on ', '>Basado en ')
      .replace(/(>\d[\d,.]* )reviews(<\/a>)/g, '$1reseñas$2')
      .replaceAll('>Write a review ', '>Escribir una reseña ')
      .replaceAll('>Read more<', '>Leer más<')
      .replaceAll('>Show less<', '>Mostrar menos<')
      .replaceAll('>Posted on Google<', '>Publicado en Google<')
      .replaceAll('Customer reviews, scroll horizontally', 'Reseñas de Google, desliza horizontalmente')
      .replaceAll(' out of 5', ' de 5')
      .replace(/(<time class="revys-w__date" datetime=")(\d{4}-\d{2}-\d{2})("[^>]*>)[^<]*(<\/time>)/g, (_, start: string, iso: string, end: string, close: string) =>
        `${start}${iso}${end}${date.format(new Date(`${iso}T12:00:00Z`))}${close}`)
  } catch {
    return null
  }
}
