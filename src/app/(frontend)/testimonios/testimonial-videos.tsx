'use client'

import { useState } from 'react'

const videos = [
  { id: '1990iDy-IbE', title: 'Tratamiento interdisciplinario', person: 'Tratamiento', description: 'Tratamiento interdisciplinario dedo en gatillo' },
  { id: 'njM9VPQJuVw', title: 'Bursitis de hombro, puntos gatillo', person: 'Alberto Fuentes', description: 'Dolor de hombro, bursitis, puntos gatillo' },
  { id: 'ShWJpC0crlc', title: 'Pinzamiento de cadera', person: 'Sebastián Montanares', description: 'Caso de pinzamiento de cadera' },
  { id: 'HvLElBs5WBk', title: 'Tendinopatía recto anterior cuádriceps', person: 'Javiera Muñoz', description: 'Tendinopatía del recto anterior cuádriceps' },
  { id: 'BSQhhQ45XYc', title: 'Tendosinovitis bicipital, lesión', person: 'Francisco Tapia', description: 'Tendosinovitis bicipital y lesión de hombro' },
  { id: 'L3g2bf7M-TA', title: 'Tendinopatía insercional', person: 'Rodrigo Campos', description: 'Tendinopatía insercional del tendón de Aquiles' },
  { id: 'RBdzJTlh0aI', title: 'Tendinopatía cálcica del supraespinoso', person: 'Yerko Ghio', description: 'Tendinopatía del supraespinoso y rotuliana' },
  { id: 'bWNeDGavdTw', title: 'Tendinopatía cálcica del supraespinoso', person: 'Soledad Torres', description: 'Tendinopatía en supra e infraespinoso' },
  { id: 'WyWOdveXo9I', title: 'Inflamación crónica de ligamento', person: 'Luis Bravo', description: 'Inflamación crónica de ligamento' },
  { id: '8WYSCk6JmVk', title: 'Dolor crónico y síndrome miofascial', person: 'Paulina Zamorano', description: 'Dolor crónico y síndrome miofascial' },
  { id: '85jEiYubqug', title: 'Tendinopatía supraespinoso', person: 'Daniela Guevara', description: 'Tendinopatía del supraespinoso después de cirugía' },
  { id: 'U5bkA-kg-DA', title: 'Dolor crónico lumbar y de cadera', person: 'Mirna', description: 'Dolor crónico en zona lumbar y cadera' },
]

export default function TestimonialVideos() {
  const [active, setActive] = useState(0)
  const video = videos[active]
  return <div className="testimonial-videos">
    <div className="video-heading"><h3>{video.title}</h3><span>{active + 1} / {videos.length}</span></div>
    <div className="video-frame"><iframe key={video.id} src={`https://www.youtube-nocookie.com/embed/${video.id}`} title={`${video.title} — ${video.person}`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>
    <div className="video-controls"><button type="button" onClick={() => setActive((active + videos.length - 1) % videos.length)} aria-label="Testimonio anterior">‹</button><p><strong>{video.person}</strong><br />{video.description}<br /><a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">Ver en YouTube</a></p><button type="button" onClick={() => setActive((active + 1) % videos.length)} aria-label="Testimonio siguiente">›</button></div>
  </div>
}
