'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { treatmentCategories, taxonomySlug } from '@/lib/treatment-taxonomy'

type Link = { href: string; text: string }

export function MobileMenu({ links }: { links: Link[] }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const close = (event: KeyboardEvent | PointerEvent) => {
      if (event.type === 'keydown' && (event as KeyboardEvent).key === 'Escape' && root.current?.contains(document.activeElement)) {
        setOpen(false)
        root.current.querySelector('button')?.focus()
      }
      if (event.type === 'pointerdown' && !root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', close)
    document.addEventListener('pointerdown', close)
    return () => { document.removeEventListener('keydown', close); document.removeEventListener('pointerdown', close) }
  }, [])

  return <div className="mobile-menu" ref={root}>
    <button className="mobile-menu-button" type="button" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open} aria-controls="mobile-site-menu" onClick={() => setOpen(!open)}><span></span><span></span><span></span></button>
    <nav id="mobile-site-menu" aria-label="Navegación del menú" hidden={!open}>{links.map(link => <div key={link.href}><a href={link.href} aria-current={pathname === link.href ? 'page' : undefined} onClick={() => setOpen(false)}>{link.text}</a>{link.text === 'Tratamientos' && <div className="mobile-treatment-links">{treatmentCategories.map(category => <a key={category} href={`/tratamientos/${taxonomySlug(category)}/`} onClick={() => setOpen(false)}>{category}</a>)}</div>}</div>)}</nav>
  </div>
}

export function DesktopNav({ links }: { links: Link[] }) {
  const pathname = usePathname()
  return <nav className="desktop-nav" aria-label="Navegación principal">{links.map(link => link.text === 'Tratamientos' ? <div className="nav-treatment" key={link.href}><a href={link.href} aria-current={pathname === link.href ? 'page' : undefined}>{link.text}</a><div className="nav-treatment-menu">{treatmentCategories.map(category => <a key={category} href={`/tratamientos/${taxonomySlug(category)}/`}>{category}</a>)}</div></div> : <a key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined}>{link.text}</a>)}</nav>
}
