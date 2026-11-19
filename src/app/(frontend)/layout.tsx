import './styles.css'
import './institutional.css'
import './refinement.css'
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { DesktopNav, MobileMenu } from './site-nav'
import WhatsAppWidget from './whatsapp-widget'
import { buildWhatsAppUrl, getSiteSettings, phoneHref } from '@/lib/site-settings'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Fisio Invasiva | Kinesiología y fisioterapia invasiva',
  description: 'Atención personalizada de kinesiología y fisioterapia invasiva en Providencia.',
}
const links = [
  { href: '/', text: 'Inicio' },
  { href: '/tratamientos/', text: 'Tratamientos' },
  { href: '/nosotros/', text: 'Nosotros' },
  { href: '/testimonios/', text: 'Testimonios' },
  { href: '/contacto/', text: 'Contacto' },
]
const menuLinks = [...links, { href: '/blog/', text: 'Blog' }]

export default async function Layout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()
  const telHref = phoneHref(settings.phoneDisplay)
  const whatsappUrl = settings.whatsappEnabled
    ? buildWhatsAppUrl(settings.whatsappPhone, settings.whatsappPrefillMessage)
    : null

  return (
    <html lang="es-CL">
      <body className={jakarta.className}>
        <header className="header">
          <div className="header-inner">
            <MobileMenu links={menuLinks} />
            <a className="brand" href="/" aria-label="Fisio Invasiva, inicio">
              <img src="/brand/logo.webp" alt="Fisio Invasiva" />
            </a>
            <DesktopNav links={links} />
            <a className="header-phone" href={telHref}>
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <circle cx="10" cy="10" r="9" fill="currentColor" />
                <path
                  d="M6.1 5.7c-.6.6-.6 1.7.1 3.2 1 2.2 2.7 3.9 4.9 4.9 1.5.7 2.6.7 3.2.1l.8-1.2-2.4-1.7-1.1 1c-1.3-.6-2.3-1.6-2.9-2.9l1-1.1L8 5.6l-1.9.1Z"
                  fill="#fff"
                />
              </svg>
              {settings.phoneDisplay}
            </a>
            <a className="button button-blue header-cta" href="/agenda">
              {settings.bookingCtaText}
            </a>
          </div>
        </header>
        {children}
        <footer>
          <div className="footer-contact">
            <a className="footer-brand" href="/" aria-label="Fisio Invasiva, inicio">
              <img src="/brand/logo.webp" alt="" loading="lazy" width="180" height="100" />
            </a>
            <p>{settings.address}</p>
            <p>{settings.hours}</p>
            <p>
              <a href={telHref}>{settings.phoneDisplay}</a>
            </p>
            <div className="footer-social">
              <a
                href={settings.instagramUrl}
                aria-label="Instagram de Fisio Invasiva"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                </svg>
              </a>
            </div>
          </div>
          <div className="footer-links">
            <strong>Explora</strong>
            {[links[2], links[4], links[1], links[3], menuLinks[5]].map(link => (
              <a key={link.href} href={link.href}>
                {link.text}
              </a>
            ))}
          </div>
          <p className="copyright">
            © {new Date().getFullYear()} <a href="/">Fisio Invasiva ®</a> · Todos los derechos reservados ·{' '}
            <a href="/privacidad/">Políticas de privacidad</a>
          </p>
        </footer>
        <a className="mobile-cta" href="/agenda">
          {settings.bookingCtaText}
        </a>
        {whatsappUrl && (
          <WhatsAppWidget
            href={whatsappUrl}
            headerTitle={settings.whatsappHeaderTitle}
            greeting1={settings.whatsappGreeting1}
            greeting2={settings.whatsappGreeting2}
            buttonText={settings.whatsappButtonText}
          />
        )}
      </body>
    </html>
  )
}
