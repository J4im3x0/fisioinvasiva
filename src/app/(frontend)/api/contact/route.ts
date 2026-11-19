import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { getSiteSettings, recordSiteEvent } from '@/lib/site-settings'

export async function POST(request: NextRequest) {
  const settings = await getSiteSettings()
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASSWORD ||
    !process.env.CONTACT_TO ||
    !process.env.CONTACT_FROM
  ) {
    return new NextResponse(`El formulario no está configurado. Llámanos al ${settings.phoneDisplay}.`, {
      status: 503,
    })
  }
  if (Number(request.headers.get('content-length') || 0) > 20000) {
    return new NextResponse('Mensaje demasiado largo.', { status: 413 })
  }
  const form = await request.formData()
  const read = (key: string) => String(form.get(key) || '').trim()
  const name = read('name')
  const email = read('email')
  const phone = read('phone')
  const message = read('message')
  if (
    !name ||
    name.length > 120 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    !phone ||
    phone.length > 40 ||
    !message ||
    message.length > 4000 ||
    !form.get('consent')
  ) {
    return new NextResponse('Revisa los datos y vuelve a intentarlo.', { status: 400 })
  }
  try {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_PORT === '465',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    })
    await transport.sendMail({
      from: process.env.CONTACT_FROM,
      to: process.env.CONTACT_TO,
      replyTo: email,
      subject: 'Contacto desde Fisio Invasiva',
      text: `Nombre: ${name}\nTeléfono: ${phone}\nCorreo: ${email}\n\n${message}`,
    })
    void recordSiteEvent({ kind: 'contact_submit', path: '/contacto/' })
    return new NextResponse('Gracias. Tu mensaje fue enviado.', { status: 200 })
  } catch {
    return new NextResponse(`No pudimos enviar tu mensaje. Llámanos al ${settings.phoneDisplay}.`, {
      status: 503,
    })
  }
}
