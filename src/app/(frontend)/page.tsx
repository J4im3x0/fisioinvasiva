import GoogleReviews from './google-reviews'
import TreatmentCarousel from './treatment-carousel'

export const dynamic = 'force-dynamic'

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

export default function Home() {
  return <main>
    <section className="hero">
      <div className="hero-copy"><h1>Somos <span>especialistas</span> y <span>pioneros</span></h1><p>Kinesiología y fisioterapia invasiva con atención personalizada en Providencia.</p><a className="button button-orange" href="/agenda">Agendar hora</a></div>
      <img className="hero-image" src="/brand/portada.webp" alt="Equipo de fisioterapia invasiva" width="520" height="650" fetchPriority="high" />
    </section>
    <section className="about" aria-label="Nuestro enfoque">
      <img className="about-portrait" src="/brand/perfil.webp" alt="Claudia Valenzuela Ríos" loading="lazy" />
      <div className="about-copy"><img className="quote-icon" src="/brand/comentario.webp" alt="" /><h2>Realizamos una terapia única de Fisioterapia invasiva en Chile, la cual se integra en el proceso de rehabilitación de nuestros pacientes con un enfoque personalizado.</h2><p className="signature">Claudia Valenzuela Ríos <span>(PhD. PT. MSc. MOFI.)</span></p><a className="button button-blue" href="/nosotros/">Conócenos</a></div>
    </section>
    <TreatmentSection title="Tratamientos de fisioterapia invasiva ®" description={<>Soluciones avanzadas para el dolor y la recuperación muscular con técnicas de alta precisión como <strong>neuromodulación percutánea, punción seca ecoguiada, electrólisis percutánea y acupuntura clínica.</strong> Evaluación con <strong>ecografía musculoesquelética</strong> para diagnósticos precisos y tratamientos personalizados.</>} items={invasivos} moreTitle="Fisio Invasiva ®" />
    <TreatmentSection title="Tratamientos kinésicos y rehabilitación" description={<>Enfoque integral para la recuperación del movimiento, la reducción del dolor y la mejora de la funcionalidad. Aplicamos técnicas avanzadas como <strong>ejercicio terapéutico, terapia manual y neurodinámica</strong> para optimizar la recuperación. A través de <strong>evaluaciones biomecánicas y electromiografía (EMG)</strong>, diseñamos tratamientos personalizados para cada paciente.</>} items={kinesicos} moreTitle="Kinesiología" />
    <section className="research"><div className="research-inner"><div className="research-heading"><h2>Investigación y pasión</h2><a className="button button-blue" href="/nosotros/">Nuestra experiencia</a></div><div className="research-body"><p>Nuestro interés es colaborar y aportar evidencia científica, es por esto que desarrollamos distintas líneas de investigación, participando en proyectos que serán presentados en Congresos y publicaciones de revistas. Nos asociamos y unimos con profesionales nacionales e internacionales de gran prestigio para colaborar en el desarrollo de la Fisio Invasiva ®. Publicaremos los estudios en los cuales participamos en nuestra página y redes sociales; si quieres participar en algún protocolo, contáctanos a través del formulario de contacto.</p></div></div></section>
    <section className="visit"><img src="/brand/edificio.webp" alt="Edificio donde se encuentra Fisio Invasiva" loading="lazy" width="1509" height="1395" /><div><span className="location-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><path d="M24 42s13-13.5 13-25a13 13 0 1 0-26 0c0 11.5 13 25 13 25Z" stroke="currentColor" strokeWidth="3"/><circle cx="24" cy="17" r="4" stroke="currentColor" strokeWidth="3"/><path d="M19 44h10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg></span><h2>¡Te esperamos! A pasos de metro Los Leones</h2><p>Coyancura 2283 oficina 302,<br />Providencia, Santiago</p><a className="button button-blue" href="/agenda">Agendar hora</a></div></section>
    <section className="pricing"><div className="section-intro"><h2>Valores y convenios</h2><p>Buscamos traer y accesibilizar en medida de lo posible nuestro trabajo que genera resultados y cambia la vida de nuestros pacientes.</p></div><div className="price-grid">
      <article><p>Convenio Fonasa</p><h3>Fisio Invasiva Fonasa</h3><strong>$44.000</strong><ul><li>Precio diferenciado Fonasa</li><li>Realización multitécnica</li><li>Reembolso por orden médica</li><li>Duración de 45 minutos</li></ul><a className="button button-blue" href="/agenda">Agendar hora</a></article>
      <article className="price-highlight"><p>Particular o bono</p><h3>Kinesiología Isapre</h3><strong>$35.000</strong><p>10 sesiones a $31.000 c/u<br />(total $310.000)</p><ul><li>Precio Isapre y Fonasa</li><li>Terapia ajustada</li><li>Reembolso por orden médica</li><li>Duración de 45 minutos</li></ul><a className="button button-light" href="/agenda">Agendar hora</a></article>
      <article><p>Convenio Isapre</p><h3>Fisio Invasiva Isapre</h3><strong>$52.000</strong><ul><li>Precio ajustado Isapre</li><li>Realización multitécnica</li><li>Reembolso por orden médica</li><li>Duración de 45 minutos</li></ul><a className="button button-blue" href="/agenda">Agendar hora</a></article>
    </div></section>
    <section className="testimonials"><div><h2>Testimonios</h2><p>Te invitamos a ver los testimonios y casos de éxito de nuestros pacientes, los cuales han podido vivir la experiencia de la terapia fisio invasiva que se combina con una kinesiología personalizada en cada caso; podrás conocer los resultados y resolutividad.</p><a className="button button-blue" href="/testimonios/">Conoce los testimonios</a></div><div className="reviews"><img src="/brand/reviews.webp" alt="Pacientes de Fisio Invasiva" loading="lazy" /><a className="rating" href="https://share.google/ay32o4HwwQOiA1uTV" aria-label="Ver reseñas de Fisio Invasiva en Google" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">★</span><strong>5,0</strong><small>Estamos orgullosos de nuestros resultados</small></a></div></section>
    <GoogleReviews />
  </main>
}
