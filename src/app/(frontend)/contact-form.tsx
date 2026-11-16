'use client'

import { useState, type FormEvent } from 'react'

export default function ContactForm() {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setSending(true)
    setMessage('')
    try {
      const response = await fetch('/api/contact', { method: 'POST', body: new FormData(form) })
      setMessage(await response.text())
      if (response.ok) form.reset()
    } catch {
      setMessage('No pudimos enviar tu mensaje. Llámanos al +56 9 3863 0890.')
    } finally { setSending(false) }
  }

  return <form action="/api/contact" method="post" className="contact-form" onSubmit={send}>
    <span className="contact-form-eyebrow">Formulario de contacto</span>
    <h2>Rellena el formulario para <em>contactarnos</em></h2>
    <label><span className="sr-only">Nombre completo</span><input name="name" placeholder="Nombre completo" required maxLength={120} autoComplete="name" /></label>
    <label><span className="sr-only">Número telefónico</span><input name="phone" type="tel" placeholder="Número telefónico*" required maxLength={40} autoComplete="tel" /></label>
    <label><span className="sr-only">Correo electrónico</span><input name="email" type="email" placeholder="Correo electrónico*" required maxLength={254} autoComplete="email" /></label>
    <label><span className="sr-only">Mensaje</span><textarea name="message" placeholder="Escribe aquí tu mensaje..." required maxLength={4000} /></label>
    <label className="consent"><input name="consent" type="checkbox" required /> Consiento el procesamiento de datos para contacto. *</label>
    <button className="button button-blue" type="submit" disabled={sending}>{sending ? 'Enviando…' : 'Enviar mensaje'}</button>
    <p role="status" aria-live="polite">{message}</p>
  </form>
}
