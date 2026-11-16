import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import config from '@payload-config'

export async function publishedSitePage(path: string) {
  const payload = await getPayload({ config })
  const result = await payload.find({ collection: 'content', where: { and: [{ path: { equals: path } }, { kind: { equals: 'page' } }, { visibility: { equals: 'publish' } }] }, limit: 1, overrideAccess: false })
  return result.docs[0] || notFound()
}
