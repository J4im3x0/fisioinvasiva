import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
export const dynamic = 'force-dynamic'
export default async function sitemap(): Promise<MetadataRoute.Sitemap> { const payload = await getPayload({ config }); const result = await payload.find({ collection: 'content', where: { visibility: { equals: 'publish' } }, limit: 1000, overrideAccess: false }); return [{ url: 'https://fisioinvasiva.cl/' }, ...result.docs.filter(p => p.path !== '/').map(p => ({ url: `https://fisioinvasiva.cl${p.path}`, lastModified: p.updatedAt }))] }
