const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'])
const POWERED_CLASS = /\bclass\s*=\s*["'][^"']*\brevys-w__(?:powered|pw-[a-z0-9-]+)/i
const ATTRIBUTION_TEXT = /free\s+widget\s+by\s+revys/i

function textOf(fragment: string): string {
  return fragment
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Removes the "Free widget by Revys" badge, including its wrapper, from the embed markup. */
function stripRevysAttribution(html: string): string {
  const tokens = html.match(/<!--[\s\S]*?-->|<![^>]*>|<[^>]+>|[^<]+/g) ?? []
  const output: string[] = []
  const stack: Array<{ tag: string; removing: boolean }> = []
  let removingDepth = 0

  for (const token of tokens) {
    if (!token.startsWith('<')) {
      if (!removingDepth) output.push(token)
      continue
    }

    const tag = token.match(/^<\/?([a-z][a-z0-9:-]*)/i)?.[1].toLowerCase() ?? ''

    if (token.startsWith('</')) {
      const index = stack.map(frame => frame.tag).lastIndexOf(tag)
      if (index === -1) {
        if (!removingDepth) output.push(token)
        continue
      }
      const matched = stack[index]
      while (stack.length > index) {
        if (stack.pop()!.removing) removingDepth--
      }
      if (!removingDepth && !matched.removing) output.push(token)
      continue
    }

    const nested = Boolean(tag) && !token.endsWith('/>') && !VOID_TAGS.has(tag)
    const removing = nested && !token.startsWith('<!') && POWERED_CLASS.test(token)
    if (!removingDepth && !removing) output.push(token)
    if (removing) removingDepth++
    if (nested) stack.push({ tag, removing })
  }

  return output.join('')
    .replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, anchor => ATTRIBUTION_TEXT.test(textOf(anchor)) ? '' : anchor)
    .replace(/<(p|span|small|div)\b[^>]*>\s*Free\s+widget\s+by\s+Revys\s*<\/\1>/gi, '')
    .replace(/\s*Free\s+widget\s+by\s+Revys\s*/gi, ' ')
}

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

    return stripRevysAttribution(withoutScripts)
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
