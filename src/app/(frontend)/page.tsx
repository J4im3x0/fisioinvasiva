import GoogleReviews from './google-reviews'
import TreatmentCarousel from './treatment-carousel'
import { getSiteSettings, parseInlineBold } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

const convenios = [
  { name: 'Isapre Colmena', logo: '/brand/convenios/colmena.webp', width: 238, height: 64 },
  { name: 'Isapre CruzBlanca', logo: '/brand/convenios/cruzblanca.webp', width: 253, height: 86 },
  { name: 'Isapre Nueva Masvida', logo: '/brand/convenios/nuevamasvida.webp', width: 216, height: 76 },
  { name: 'Isapre Consalud', logo: '/brand/convenios/consalud.webp', width: 271, height: 94 },
  { name: 'Isapre Banmédica', logo: '/brand/convenios/banmedica.webp', width: 198, height: 66 },
  { name: 'Isapre Vida Tres', logo: '/brand/convenios/vidatres.webp', width: 235, height: 59 },
  { name: 'Fonasa', logo: '/brand/convenios/fonasa.svg', width: 240, height: 82 },
]

const invasivos = [
  { title: 'Electrólisis percutánea', image: 'electrolisis.webp', href: '/electrolisis-percutanea/', description: 'Electrólisis percutánea (EPI-EPM ECO ®). Técnica efectiva y de rápida aplicación.' },
  { title: 'Ecografía musculoesquelética', image: 'ecografia.webp', href: '/ecografia-musculoesqueletica/', description: 'Ecografía musculoesquelética (ECO MSK ®).' },
  { title: 'Punción seca', image: 'puncion.webp', href: '/puncion-seca/', description: 'Punción seca ecoguiada (PS Eco ®). Técnica aplicada con conjunto a un ecógrafo.' },
  { title: 'Acupuntura clínica', image: 'acupuntura.webp', href: '/acupuntura-clinica/', description: 'Acupuntura basada en métodos de la medicina china.' },
  { title: 'Neuromodulación percutánea', image: 'neuromodulacion.webp', href: '/neuromodulacion-percutanea/', description: 'Neuromodulación percutánea ecoguiada.' },
]
const kinesicos = [
  { title: 'Neuromodulación magnética (SIS)', image: 'sis.webp', href: '/neuromodulacion-magnetica/', description: 'Sistema de estimulación electromagnética.' },
  { title: 'Educación del dolor', image: 'educacion-dolor.webp', href: '/educacion-del-dolor/', description: 'Comprender el dolor es parte del tratamiento.' },
  { title: 'Terapia manual ortopédica y movilización miofascial', image: 'terapia-manual.webp', href: '/terapia-manual-ortopedica/', description: 'Evaluación y tratamiento manual musculoesquelético.' },
  { title: 'Neurodinámica clínica', image: 'neurodinamica.webp', href: '/neurodinamica-clinica/', description: 'Funciones biomecánicas, fisiológicas y morfológicas.' },
  { title: 'Programa activo', image: 'programa-activo.webp', href: '/programa-activo/', description: 'Ejercicio terapéutico y control motor.' },
]

function TreatmentSection({ title, description, items, moreTitle }: { title: string; description: React.ReactNode; items: typeof invasivos; moreTitle: string }) {
  return <section className="treatments" aria-label={title}>
    <div className="section-intro"><h2>{title}</h2><p>{description}</p></div>
    <TreatmentCarousel items={items} title={title} />
    <div className="treatment-more"><h3>Conoce más de <span>{moreTitle}</span></h3><a className="section-link" href="/tratamientos/">Conoce todos los tratamientos</a></div>
  </section>
}

export default async function Home() {
  const settings = await getSiteSettings()
  const heroTitleParts = parseInlineBold(settings.heroTitle)

  return <main>
    <link rel="preload" as="image" href="/brand/fondo-azul.webp" fetchPriority="high" />
    <section className="hero">
      <div className="hero-copy">
        <h1>
          {heroTitleParts.map((part, idx) =>
            part.bold ? <span key={idx}>{part.text}</span> : part.text,
          )}
        </h1>
        <p>{settings.heroSubtitle}</p>
        <a className="button button-orange" href="/agenda">{settings.bookingCtaText}</a>
      </div>
      <img className="hero-image" src="/brand/portada.webp" alt="Equipo de fisioterapia invasiva" width="464" height="580" fetchPriority="high" />
    </section>
    <section className="about" aria-label="Nuestro enfoque">
      <img className="about-portrait" src="/brand/perfil.webp" alt={settings.aboutSignature} width="400" height="431" loading="lazy" />
      <div className="about-copy">
        <img className="quote-icon" src="/brand/comentario.webp" alt="" width="82" height="75" loading="lazy" />
        <h2>{settings.aboutQuote}</h2>
        <p className="signature">
          {settings.aboutSignature}
          {settings.aboutCredentials && <> <span>{settings.aboutCredentials}</span></>}
        </p>
        <a className="button button-blue" href="/nosotros/">Conócenos</a>
      </div>
    </section>
    <TreatmentSection title="Tratamientos de fisioterapia invasiva ®" description={<>Soluciones avanzadas para el dolor y la recuperación muscular con técnicas de alta precisión como <strong>neuromodulación percutánea, punción seca ecoguiada, electrólisis percutánea y acupuntura clínica.</strong> Evaluación con <strong>ecografía musculoesquelética</strong> para diagnósticos precisos y tratamientos personalizados.</>} items={invasivos} moreTitle="Fisio Invasiva ®" />
    <TreatmentSection title="Tratamientos kinésicos y rehabilitación" description={<>Enfoque integral para la recuperación del movimiento, la reducción del dolor y la mejora de la funcionalidad. Aplicamos técnicas avanzadas como <strong>ejercicio terapéutico, terapia manual y neurodinámica</strong> para optimizar la recuperación. A través de <strong>evaluaciones biomecánicas y electromiografía (EMG)</strong>, diseñamos tratamientos personalizados para cada paciente.</>} items={kinesicos} moreTitle="Kinesiología" />
    <section className="research"><div className="research-inner"><div className="research-heading"><h2>Investigación y pasión</h2><a className="button button-blue" href="/nosotros/">Nuestra experiencia</a></div><div className="research-body"><p>Nuestro interés es colaborar y aportar evidencia científica, es por esto que desarrollamos distintas líneas de investigación, participando en proyectos que serán presentados en Congresos y publicaciones de revistas. Nos asociamos y unimos con profesionales nacionales e internacionales de gran prestigio para colaborar en el desarrollo de la Fisio Invasiva ®. Publicaremos los estudios en los cuales participamos en nuestra página y redes sociales; si quieres participar en algún protocolo, contáctanos a través del formulario de contacto.</p></div></div></section>
    <section className="visit">
      <img src="/brand/edificio.webp" alt="Edificio donde se encuentra Fisio Invasiva" loading="lazy" width="1509" height="1395" />
      <div>
        <span className="location-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><path d="M24 42s13-13.5 13-25a13 13 0 1 0-26 0c0 11.5 13 25 13 25Z" stroke="currentColor" strokeWidth="3"/><circle cx="24" cy="17" r="4" stroke="currentColor" strokeWidth="3"/><path d="M19 44h10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg></span>
        <h2>{settings.visitHeading}</h2>
        <p>{settings.address}</p>
        <a className="button button-blue" href="/agenda">{settings.bookingCtaText}</a>
      </div>
    </section>
    <section className="pricing">
      <div className="section-intro">
        <h2>Valores y convenios</h2>
        <p>{settings.pricingIntro}</p>
      </div>
      <div className="price-grid">
        {settings.pricingPlans.map((plan, index) => (
          <article className={plan.highlighted ? 'price-highlight' : undefined} key={plan.id || `${plan.title}-${index}`}>
            {plan.badge && <p>{plan.badge}</p>}
            <h3>{plan.title}</h3>
            <strong>{plan.price}</strong>
            {plan.subnote && (
              <p>
                {plan.subnote.split(/\r?\n/).map((line, i) => (
                  <span key={i}>
                    {i > 0 && <br />}
                    {line}
                  </span>
                ))}
              </p>
            )}
            {plan.features.length > 0 && (
              <ul>
                {plan.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            )}
            <a className={`button ${plan.highlighted ? 'button-light' : 'button-blue'}`} href="/agenda">
              {settings.bookingCtaText}
            </a>
          </article>
        ))}
      </div>
      <div className="reimbursement-card" aria-label="Reembolso con Isapres y convenio Fonasa">
        <div className="reimbursement-copy">
          <span className="reimbursement-eyebrow">Modalidad particular con reembolso</span>
          <h3>Reembolsable con Isapre</h3>
          <p>
            Las sesiones se abonan de forma particular y emitimos boleta de kinesiología para que puedas{' '}
            <strong>reembolsar en todas las Isapres y seguros complementarios</strong> presentando tu orden médica.
          </p>
        </div>
        <ul className="reimbursement-logos" aria-label="Isapres y Fonasa">
          {convenios.map(item => (
            <li key={item.name} className="reimbursement-logo-item">
              <img
                src={item.logo}
                alt={item.name}
                width={item.width}
                height={item.height}
                loading="lazy"
                decoding="async"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
    <section className="testimonials"><div><h2>Testimonios</h2><p>Te invitamos a ver los testimonios y casos de éxito de nuestros pacientes, los cuales han podido vivir la experiencia de la terapia fisio invasiva que se combina con una kinesiología personalizada en cada caso; podrás conocer los resultados y resolutividad.</p><a className="button button-blue" href="/testimonios/">Conoce los testimonios</a></div><div className="reviews"><img src="/brand/reviews.webp" alt="Pacientes de Fisio Invasiva" width="780" height="605" loading="lazy" /><a className="rating" href={settings.googleReviewsUrl} aria-label="Ver reseñas de Fisio Invasiva en Google" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">★</span><strong>5,0</strong><small>Estamos orgullosos de nuestros resultados</small></a></div></section>
    <GoogleReviews reviewUrl={settings.googleReviewsUrl} />
  </main>
}
