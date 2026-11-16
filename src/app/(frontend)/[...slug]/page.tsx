import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import sanitizeHtml from 'sanitize-html'
import type { Metadata } from 'next'
import ContactForm from '../contact-form'
import GoogleReviews from '../google-reviews'
export const dynamic = 'force-dynamic'
async function getPage(slug: string[]) { const payload = await getPayload({ config }); const path = '/' + slug.join('/') + '/'; const result = await payload.find({ collection: 'content', where: { and: [{ path: { equals: path } }, { visibility: { equals: 'publish' } }] }, limit: 1, overrideAccess: false }); return result.docs[0] }
export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> { const page = await getPage((await params).slug); return page ? { title: page.seoTitle || page.title, description: page.seoDescription || undefined } : {} }
export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) { const page = await getPage((await params).slug); if (!page) notFound(); const html = sanitizeHtml(page.html || '', { allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'iframe']), allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ['src', 'alt', 'width', 'height'], iframe: ['src', 'title', 'allow', 'allowfullscreen', 'width', 'height'] }, allowedIframeHostnames: ['www.youtube.com', 'www.youtube-nocookie.com'] }); return <><main className="article"><h1>{page.title}</h1>{page.kind === 'post' && <p className="byline">{page.authorName && `Por ${page.authorName}`} {page.publishedAt && `· ${new Date(page.publishedAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}`}</p>}<div className="article-content" dangerouslySetInnerHTML={{ __html: html }} />{page.path === '/contacto/' && <ContactForm />}{page.path === '/tratamientos/' && <p><a className="button button-blue" href="/blog/">Ver tratamientos</a></p>}</main>{page.path === '/testimonios/' && <GoogleReviews />}</> }
