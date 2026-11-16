import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

export const metadata: Metadata = { title: 'Tratamientos - Fisio Invasiva' }
export const dynamic = 'force-dynamic'

export default async function Tratamientos() {
  const payload = await getPayload({ config })
  const posts = await payload.find({ collection: 'content', where: { and: [{ kind: { equals: 'post' } }, { visibility: { equals: 'publish' } }] }, sort: 'title', limit: 1000, overrideAccess: false })
  return <main className="inner-page treatments-index"><section className="inner-hero"><h1>Tratamientos</h1><p>Conoce las técnicas y enfoques de rehabilitación de Fisio Invasiva.</p><div className="treatment-index-grid">{posts.docs.map(post => {
    const media = typeof post.featuredImage === 'object' ? post.featuredImage : null
    return <a className="treatment-index-card" href={post.path} key={post.id}>{media?.url && <img src={media.url} alt={media.alt || post.title} loading="lazy" />}<h2>{post.title}</h2><span>Conoce el tratamiento →</span></a>
  })}</div></section></main>
}
