import type { Metadata } from 'next'
import ContactForm from '../contact-form'
import { publishedSitePage } from '../published-site-page'
import { getSiteSettings, phoneHref } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'
export async function generateMetadata(): Promise<Metadata> {
  const page = await publishedSitePage('/contacto/')
  return { title: page.seoTitle || page.title, description: page.seoDescription || undefined }
}

export default async function Contacto() {
  const [, settings] = await Promise.all([publishedSitePage('/contacto/'), getSiteSettings()])
  return (
    <main className="inner-page contact-page">
      <section className="inner-hero contact-hero">
        <h1>Contacto</h1>
        <div className="contact-columns">
          <div className="contact-details">
            <span>Dirección</span>
            <h2>{settings.address}</h2>
            <p>{settings.hours}</p>
            <a href={`mailto:${settings.email}`}>{settings.email}</a>
            <a href={phoneHref(settings.phoneDisplay)}>{settings.phoneDisplay}</a>
            <a className="section-link" href={settings.mapsUrl} target="_blank" rel="noopener noreferrer">
              Ver en el mapa
            </a>
          </div>
          <ContactForm />
        </div>
      </section>
    </main>
  )
}
