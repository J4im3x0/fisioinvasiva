import './styles.css'
import './institutional.css'
import type { Metadata } from 'next'
import { treatmentCategories, taxonomySlug } from '@/lib/treatment-taxonomy'

export const metadata: Metadata = { title: 'Fisio Invasiva | Kinesiología y fisioterapia invasiva', description: 'Atención personalizada de kinesiología y fisioterapia invasiva en Providencia.' }
const links = [{ href: '/', text: 'Inicio' }, { href: '/tratamientos/', text: 'Tratamientos' }, { href: '/nosotros/', text: 'Nosotros' }, { href: '/testimonios/', text: 'Testimonios' }, { href: '/contacto/', text: 'Contacto' }]
const menuLinks = [...links, { href: '/blog/', text: 'Blog' }]
export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="es-CL"><body>
    <header className="header">
      <div className="header-inner">
      <details className="mobile-menu"><summary aria-label="Abrir menú"><span></span><span></span><span></span></summary><nav aria-label="Navegación del menú">{menuLinks.map(link => <div key={link.href}><a href={link.href}>{link.text}</a>{link.text === 'Tratamientos' && <div className="mobile-treatment-links">{treatmentCategories.map(category => <a key={category} href={`/tratamientos/${taxonomySlug(category)}/`}>{category}</a>)}</div>}</div>)}</nav></details>
      <a className="brand" href="/" aria-label="Fisio Invasiva, inicio"><img src="/brand/logo.webp" alt="Fisio Invasiva" /></a>
      <nav className="desktop-nav" aria-label="Navegación principal">{links.map(link => link.text === 'Tratamientos' ? <div className="nav-treatment" key={link.href}><a href={link.href}>{link.text}</a><div className="nav-treatment-menu">{treatmentCategories.map(category => <a key={category} href={`/tratamientos/${taxonomySlug(category)}/`}>{category}</a>)}</div></div> : <a key={link.href} href={link.href}>{link.text}</a>)}</nav>
      <a className="header-phone" href="tel:+56938630890"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="currentColor"/><path d="M6.1 5.7c-.6.6-.6 1.7.1 3.2 1 2.2 2.7 3.9 4.9 4.9 1.5.7 2.6.7 3.2.1l.8-1.2-2.4-1.7-1.1 1c-1.3-.6-2.3-1.6-2.9-2.9l1-1.1L8 5.6l-1.9.1Z" fill="#fff"/></svg>+56 9 3863 0890</a>
      <a className="button button-blue header-cta" href="/agenda">Agendar hora</a>
      </div>
    </header>
    {children}
    <footer><div className="footer-contact"><p>Coyancura 2283 oficina 302,<br />Providencia, Santiago</p><p>9:00AM - 19:00PM Lunes a Sábado</p><p><a href="tel:+56938630890">+56 9 3863 0890</a></p><div className="footer-social"><a href="https://www.instagram.com/terapia_fisioinvasiva/" aria-label="Instagram de Fisio Invasiva" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg></a></div></div><div className="footer-links"><strong>Enlaces</strong>{[links[2], links[4], links[1], links[3], menuLinks[5]].map(link => <a key={link.href} href={link.href}>{link.text}</a>)}</div><p className="copyright">© {new Date().getFullYear()} <a href="/">Fisio Invasiva ®</a> | Todos los derechos reservados | <a href="/privacidad/">Políticas de privacidad</a></p></footer>
    <a className="mobile-cta" href="/agenda">Agendar hora</a>
  </body></html>
}
