'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { parseInlineBold } from '@/lib/site-settings-shared'

export type WhatsAppWidgetProps = {
  href: string
  headerTitle: string
  greeting1: string
  greeting2?: string
  buttonText: string
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 3.5C9.1 3.5 3.5 9.1 3.5 16c0 2.3.6 4.5 1.8 6.4L3.5 28.5l6.3-1.7c1.9 1 4 1.7 6.2 1.7 6.9 0 12.5-5.6 12.5-12.5S22.9 3.5 16 3.5Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M12.3 10.7c-.3-.6-.6-.6-.9-.6h-.8c-.3 0-.7.1-1 .5-.4.4-1.3 1.3-1.3 3.1s1.3 3.6 1.5 3.8c.2.2 2.6 4 6.3 5.5 3.1 1.2 3.7 1 4.4.9.7-.1 2.2-.9 2.5-1.7.3-.9.3-1.6.2-1.7-.1-.2-.3-.3-.7-.5s-2.2-1.1-2.5-1.2c-.3-.1-.6-.2-.8.2-.2.4-.9 1.2-1.1 1.4-.2.2-.4.3-.8.1-.4-.2-1.6-.6-3-1.8-1.1-1-1.9-2.2-2.1-2.6-.2-.4 0-.6.2-.8.2-.2.4-.4.5-.6.2-.2.2-.4.4-.6.1-.2.1-.5 0-.7-.1-.2-.8-2-1.1-2.8Z"
        fill="currentColor"
      />
    </svg>
  )
}

function ChatBubbleOutlineIcon() {
  return (
    <svg className="wa-cta-icon" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path
        d="M14 4.5C8.75 4.5 4.5 8.55 4.5 13.55c0 1.85.58 3.57 1.58 5.02L4.9 23.1l4.74-1.24A9.8 9.8 0 0 0 14 22.6c5.25 0 9.5-4.05 9.5-9.05S19.25 4.5 14 4.5Z"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function sendTrack(kind: 'whatsapp_open' | 'whatsapp_click', path: string) {
  try {
    const payload = JSON.stringify({ kind, path })
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([payload], { type: 'application/json' })
      navigator.sendBeacon('/api/track', blob)
      return
    }
    void fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    })
  } catch {
    // Tracking must never interfere with opening WhatsApp.
  }
}

export default function WhatsAppWidget({
  href,
  headerTitle,
  greeting1,
  greeting2,
  buttonText,
}: WhatsAppWidgetProps) {
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<'typing' | 'ready'>('ready')
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const trackedOpenRef = useRef(false)
  const pathname = usePathname() || '/'

  useEffect(() => {
    if (!open) return
    const reduced =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setPhase('ready')
      return
    }
    setPhase('typing')
    const timer = window.setTimeout(() => setPhase('ready'), 420)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  const handleToggle = () => {
    const next = !open
    setOpen(next)
    if (next && !trackedOpenRef.current) {
      trackedOpenRef.current = true
      sendTrack('whatsapp_open', pathname)
    }
  }

  const greeting1Parts = parseInlineBold(greeting1)
  const greeting2Parts = greeting2 ? parseInlineBold(greeting2) : []

  return (
    <div className="wa-widget" ref={rootRef}>
      <div
        id="whatsapp-chat-card"
        className={`wa-card${open ? ' wa-card--open' : ''}`}
        role="dialog"
        aria-label={`Chat de ${headerTitle}`}
        aria-hidden={!open}
      >
        <div className="wa-card__header">
          <div className="wa-card__brand">
            <WhatsAppIcon className="wa-card__brand-icon" />
            <span>{headerTitle}</span>
          </div>
          <button
            type="button"
            className="wa-card__close"
            onClick={() => {
              setOpen(false)
              triggerRef.current?.focus()
            }}
            aria-label="Cerrar ventana de WhatsApp"
            tabIndex={open ? 0 : -1}
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="wa-card__body">
          {phase === 'typing' ? (
            <div className="wa-bubble wa-bubble--typing" aria-label="Escribiendo mensaje">
              <span />
              <span />
              <span />
            </div>
          ) : (
            <>
              <div className="wa-bubble wa-bubble--first">
                {greeting1Parts.map((part, idx) =>
                  part.bold ? <strong key={idx}>{part.text}</strong> : <span key={idx}>{part.text}</span>,
                )}
              </div>
              {greeting2Parts.length > 0 && (
                <div className="wa-bubble wa-bubble--second">
                  {greeting2Parts.map((part, idx) =>
                    part.bold ? <strong key={idx}>{part.text}</strong> : <span key={idx}>{part.text}</span>,
                  )}
                </div>
              )}
            </>
          )}

          <div className="wa-card__footer">
            <a
              className="wa-cta"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={open ? 0 : -1}
              onClick={() => sendTrack('whatsapp_click', pathname)}
            >
              <span>{buttonText}</span>
              <ChatBubbleOutlineIcon />
            </a>
          </div>
        </div>
      </div>

      <button
        ref={triggerRef}
        type="button"
        className={`wa-fab${open ? ' wa-fab--open' : ''}`}
        onClick={handleToggle}
        aria-label={open ? 'Cerrar chat de WhatsApp' : 'Abrir chat de WhatsApp'}
        aria-expanded={open}
        aria-controls="whatsapp-chat-card"
      >
        <WhatsAppIcon className="wa-fab__icon" />
      </button>
    </div>
  )
}
