import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { getPayloadPopulateFn } from '@payloadcms/richtext-lexical'
import { convertLexicalToHTMLAsync } from '@payloadcms/richtext-lexical/html-async'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import ContactForm from '../contact-form'
import GoogleReviews from '../google-reviews'
import TreatmentSections from '../treatment-sections'
import { taxonomySlug, taxonomyValues } from '@/lib/treatment-taxonomy'
import { sanitizeContentHtml } from '@/lib/sanitize-content-html'
import { getSiteSettings, recordSiteEvent } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'
const getPage = cache(async (path: string, previewRequested = false) => {
  const payload = await getPayload({ config })
  let preview = false
  if (previewRequested) {
    try { preview = Boolean((await payload.auth({ headers: await headers() })).user) } catch { /* invalid session */ }
  }
  const result = await payload.find({ collection: 'content', where: { and: [{ path: { equals: path } }, ...(preview ? [] : [{ visibility: { equals: 'publish' as const } }]) ] }, limit: 1, overrideAccess: preview, depth: 1 })
  return { page: result.docs[0], preview, payload }
})
export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string[] }>; searchParams: Promise<{ preview?: string }> }): Promise<Metadata> {
  const requested = (await searchParams).preview === 'visual'
  const path = '/' + (await params).slug.join('/') + '/'
  const { page } = await getPage(path, requested)
  return page ? { title: page.seoTitle || page.title, description: page.seoDescription || undefined, robots: requested ? { index: false, follow: false } : undefined } : {}
}
export default async function Page({ params, searchParams }: { params: Promise<{ slug: string[] }>; searchParams: Promise<{ preview?: string }> }) {
  const path = '/' + (await params).slug.join('/') + '/'
  const { page, preview, payload } = await getPage(path, (await searchParams).preview === 'visual')
  if (!page) notFound()
  const useEditable = preview || page.useVisualEditor || !page.html
  const source = page.body && useEditable
    ? await convertLexicalToHTMLAsync({ data: page.body, populate: await getPayloadPopulateFn({ payload, currentDepth: 0, depth: 1 }) })
    : page.html || ''
  const html = sanitizeContentHtml(source)
  if (page.kind === 'post') {
    if (!preview) void recordSiteEvent({ kind: 'treatment_view', path: page.path, label: page.title }, payload)
    const settings = await getSiteSettings(payload)
    const categories = taxonomyValues(page.categories), tags = taxonomyValues(page.tags)
    return <main className="treatment-article">{preview && <p className="editor-preview-notice">Vista previa del contenido editable. Guarda los cambios en Payload para verlos aquí; esta vista no cambia la página pública.</p>}<header className="directory-heading"><h1>{page.title}</h1><nav aria-label="Ruta de navegación"><a href="/">Inicio</a><span>›</span><a href="/tratamientos/">Tratamientos</a>{categories[0] && <><span>›</span><a href={`/tratamientos/${taxonomySlug(categories[0])}/`}>{categories[0]}</a></>}<span>›</span><span>{page.title}</span></nav></header><div className="treatment-article-inner">{page.publishedAt && <div className="treatment-article-meta"><time dateTime={page.publishedAt}>{new Date(page.publishedAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</time></div>}<div className="treatment-taxonomy">{categories.length > 0 && <div><strong>Categorías</strong>{categories.map(category => <a key={category} href={`/tratamientos/${taxonomySlug(category)}/`}>{category}</a>)}</div>}{tags.length > 0 && <div><strong>Tags</strong>{tags.map(tag => <a key={tag} href={`/tag/${taxonomySlug(tag)}/`}>{tag}</a>)}</div>}</div>{useEditable && page.sections?.length ? <TreatmentSections sections={page.sections} payload={payload} /> : <div className="article-content treatment-content" dangerouslySetInnerHTML={{ __html: html }} />}<div className="treatment-article-cta"><h2>¿Necesitas orientación para tu tratamiento?</h2><a className="button button-blue" href="/agenda">{settings.bookingCtaText}</a></div></div></main>
  }
  return <><main className="article"><h1>{page.title}</h1><div className="article-content" dangerouslySetInnerHTML={{ __html: html }} />{page.path === '/contacto/' && <ContactForm />}</main>{page.path === '/testimonios/' && <GoogleReviews />}</>
}
