'use client'

import { useEffect, useRef, useState } from 'react'
import type { Swiper as SwiperInstance } from 'swiper'
import { A11y } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'

type Treatment = { title: string; image: string; href: string; description: string }

export default function TreatmentCarousel({ items, title }: { items: Treatment[]; title: string }) {
  const swiper = useRef<SwiperInstance | null>(null)
  const [active, setActive] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(preference.matches)
    update()
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])

  function move(direction: 'prev' | 'next') {
    if (direction === 'prev') swiper.current?.slidePrev()
    else swiper.current?.slideNext()
  }

  return <div className="treatment-carousel" role="region" aria-roledescription="carrusel" aria-label={title}>
    <Swiper
      className="treatment-cards"
      aria-label={`Carrusel de ${title.toLowerCase()}`}
      modules={[A11y]}
      slidesPerView={1}
      spaceBetween={14}
      breakpoints={{ 761: { slidesPerView: 2, spaceBetween: 30 }, 1051: { slidesPerView: 3, spaceBetween: 30 } }}
      loop
      speed={reducedMotion ? 0 : 500}
      a11y={{ prevSlideMessage: 'Tratamiento anterior', nextSlideMessage: 'Tratamiento siguiente' }}
      onSwiper={instance => { swiper.current = instance }}
      onSlideChange={instance => setActive(instance.realIndex)}
    >
      {items.map((item, index) => <SwiperSlide key={item.href} role="group" aria-roledescription="diapositiva" aria-label={`${index + 1} de ${items.length}`}><article className="treatment-card">
        <a className="treatment-card-image" href={item.href} tabIndex={-1} aria-hidden="true">
          <img src={`/brand/${item.image}`} alt={item.title} width={600} height={387} loading="lazy" decoding="async" />
        </a>
        <div className="treatment-card-copy">
          <h3><a className="treatment-card-title" href={item.href}>{item.title}</a></h3>
          <p>{item.description}</p>
          <a className="treatment-card-more" href={item.href} aria-label={`Ver más sobre ${item.title}`}>Ver más</a>
        </div>
      </article></SwiperSlide>)}
    </Swiper>
    <button className="treatment-arrow treatment-arrow-prev" type="button" aria-label={`Tratamientos anteriores: ${title}`} onClick={() => move('prev')}>‹</button>
    <button className="treatment-arrow treatment-arrow-next" type="button" aria-label={`Tratamientos siguientes: ${title}`} onClick={() => move('next')}>›</button>
    <div className="treatment-dots" aria-label={`Páginas de ${title.toLowerCase()}`}>{items.map((_, index) => <button key={index} type="button" aria-label={`Mostrar tratamiento ${index + 1}`} aria-current={active === index ? 'true' : undefined} onClick={() => swiper.current?.slideToLoop(index)} />)}</div>
  </div>
}
