export async function revysReviewsHtml(widgetId: string, fetcher: typeof fetch = fetch): Promise<string | null> {
  if (!/^[A-Za-z0-9_-]+$/.test(widgetId)) return null

  try {
    const response = await fetcher(`https://revys.io/api/embed/${widgetId}/html`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(2000),
    } as RequestInit)
    return response.ok ? await response.text() : null
  } catch {
    return null
  }
}
