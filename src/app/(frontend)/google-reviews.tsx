import GoogleReviewsCarousel from './google-reviews-carousel'
import RevysControls from './revys-controls'
import { revysReviewsHtml } from '@/lib/revys-reviews'

export default async function GoogleReviews() {
  const widgetId = process.env.REVYS_WIDGET_ID
  const html = widgetId ? await revysReviewsHtml(widgetId) : null
  if (!html) return <GoogleReviewsCarousel />

  // shortcut: Revys controls the HTML classes, so revisit local styles if its fragment changes.
  return <section className="google-reviews google-reviews--revys" id="google-reviews">
    <div className="google-reviews-heading">
      <img src="/brand/google-maps-logo.svg" alt="Google Maps" width="98" height="18" loading="lazy" />
      <h2>Reseñas de pacientes en Google</h2>
      <a className="button button-blue" href="https://share.google/ay32o4HwwQOiA1uTV" target="_blank" rel="noopener noreferrer">Ver todas en Google</a>
    </div>
    <RevysControls />
    <div className="revys-reviews" dangerouslySetInnerHTML={{ __html: html }} />
  </section>
}
