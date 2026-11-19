export function youtubeEmbedUrl(input?: string | null) {
  const trimmed = input?.trim()
  if (!trimmed) return null
  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'https:') return null
    const host = url.hostname.replace(/^(?:www|m)\./, '')
    let id: string | null = null
    if (host === 'youtu.be') id = url.pathname.replace(/^\/+|\/+$/g, '').split('/')[0] || null
    else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      id = url.pathname.startsWith('/embed/') || url.pathname.startsWith('/shorts/')
        ? url.pathname.split('/')[2]
        : url.searchParams.get('v')
    }
    return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null
  } catch { return null }
}
