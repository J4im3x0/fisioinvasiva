import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getTreatmentExcerpt } from '@/lib/section-editor-helpers'
import { taxonomySlug, taxonomyValues, treatmentCategories } from '@/lib/treatment-taxonomy'

export const metadata: Metadata = { title: 'Tratamientos - Fisio Invasiva' }
export const dynamic = 'force-dynamic'

export default async function Tratamientos({ searchParams }: { searchParams: Promise<{ categoria?: string; tag?: string; tags?: string }> }) {
  const { categoria, tag, tags } = await searchParams
  const payload = await getPayload({ config })
  const result = await payload.find({ collection: 'content', where: { and: [{ kind: { equals: 'post' } }, { visibility: { equals: 'publish' } }] }, sort: '-publishedAt', limit: 1000, depth: 1, overrideAccess: false })
  const posts = result.docs
  const categories = [...new Set([...treatmentCategories, ...posts.flatMap(post => taxonomyValues(post.categories))])].filter(category => posts.some(post => taxonomyValues(post.categories).includes(category)))
  const tagValues = [...new Set(posts.flatMap(post => taxonomyValues(post.tags)))].sort((a, b) => a.localeCompare(b, 'es'))
  const showingTags = !!(tag || tags)
  const selected = showingTags ? tag : categoria
  const options = showingTags ? tagValues : categories
  const active = options.find(option => taxonomySlug(option) === selected) || ''
  const visible = active ? posts.filter(post => taxonomyValues(showingTags ? post.tags : post.categories).includes(active)) : posts
  const filterHref = (option: string) => showingTags ? `/tratamientos/?tag=${taxonomySlug(option)}` : `/tratamientos/?categoria=${taxonomySlug(option)}`
  return <main className="treatment-directory">
    <header className="directory-heading"><h1>{active || 'Tratamientos'}</h1><nav aria-label="Ruta de navegación"><a href="/">Inicio</a><span>›</span><a href="/tratamientos/">Tratamientos</a>{active && <><span>›</span><span>{active}</span></>}</nav></header>
    <div className="directory-inner">
      <div className="treatment-filter-heading"><span>Filtrar por</span><a href="/tratamientos/" aria-current={!showingTags ? 'page' : undefined}>Categorías</a><a href="/tratamientos/?tags=1" aria-current={showingTags ? 'page' : undefined}>Tags</a></div>
      <nav className="treatment-filters" aria-label={showingTags ? 'Filtrar por etiqueta' : 'Filtrar por categoría'}><a href={showingTags ? '/tratamientos/?tags=1' : '/tratamientos/'} aria-current={!active ? 'page' : undefined}>Todo</a>{options.map(option => <a key={option} href={filterHref(option)} aria-current={active === option ? 'page' : undefined}>{option}</a>)}</nav>
      <div className="treatment-index-grid">{visible.map(post => {
        const media = typeof post.featuredImage === 'object' ? post.featuredImage : null
        const description = getTreatmentExcerpt(post)
        return <article className="treatment-index-card" key={post.id}><a className="treatment-index-image" href={post.path}>{media?.url && <img src={media.url} alt={media.alt || post.title} width={640} height={500} loading="lazy" decoding="async" />}</a><div className="treatment-index-copy"><span className="treatment-index-category">{taxonomyValues(post.categories).join(' · ')}</span><h2><a href={post.path}>{post.title}</a></h2><p>{description}</p><a className="treatment-index-more" href={post.path}>Leer más →</a></div></article>
      })}</div>
      {!visible.length && <p>No hay tratamientos publicados para este filtro.</p>}
    </div>
  </main>
}
