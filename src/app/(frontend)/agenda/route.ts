import { NextRequest, NextResponse } from 'next/server'
import { getSiteSettings, recordSiteEvent } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const settings = await getSiteSettings()
  const referer = request.headers.get('referer')
  let fromPath = '/agenda'
  if (referer) {
    try {
      const parsed = new URL(referer)
      if (parsed.origin === request.nextUrl.origin) fromPath = parsed.pathname
    } catch {
      // Ignore invalid referer header.
    }
  }
  void recordSiteEvent({ kind: 'agenda_click', path: fromPath })
  const url = new URL(settings.bookingUrl)
  request.nextUrl.searchParams.forEach((value, key) => url.searchParams.append(key, value))
  return NextResponse.redirect(url, 302)
}
