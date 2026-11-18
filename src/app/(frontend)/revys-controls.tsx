'use client'

export default function RevysControls() {
  function move(direction: -1 | 1) {
    const list = document.querySelector<HTMLElement>('#google-reviews .revys-w__list')
    const card = list?.querySelector<HTMLElement>('.revys-w__card')
    if (!list || !card) return
    const gap = parseFloat(getComputedStyle(list).columnGap) || 0
    const step = card.getBoundingClientRect().width + gap
    const visible = Math.max(1, Math.round((list.clientWidth + gap) / step))
    const last = Math.max(0, list.querySelectorAll('.revys-w__card').length - visible)
    const current = Math.round(list.scrollLeft / step)
    const next = current + direction > last ? 0 : current + direction < 0 ? last : current + direction
    list.scrollTo({ left: next * step, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }

  return <div className="revys-controls" aria-label="Controles de reseñas">
    <button type="button" aria-label="Reseñas anteriores" onClick={() => move(-1)}>‹</button>
    <button type="button" aria-label="Reseñas siguientes" onClick={() => move(1)}>›</button>
  </div>
}
