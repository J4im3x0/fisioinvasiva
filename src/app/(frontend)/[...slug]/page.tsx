import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import sanitizeHtml from 'sanitize-html'
import type { Metadata } from 'next'
import ContactForm from '../contact-form'
import GoogleReviews from '../google-reviews'
import { taxonomySlug, taxonomyValues } from '@/lib/treatment-taxonomy'

export const dynamic = 'force-dynamic'
async function getPage(slug: string[]) {
  const payload = await getPayload({ config })
  const path = '/' + slug.join('/') + '/'
  const result = await payload.find({ collection: 'content', where: { and: [{ path: { equals: path } }, { visibility: { equals: 'publish' } }] }, limit: 1, overrideAccess: false })
  return result.docs[0]
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const page = await getPage((await params).slug)
  return page ? { title: page.seoTitle || page.title, description: page.seoDescription || undefined } : {}
}
export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const page = await getPage((await params).slug)
  if (!page) notFound()
  const html = sanitizeHtml(page.html || '', { allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'iframe', 'section', 'aside']), allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, div: ['class'], section: ['class'], ul: ['class'], aside: ['class'], img: ['src', 'alt', 'width', 'height', 'loading'], iframe: ['src', 'title', 'allow', 'allowfullscreen', 'width', 'height', 'loading'] }, allowedIframeHostnames: ['www.youtube.com', 'www.youtube-nocookie.com'] })
  if (page.kind === 'post') {
    const categories = taxonomyValues(page.categories), tags = taxonomyValues(page.tags)
    return <main className="treatment-article"><header className="directory-heading"><h1>{page.title}</h1><nav aria-label="Ruta de navegación"><a href="/">Inicio</a><span>›</span><a href="/tratamientos/">Tratamientos</a>{categories[0] && <><span>›</span><a href={`/tratamientos/${taxonomySlug(categories[0])}/`}>{categories[0]}</a></>}<span>›</span><span>{page.title}</span></nav></header><div className="treatment-article-inner"><div className="treatment-article-meta">{page.authorName && <span>Publicado por {page.authorName}</span>}{page.publishedAt && <time dateTime={page.publishedAt}>{new Date(page.publishedAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</time>}</div><div className="treatment-taxonomy">{categories.length > 0 && <div><strong>Categorías</strong>{categories.map(category => <a key={category} href={`/tratamientos/${taxonomySlug(category)}/`}>{category}</a>)}</div>}{tags.length > 0 && <div><strong>Tags</strong>{tags.map(tag => <a key={tag} href={`/tag/${taxonomySlug(tag)}/`}>{tag}</a>)}</div>}</div><div className="article-content treatment-content" dangerouslySetInnerHTML={{ __html: html }} /><div className="treatment-article-cta"><h2>¿Necesitas orientación para tu tratamiento?</h2><a className="button button-blue" href="/agenda">Agendar hora</a></div></div></main>
  }
  return <><main className="article"><h1>{page.title}</h1><div className="article-content" dangerouslySetInnerHTML={{ __html: html }} />{page.path === '/contacto/' && <ContactForm />}{page.path === '/tratamientos/' && <p><a className="button button-blue" href="/blog/">Ver tratamientos</a></p>}</main>{page.path === '/testimonios/' && <GoogleReviews />}</>
}
