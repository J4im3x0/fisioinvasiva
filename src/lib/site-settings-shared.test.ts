import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  buildWhatsAppUrl,
  DEFAULT_SITE_SETTINGS,
  mergeSiteSettings,
  parseInlineBold,
  safeHttpsUrl,
} from './site-settings-shared'

test('builds safe WhatsApp redirect URLs and rejects invalid phone numbers', () => {
  assert.equal(
    buildWhatsAppUrl('+56 9 3863 0890', 'Hola, quiero agendar'),
    'https://wa.me/56938630890?text=Hola%2C%20quiero%20agendar',
  )
  assert.equal(buildWhatsAppUrl('56938630890', '   '), 'https://wa.me/56938630890')
  assert.equal(buildWhatsAppUrl('12345'), null)
  assert.equal(buildWhatsAppUrl(''), null)
})

test('rejects non-HTTPS URLs and falls back safely', () => {
  assert.equal(safeHttpsUrl('javascript:alert(1)', 'https://example.com'), 'https://example.com')
  assert.equal(safeHttpsUrl('http://example.com', 'https://fallback.cl'), 'https://fallback.cl')
  assert.equal(safeHttpsUrl('https://agenda.cl/test', 'https://fallback.cl'), 'https://agenda.cl/test')
})

test('parses **bold** tokens without HTML injection', () => {
  assert.deepEqual(parseInlineBold('Hey 👋, bienvenido a **Fisio Invasiva**'), [
    { text: 'Hey 👋, bienvenido a ', bold: false },
    { text: 'Fisio Invasiva', bold: true },
  ])
  assert.deepEqual(parseInlineBold('Somos **especialistas** y **pioneros**'), [
    { text: 'Somos ', bold: false },
    { text: 'especialistas', bold: true },
    { text: ' y ', bold: false },
    { text: 'pioneros', bold: true },
  ])
})

test('merges partial global settings with defaults and parses pricing plans', () => {
  const merged = mergeSiteSettings({
    whatsappEnabled: false,
    whatsappPhone: '+56 9 1111 2222',
    bookingUrl: 'javascript:evil()',
    pricingPlans: [
      {
        badge: 'Nuevo',
        title: 'Sesión Evaluación',
        price: '$40.000',
        highlighted: true,
        features: 'Evaluación ecográfica\nPlan personalizado\n',
      },
    ],
  })
  assert.equal(merged.whatsappEnabled, false)
  assert.equal(merged.whatsappPhone, '+56 9 1111 2222')
  assert.equal(merged.bookingUrl, DEFAULT_SITE_SETTINGS.bookingUrl)
  assert.equal(merged.pricingPlans.length, 1)
  assert.deepEqual(merged.pricingPlans[0].features, ['Evaluación ecográfica', 'Plan personalizado'])
})
