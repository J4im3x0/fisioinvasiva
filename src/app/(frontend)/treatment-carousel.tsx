'use client'

import { useEffect, useRef, useState } from 'react'
import type { Swiper as SwiperInstance } from 'swiper'
import { A11y, Autoplay } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'

type Treatment = { title: string; image: string; href: string; description: string }

export default function TreatmentCarousel({ items, title }: { items: Treatment[]; title: string }) {
  const swiper = useRef<SwiperInstance | null>(null)
  const [active, setActive] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      setReducedMotion(preference.matches)
      if (preference.matches) swiper.current?.autoplay.stop()
    }
    update()
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])

  function move(direction: 'prev' | 'next') {
    swiper.current?.autoplay.stop()
    if (direction === 'prev') swiper.current?.slidePrev()
    else swiper.current?.slideNext()
  }

  return <div className="treatment-carousel" onFocusCapture={() => swiper.current?.autoplay.pause()} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) swiper.current?.autoplay.resume() }}>
    <Swiper
      className="treatment-cards"
      aria-label={`Carrusel de ${title.toLowerCase()}`}
      modules={[A11y, Autoplay]}
      slidesPerView={1}
      spaceBetween={14}
      breakpoints={{ 761: { slidesPerView: 2, spaceBetween: 30 }, 1051: { slidesPerView: 3, spaceBetween: 30 } }}
      loop
      speed={reducedMotion ? 0 : 500}
      autoplay={reducedMotion ? false : { delay: 5000, disableOnInteraction: true, pauseOnMouseEnter: true }}
      a11y={{ prevSlideMessage: 'Tratamiento anterior', nextSlideMessage: 'Tratamiento siguiente' }}
      onSwiper={instance => { swiper.current = instance }}
      onSlideChange={instance => setActive(instance.realIndex)}
    >
      {items.map(item => <SwiperSlide key={item.href}><article className="treatment-card">
        <img src={`/brand/${item.image}`} alt="" loading="lazy" />
        <div className="treatment-card-copy"><h3>{item.title}</h3><p>{item.description}</p><a href={item.href} aria-label={`Ver más sobre ${item.title}`}>Ver más</a></div>
      </article></SwiperSlide>)}
    </Swiper>
    <button className="treatment-arrow treatment-arrow-prev" type="button" aria-label={`Tratamientos anteriores: ${title}`} onClick={() => move('prev')}>‹</button>
    <button className="treatment-arrow treatment-arrow-next" type="button" aria-label={`Tratamientos siguientes: ${title}`} onClick={() => move('next')}>›</button>
    <div className="treatment-dots" aria-label={`Páginas de ${title.toLowerCase()}`}>{items.map((_, index) => <button key={index} type="button" aria-label={`Mostrar tratamiento ${index + 1}`} aria-current={active === index ? 'true' : undefined} onClick={() => { swiper.current?.autoplay.stop(); swiper.current?.slideToLoop(index) }} />)}</div>
  </div>
}
