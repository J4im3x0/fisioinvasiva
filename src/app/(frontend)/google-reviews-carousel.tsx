'use client'

import { useEffect, useRef, useState } from 'react'

const defaultReviewUrl = 'https://share.google/ay32o4HwwQOiA1uTV'

type Review = {
  id?: string
  author: string
  photo?: string
  rating?: number
  text?: string
  date?: string
}

type ReviewData = {
  status: string
  rating?: number
  count?: number
  url: string
  reviews?: Review[]
}

export default function GoogleReviews({ fallbackUrl = defaultReviewUrl }: { fallbackUrl?: string }) {
  const section = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const paused = useRef(false)
  const [data, setData] = useState<ReviewData | null>(null)
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(1)
  const [reducedMotion, setReducedMotion] = useState(false)
  const reviews = data?.reviews || []
  const last = Math.max(0, reviews.length - visible)

  useEffect(() => {
    const controller = new AbortController()
    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return
      observer.disconnect()
      fetch('/api/google-reviews', { signal: controller.signal })
        .then(response => response.json())
        .then(setData)
        .catch(() => {})
    }, { rootMargin: '250px' })
    if (section.current) observer.observe(section.current)
    return () => { observer.disconnect(); controller.abort() }
  }, [])

  useEffect(() => {
    const list = track.current
    const card = list?.querySelector('article')
    if (!list || !card) return
    const update = () => {
      const gap = parseFloat(getComputedStyle(list).columnGap) || 0
      setVisible(Math.max(1, Math.floor((list.clientWidth + gap + 1) / (card.getBoundingClientRect().width + gap))))
    }
    const observer = new ResizeObserver(update)
    observer.observe(list)
    update()
    return () => observer.disconnect()
  }, [reviews.length])

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(preference.matches)
    update()
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (last < 1 || reducedMotion) return
    const list = track.current
    if (!list) return
    let inView = false
    const observer = new IntersectionObserver(entries => { inView = entries[0].isIntersecting })
    observer.observe(list)
    const timer = window.setInterval(() => {
      if (inView && !paused.current && !document.hidden) moveTo(active === last ? 0 : active + 1)
    }, 6000)
    return () => { observer.disconnect(); window.clearInterval(timer) }
  }, [active, last, reducedMotion])

  function moveTo(index: number) {
    const list = track.current
    const card = list?.querySelector('article')
    if (!list || !card) return
    const gap = parseFloat(getComputedStyle(list).columnGap) || 0
    const next = Math.max(0, Math.min(last, index))
    list.scrollTo({ left: next * (card.getBoundingClientRect().width + gap), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    setActive(next)
  }

  function updateFromScroll() {
    const list = track.current
    const card = list?.querySelector('article')
    if (!list || !card) return
    const gap = parseFloat(getComputedStyle(list).columnGap) || 0
    setActive(Math.min(last, Math.round(list.scrollLeft / (card.getBoundingClientRect().width + gap))))
  }

  return <section className="google-reviews" id="google-reviews" ref={section}>
    <div className="google-reviews-heading">
      <img src="/brand/google-maps-logo.svg" alt="Google Maps" width="98" height="18" loading="lazy" />
      <h2>Reseñas de pacientes en Google</h2>
      {data?.status === 'ok' && data.rating != null && <p>{data.rating.toLocaleString('es-CL', { maximumFractionDigits: 1 })} de 5 · {data.count?.toLocaleString('es-CL')} reseñas</p>}
      <a className="button button-blue" href={data?.url || fallbackUrl} target="_blank" rel="noopener noreferrer">Ver todas en Google</a>
    </div>
    {data && !reviews.length && <p className="google-reviews-empty">Las reseñas están disponibles en nuestro perfil de Google.</p>}
    {reviews.length > 0 && <div className="google-review-carousel" onMouseEnter={() => { paused.current = true }} onMouseLeave={() => { paused.current = false }} onFocusCapture={() => { paused.current = true }} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) paused.current = false }}>
      {last > 0 && <div className="google-review-controls"><button type="button" aria-label="Reseñas anteriores" onClick={() => moveTo(active === 0 ? last : active - 1)}>‹</button><button type="button" aria-label="Reseñas siguientes" onClick={() => moveTo(active === last ? 0 : active + 1)}>›</button></div>}
      <div className="google-review-list" ref={track} onScroll={updateFromScroll} role="region" aria-label="Reseñas de Google" tabIndex={0}>
        {reviews.map((review, index) => <article key={review.id || `${review.author}-${review.date || index}`}>
          <div className="google-review-source">
            {review.photo ? <img src={review.photo} alt="" width="40" height="40" loading="lazy" /> : <span className="google-review-avatar" aria-hidden="true">{review.author.charAt(0)}</span>}
            <div><strong>{review.author}</strong>{review.date && <small>{new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' }).format(new Date(review.date))}</small>}</div>
          </div>
          <div className="google-review-stars" aria-label={`${review.rating || 0} de 5 estrellas`}>{'★'.repeat(Math.max(0, Math.min(5, Math.round(review.rating || 0))))}</div>
          <p>{review.text || 'Calificación sin comentario.'}</p>
        </article>)}
      </div>
      {last > 0 && last <= 10 && <div className="google-review-dots" aria-label="Páginas de reseñas">{Array.from({ length: last + 1 }, (_, index) => <button key={index} type="button" aria-label={`Ver reseñas desde la ${index + 1}`} aria-current={active === index ? 'true' : undefined} onClick={() => moveTo(index)} />)}</div>}
      <p className="google-review-note">Reseñas de nuestro Perfil de Empresa en Google, ordenadas por actualización y sin filtros.</p>
    </div>}
  </section>
}
