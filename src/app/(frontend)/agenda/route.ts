import { NextRequest, NextResponse } from 'next/server'
export function GET(request: NextRequest) { const url = new URL('https://kinesiologofisioterapeutadeclaudiavalenzuela.site.agendapro.com/cl/sucursal/107922'); request.nextUrl.searchParams.forEach((value, key) => url.searchParams.append(key, value)); return NextResponse.redirect(url, 302) }
