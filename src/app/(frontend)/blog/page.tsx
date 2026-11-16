import { getPayload } from 'payload'
import config from '@payload-config'
export const dynamic = 'force-dynamic'
export default async function Blog() { const payload = await getPayload({ config }); const posts = await payload.find({ collection: 'content', where: { and: [{ kind: { equals: 'post' } }, { visibility: { equals: 'publish' } }] }, sort: '-publishedAt', limit: 1000, overrideAccess: false }); return <main className="article"><h1>Artículos y tratamientos</h1><p>Conoce más sobre nuestros tratamientos y enfoques de rehabilitación.</p><div className="treatment-list">{posts.docs.map(post => <a key={post.id} href={post.path}><span>{post.title}</span></a>)}</div></main> }
