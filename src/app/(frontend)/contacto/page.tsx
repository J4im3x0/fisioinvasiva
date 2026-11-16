import type { Metadata } from 'next'
import ContactForm from '../contact-form'
import { publishedSitePage } from '../published-site-page'

export const dynamic = 'force-dynamic'
export async function generateMetadata(): Promise<Metadata> { const page = await publishedSitePage('/contacto/'); return { title: page.seoTitle || page.title, description: page.seoDescription || undefined } }

export default async function Contacto() {
  await publishedSitePage('/contacto/')
  return <main className="inner-page contact-page"><section className="inner-hero contact-hero">
    <h1>Contacto</h1>
    <div className="contact-columns">
      <div className="contact-details"><span>Dirección</span><h2>Coyancura 2283 oficina 302, Providencia, Santiago</h2><p>9:00AM – 19:00PM Lunes a Sábado</p><a href="mailto:contacto@fisioinvasiva.cl">contacto@fisioinvasiva.cl</a><a href="tel:+56938630890">+56 9 3863 0890</a><a className="section-link" href="https://www.google.com/maps/search/?api=1&query=Coyancura+2283+Providencia+Santiago" target="_blank" rel="noopener noreferrer">Ver en el mapa</a></div>
      <ContactForm />
    </div>
  </section></main>
}
