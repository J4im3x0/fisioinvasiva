import type { Metadata } from 'next'
import GoogleReviews from '../google-reviews'
import TestimonialVideos from './testimonial-videos'
import { publishedSitePage } from '../published-site-page'

export const dynamic = 'force-dynamic'
export async function generateMetadata(): Promise<Metadata> { const page = await publishedSitePage('/testimonios/'); return { title: page.seoTitle || page.title, description: page.seoDescription || undefined } }

export default async function Testimonios() {
  await publishedSitePage('/testimonios/')
  return <main className="inner-page testimonials-page">
    <section className="inner-hero testimonials-hero"><h1>Testimonios</h1><div className="testimonials-intro"><div><h2>Conoce los testimonios y reseñas de nuestros pacientes</h2><ul><li>Atención integral</li><li>Tratamiento ajustado</li><li>Personal profesional</li><li>Gente cercana</li><li>Metodología y técnica</li></ul></div><img src="/brand/pagina-testimonios.webp" alt="Tratamiento de fisioterapia invasiva" width="1094" height="1200" /></div></section>
    <section className="inner-hero testimonial-media"><h2>Testimonios en <span>YouTube</span></h2><TestimonialVideos /><GoogleReviews /></section>
  </main>
}
