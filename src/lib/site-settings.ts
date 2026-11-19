import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import {
  DEFAULT_SITE_SETTINGS,
  mergeSiteSettings,
  type ResolvedSiteSettings,
  type SiteEventKind,
} from './site-settings-shared'

export * from './site-settings-shared'

export async function getSiteSettings(existingPayload?: Payload): Promise<ResolvedSiteSettings> {
  try {
    const payload = existingPayload || (await getPayload({ config }))
    const doc = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
    return mergeSiteSettings(doc as unknown as Record<string, unknown>)
  } catch {
    return DEFAULT_SITE_SETTINGS
  }
}

export async function recordSiteEvent(
  event: { kind: SiteEventKind; path?: string; label?: string },
  existingPayload?: Payload,
): Promise<void> {
  try {
    const payload = existingPayload || (await getPayload({ config }))
    const path = event.path?.startsWith('/') ? event.path.slice(0, 160) : '/'
    const label = event.label ? event.label.trim().slice(0, 160) : undefined
    await payload.create({
      collection: 'site-events',
      overrideAccess: true,
      data: {
        kind: event.kind,
        path,
        label,
      },
    })
  } catch {
    // Analytics must never interrupt page rendering or booking redirects.
  }
}
