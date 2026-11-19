import { NextRequest, NextResponse } from 'next/server'
import { recordSiteEvent } from '@/lib/site-settings'

const ALLOWED_CLIENT_EVENTS = new Set(['whatsapp_open', 'whatsapp_click'] as const)

export async function POST(request: NextRequest) {
  if (Number(request.headers.get('content-length') || 0) > 1024) {
    return new NextResponse(null, { status: 413 })
  }
  const origin = request.headers.get('origin')
  if (origin && origin !== request.nextUrl.origin) {
    return new NextResponse(null, { status: 403 })
  }
  try {
    const body = (await request.json()) as { kind?: unknown; path?: unknown }
    if (typeof body.kind !== 'string' || !ALLOWED_CLIENT_EVENTS.has(body.kind as 'whatsapp_open' | 'whatsapp_click')) {
      return new NextResponse(null, { status: 400 })
    }
    const path = typeof body.path === 'string' && body.path.startsWith('/') ? body.path.slice(0, 160) : '/'
    await recordSiteEvent({ kind: body.kind as 'whatsapp_open' | 'whatsapp_click', path })
    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse(null, { status: 400 })
  }
}
