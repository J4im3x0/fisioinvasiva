import type { Metadata } from 'next'
import { publishedSitePage } from '../published-site-page'
import { getSiteSettings } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'
export async function generateMetadata(): Promise<Metadata> { const page = await publishedSitePage('/nosotros/'); return { title: page.seoTitle || page.title, description: page.seoDescription || undefined } }

const values = [
  { title: 'Estudios', text: 'Demostramos nuestros conocimientos', icon: 'nosotros-estudios.svg' },
  { title: 'Pasión', text: 'Nos apasiona el poder ayudar a la gente e influir positivamente', icon: 'nosotros-pasion.svg' },
  { title: 'Cercanía', text: 'Te ofrecemos cercanía y confianza como nadie', icon: 'nosotros-cercania.svg' },
  { title: 'Experiencia', text: 'Somos lo que somos gracias a nuestros pacientes', icon: 'nosotros-experiencia.svg' },
]

const claudiaBio = 'Doctora con mención CUM LADE en Ciencias de la Salud, línea de investigación en Neuromodulación Percutánea. Universidad Rey Juan Carlos, Madrid, España. Máster Oficial de Fisioterapia Invasiva, Universidad San Pablo CEU, Madrid. Magíster en Ciencias del Deporte y Salud, mención kinesiología deportiva, Universidad Finis Terrae. Formación en Ecografía Musculoesquelética en la Latin American School of Ultrasound-LASUS. Certificada en Ecografía Musculoesquelética MUP. Diplomado en Kinesiología Oncológica, Universidad de Chile. Postítulo en Cuidados Paliativos, Universidad de Chile. Certificación Vascular Periférico método Leduc, Universidad de Buenos Aires. Certificación Drenaje Linfático Godoy & Godoy, Universidad Finis Terrae. Diplomado en Terapia Manual, Universidad Santo Tomás. Diplomado en Articulación ATM y Disfunciones Temporomandibulares en niños, Universidad Andrés Bello. Neurodinámica Clínica de la Extremidad Superior e Inferior. Formación continua en control motor y dolor crónico y en Academia IAOM. Presidenta de la Sociedad Científica de Fisioterapia Invasiva y Ecografía Musculoesquelética (SOCHFIN), Colegio de Kinesiólogos de Chile.'

export default async function Nosotros() {
  const [, settings] = await Promise.all([publishedSitePage('/nosotros/'), getSiteSettings()])
  return <main className="inner-page about-page">
    <section className="inner-hero about-hero">
      <h1>Nosotros - Conoce Fisio Invasiva</h1>
      <div className="about-intro">
        <img src="/brand/nosotros-perfil.webp" alt="Claudia Valenzuela Ríos" width="780" height="841" />
        <div><h2>En Fisio Invasiva creemos que la rehabilitación va más allá del tratamiento: es cercanía, escucha y compromiso. Somos kinesiólogos especializados, siempre enfocados en tu bienestar.</h2><p>Claudia Valenzuela Ríos (PhD. PT. MSc. MOFI.)</p></div>
      </div>
      <div className="about-values">{values.map(value => <article key={value.title}><img src={`/brand/${value.icon}`} alt="" width="56" height="56" /><h3>{value.title}</h3><p>{value.text}</p></article>)}</div>
    </section>
    <section className="about-team" aria-label="Nuestro equipo">
      <article className="team-member"><img src="/brand/nosotros-claudia.webp" alt="Claudia Valenzuela Ríos" width="780" height="978" /><div><h2>Claudia Valenzuela Ríos</h2><strong>Fisio Invasiva Chile, CEO y Directora</strong><p>{claudiaBio}</p><a href="https://www.linkedin.com/in/claudia-valenzuela-r%C3%ADos-a6882838/" target="_blank" rel="noopener noreferrer">Claudia en LinkedIn</a></div></article>
      <article className="team-member team-member-reverse"><div><h2>Benito Torres</h2><strong>Profesional Fisio Invasiva</strong><p>Kinesiólogo</p><a href="https://www.linkedin.com/in/benito-torres-a3417bb7" target="_blank" rel="noopener noreferrer">Benito en LinkedIn</a></div><img src="/brand/nosotros-benito.webp" alt="Benito Torres" width="780" height="978" /></article>
    </section>
    <section className="inner-cta"><h2>Si deseas atención, agenda aquí</h2><a className="button button-light" href="/agenda">{settings.bookingCtaText}</a></section>
  </main>
}
