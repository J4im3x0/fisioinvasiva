export type PricingPlan = {
  id?: string | null
  badge: string
  title: string
  price: string
  subnote?: string
  highlighted?: boolean
  features: string[]
}

export type ResolvedSiteSettings = {
  whatsappEnabled: boolean
  whatsappPhone: string
  whatsappHeaderTitle: string
  whatsappGreeting1: string
  whatsappGreeting2: string
  whatsappButtonText: string
  whatsappPrefillMessage: string
  bookingUrl: string
  bookingCtaText: string
  phoneDisplay: string
  email: string
  address: string
  hours: string
  mapsUrl: string
  instagramUrl: string
  googleReviewsUrl: string
  heroTitle: string
  heroSubtitle: string
  aboutQuote: string
  aboutSignature: string
  aboutCredentials: string
  visitHeading: string
  pricingIntro: string
  pricingPlans: PricingPlan[]
}

export type SiteEventKind =
  | 'agenda_click'
  | 'whatsapp_open'
  | 'whatsapp_click'
  | 'contact_submit'
  | 'treatment_view'

export const DEFAULT_PRICING_PLANS: PricingPlan[] = [
  {
    badge: 'Convenio Fonasa',
    title: 'Fisio Invasiva Fonasa',
    price: '$44.000',
    subnote: '',
    highlighted: false,
    features: [
      'Precio diferenciado Fonasa',
      'Realización multitécnica',
      'Reembolso por orden médica',
      'Duración de 45 minutos',
    ],
  },
  {
    badge: 'Particular o bono',
    title: 'Kinesiología Isapre',
    price: '$35.000',
    subnote: '10 sesiones a $31.000 c/u\n(total $310.000)',
    highlighted: true,
    features: [
      'Precio Isapre y Fonasa',
      'Terapia ajustada',
      'Reembolso por orden médica',
      'Duración de 45 minutos',
    ],
  },
  {
    badge: 'Convenio Isapre',
    title: 'Fisio Invasiva Isapre',
    price: '$52.000',
    subnote: '',
    highlighted: false,
    features: [
      'Precio ajustado Isapre',
      'Realización multitécnica',
      'Reembolso por orden médica',
      'Duración de 45 minutos',
    ],
  },
]

export const DEFAULT_SITE_SETTINGS: ResolvedSiteSettings = {
  whatsappEnabled: true,
  whatsappPhone: '+56 9 3863 0890',
  whatsappHeaderTitle: 'WhatsApp',
  whatsappGreeting1: 'Hey 👋, bienvenido a **Fisio Invasiva**',
  whatsappGreeting2: '¿Cómo podemos ayudarte?',
  whatsappButtonText: 'Abrir chat',
  whatsappPrefillMessage: 'Hola, me gustaría consultar y agendar una hora en Fisio Invasiva.',
  bookingUrl: 'https://kinesiologofisioterapeutadeclaudiavalenzuela.site.agendapro.com/cl/sucursal/107922',
  bookingCtaText: 'Agendar hora',
  phoneDisplay: '+56 9 3863 0890',
  email: 'contacto@fisioinvasiva.cl',
  address: 'Coyancura 2283 oficina 302, Providencia, Santiago',
  hours: 'Lunes a sábado, 9:00 a 19:00',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Coyancura+2283+Providencia+Santiago',
  instagramUrl: 'https://www.instagram.com/terapia_fisioinvasiva/',
  googleReviewsUrl: 'https://share.google/ay32o4HwwQOiA1uTV',
  heroTitle: 'Somos **especialistas** y **pioneros**',
  heroSubtitle: 'Kinesiología y fisioterapia invasiva con atención personalizada en Providencia.',
  aboutQuote:
    'Realizamos una terapia única de Fisioterapia invasiva en Chile, la cual se integra en el proceso de rehabilitación de nuestros pacientes con un enfoque personalizado.',
  aboutSignature: 'Claudia Valenzuela Ríos',
  aboutCredentials: '(PhD. PT. MSc. MOFI.)',
  visitHeading: '¡Te esperamos! A pasos de metro Los Leones',
  pricingIntro:
    'Buscamos traer y accesibilizar en medida de lo posible nuestro trabajo que genera resultados y cambia la vida de nuestros pacientes.',
  pricingPlans: DEFAULT_PRICING_PLANS,
}

export function cleanPhoneDigits(phone?: string | null): string {
  return (phone || '').replace(/\D+/g, '')
}

export function phoneHref(phone?: string | null): string {
  const digits = cleanPhoneDigits(phone)
  return digits ? `tel:+${digits}` : 'tel:+56938630890'
}

export function buildWhatsAppUrl(phone?: string | null, message?: string | null): string | null {
  const digits = cleanPhoneDigits(phone)
  if (digits.length < 8 || digits.length > 15) return null
  const text = (message || '').trim()
  return text ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : `https://wa.me/${digits}`
}

export function isValidHttpsUrl(input?: string | null): boolean {
  const trimmed = input?.trim()
  if (!trimmed) return false
  try {
    return new URL(trimmed).protocol === 'https:'
  } catch {
    return false
  }
}

export function safeHttpsUrl(input: string | null | undefined, fallback: string): string {
  const trimmed = input?.trim()
  if (!trimmed) return fallback
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'https:' ? parsed.toString() : fallback
  } catch {
    return fallback
  }
}

export function parseInlineBold(text: string): Array<{ text: string; bold: boolean }> {
  const parts: Array<{ text: string; bold: boolean }> = []
  const pattern = /\*\*([^*]+)\*\*/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push({ text: text.slice(lastIndex, match.index), bold: false })
    parts.push({ text: match[1], bold: true })
    lastIndex = pattern.lastIndex
  }
  if (lastIndex < text.length) parts.push({ text: text.slice(lastIndex), bold: false })
  return parts
}

const pickText = (value: unknown, fallback: string) =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback

export function mergeSiteSettings(raw?: Record<string, unknown> | null): ResolvedSiteSettings {
  if (!raw || typeof raw !== 'object') return DEFAULT_SITE_SETTINGS
  const rawPlans = Array.isArray(raw.pricingPlans) ? raw.pricingPlans : []
  const plans: PricingPlan[] = rawPlans
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map(item => ({
      id: typeof item.id === 'string' ? item.id : undefined,
      badge: typeof item.badge === 'string' ? item.badge.trim() : '',
      title: typeof item.title === 'string' ? item.title.trim() : '',
      price: typeof item.price === 'string' ? item.price.trim() : '',
      subnote: typeof item.subnote === 'string' ? item.subnote.trim() : '',
      highlighted: Boolean(item.highlighted),
      features:
        typeof item.features === 'string'
          ? item.features
              .split(/\r?\n/)
              .map(line => line.trim())
              .filter(Boolean)
          : [],
    }))
    .filter(plan => plan.title && plan.price)

  return {
    whatsappEnabled:
      typeof raw.whatsappEnabled === 'boolean' ? raw.whatsappEnabled : DEFAULT_SITE_SETTINGS.whatsappEnabled,
    whatsappPhone: pickText(raw.whatsappPhone, DEFAULT_SITE_SETTINGS.whatsappPhone),
    whatsappHeaderTitle: pickText(raw.whatsappHeaderTitle, DEFAULT_SITE_SETTINGS.whatsappHeaderTitle),
    whatsappGreeting1: pickText(raw.whatsappGreeting1, DEFAULT_SITE_SETTINGS.whatsappGreeting1),
    whatsappGreeting2:
      typeof raw.whatsappGreeting2 === 'string'
        ? raw.whatsappGreeting2.trim()
        : DEFAULT_SITE_SETTINGS.whatsappGreeting2,
    whatsappButtonText: pickText(raw.whatsappButtonText, DEFAULT_SITE_SETTINGS.whatsappButtonText),
    whatsappPrefillMessage:
      typeof raw.whatsappPrefillMessage === 'string'
        ? raw.whatsappPrefillMessage.trim()
        : DEFAULT_SITE_SETTINGS.whatsappPrefillMessage,
    bookingUrl: safeHttpsUrl(raw.bookingUrl as string | undefined, DEFAULT_SITE_SETTINGS.bookingUrl),
    bookingCtaText: pickText(raw.bookingCtaText, DEFAULT_SITE_SETTINGS.bookingCtaText),
    phoneDisplay: pickText(raw.phoneDisplay, DEFAULT_SITE_SETTINGS.phoneDisplay),
    email: pickText(raw.email, DEFAULT_SITE_SETTINGS.email),
    address: pickText(raw.address, DEFAULT_SITE_SETTINGS.address),
    hours: pickText(raw.hours, DEFAULT_SITE_SETTINGS.hours),
    mapsUrl: safeHttpsUrl(raw.mapsUrl as string | undefined, DEFAULT_SITE_SETTINGS.mapsUrl),
    instagramUrl: safeHttpsUrl(raw.instagramUrl as string | undefined, DEFAULT_SITE_SETTINGS.instagramUrl),
    googleReviewsUrl: safeHttpsUrl(
      raw.googleReviewsUrl as string | undefined,
      DEFAULT_SITE_SETTINGS.googleReviewsUrl,
    ),
    heroTitle: pickText(raw.heroTitle, DEFAULT_SITE_SETTINGS.heroTitle),
    heroSubtitle: pickText(raw.heroSubtitle, DEFAULT_SITE_SETTINGS.heroSubtitle),
    aboutQuote: pickText(raw.aboutQuote, DEFAULT_SITE_SETTINGS.aboutQuote),
    aboutSignature: pickText(raw.aboutSignature, DEFAULT_SITE_SETTINGS.aboutSignature),
    aboutCredentials:
      typeof raw.aboutCredentials === 'string'
        ? raw.aboutCredentials.trim()
        : DEFAULT_SITE_SETTINGS.aboutCredentials,
    visitHeading: pickText(raw.visitHeading, DEFAULT_SITE_SETTINGS.visitHeading),
    pricingIntro: pickText(raw.pricingIntro, DEFAULT_SITE_SETTINGS.pricingIntro),
    pricingPlans: plans.length > 0 ? plans : DEFAULT_PRICING_PLANS,
  }
}
