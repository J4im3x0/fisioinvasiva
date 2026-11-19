import type { GlobalConfig } from 'payload'
import {
  buildWhatsAppUrl,
  DEFAULT_PRICING_PLANS,
  DEFAULT_SITE_SETTINGS,
  isValidHttpsUrl,
} from '../lib/site-settings-shared'

const validateHttps = (value: string | null | undefined) =>
  !value || isValidHttpsUrl(value) ? true : 'Usa una URL válida que comience con https://'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Configuración del sitio',
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'WhatsApp',
          description: 'Configura el botón flotante y la ventana de chat que redirige a WhatsApp.',
          fields: [
            {
              name: 'whatsappEnabled',
              label: 'Mostrar botón de WhatsApp en la web',
              type: 'checkbox',
              defaultValue: DEFAULT_SITE_SETTINGS.whatsappEnabled,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'whatsappPhone',
                  label: 'Número de WhatsApp (con código de país)',
                  type: 'text',
                  defaultValue: DEFAULT_SITE_SETTINGS.whatsappPhone,
                  admin: {
                    width: '50%',
                    placeholder: '+56 9 3863 0890',
                    description: 'Ejemplo: +56 9 3863 0890 (sin espacios también funciona).',
                  },
                  validate: (value: string | null | undefined) =>
                    !value || buildWhatsAppUrl(value)
                      ? true
                      : 'Ingresa un número válido con código de país (8 a 15 dígitos).',
                },
                {
                  name: 'whatsappHeaderTitle',
                  label: 'Título de la ventana',
                  type: 'text',
                  defaultValue: DEFAULT_SITE_SETTINGS.whatsappHeaderTitle,
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'whatsappGreeting1',
              label: 'Primer mensaje de bienvenida',
              type: 'text',
              defaultValue: DEFAULT_SITE_SETTINGS.whatsappGreeting1,
              admin: {
                description: 'Usa **texto** para resaltar palabras en negrita (ej. **Fisio Invasiva**).',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'whatsappGreeting2',
                  label: 'Segundo mensaje (opcional)',
                  type: 'text',
                  defaultValue: DEFAULT_SITE_SETTINGS.whatsappGreeting2,
                  admin: { width: '65%' },
                },
                {
                  name: 'whatsappButtonText',
                  label: 'Texto del botón',
                  type: 'text',
                  defaultValue: DEFAULT_SITE_SETTINGS.whatsappButtonText,
                  admin: { width: '35%' },
                },
              ],
            },
            {
              name: 'whatsappPrefillMessage',
              label: 'Mensaje prellenado al abrir WhatsApp',
              type: 'textarea',
              defaultValue: DEFAULT_SITE_SETTINGS.whatsappPrefillMessage,
              admin: {
                description: 'Este texto aparecerá listo para enviar cuando el paciente presione "Abrir chat".',
              },
            },
          ],
        },
        {
          label: 'Clínica y agenda',
          description: 'Datos de contacto, dirección, horarios y enlace de agendamiento de toda la web.',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'bookingUrl',
                  label: 'Enlace de agendamiento (AgendaPro)',
                  type: 'text',
                  defaultValue: DEFAULT_SITE_SETTINGS.bookingUrl,
                  validate: validateHttps,
                  admin: {
                    width: '70%',
                    description: 'Destino al que redirige /agenda en todos los botones del sitio.',
                  },
                },
                {
                  name: 'bookingCtaText',
                  label: 'Texto del botón de agenda',
                  type: 'text',
                  defaultValue: DEFAULT_SITE_SETTINGS.bookingCtaText,
                  admin: { width: '30%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'phoneDisplay',
                  label: 'Teléfono de la consulta',
                  type: 'text',
                  defaultValue: DEFAULT_SITE_SETTINGS.phoneDisplay,
                  admin: { width: '50%' },
                },
                {
                  name: 'email',
                  label: 'Correo de contacto',
                  type: 'text',
                  defaultValue: DEFAULT_SITE_SETTINGS.email,
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'address',
                  label: 'Dirección',
                  type: 'text',
                  defaultValue: DEFAULT_SITE_SETTINGS.address,
                  admin: { width: '60%' },
                },
                {
                  name: 'hours',
                  label: 'Horario de atención',
                  type: 'text',
                  defaultValue: DEFAULT_SITE_SETTINGS.hours,
                  admin: { width: '40%' },
                },
              ],
            },
            {
              name: 'mapsUrl',
              label: 'Enlace a Google Maps',
              type: 'text',
              defaultValue: DEFAULT_SITE_SETTINGS.mapsUrl,
              validate: validateHttps,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'instagramUrl',
                  label: 'Instagram',
                  type: 'text',
                  defaultValue: DEFAULT_SITE_SETTINGS.instagramUrl,
                  validate: validateHttps,
                  admin: { width: '50%' },
                },
                {
                  name: 'googleReviewsUrl',
                  label: 'Enlace a reseñas de Google',
                  type: 'text',
                  defaultValue: DEFAULT_SITE_SETTINGS.googleReviewsUrl,
                  validate: validateHttps,
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
        {
          label: 'Portada (Inicio)',
          description: 'Textos principales de la página de inicio.',
          fields: [
            {
              name: 'heroTitle',
              label: 'Titular principal',
              type: 'text',
              defaultValue: DEFAULT_SITE_SETTINGS.heroTitle,
              admin: {
                description: 'Usa **palabra** para resaltarla en verde (ej. Somos **especialistas** y **pioneros**).',
              },
            },
            {
              name: 'heroSubtitle',
              label: 'Subtítulo del inicio',
              type: 'textarea',
              defaultValue: DEFAULT_SITE_SETTINGS.heroSubtitle,
            },
            {
              name: 'aboutQuote',
              label: 'Frase de enfoque clínico',
              type: 'textarea',
              defaultValue: DEFAULT_SITE_SETTINGS.aboutQuote,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'aboutSignature',
                  label: 'Nombre de la firma',
                  type: 'text',
                  defaultValue: DEFAULT_SITE_SETTINGS.aboutSignature,
                  admin: { width: '50%' },
                },
                {
                  name: 'aboutCredentials',
                  label: 'Credenciales',
                  type: 'text',
                  defaultValue: DEFAULT_SITE_SETTINGS.aboutCredentials,
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'visitHeading',
              label: 'Título de ubicación',
              type: 'text',
              defaultValue: DEFAULT_SITE_SETTINGS.visitHeading,
            },
          ],
        },
        {
          label: 'Valores y convenios',
          description: 'Actualiza los aranceles y convenios visibles en la portada.',
          fields: [
            {
              name: 'pricingIntro',
              label: 'Introducción de valores',
              type: 'textarea',
              defaultValue: DEFAULT_SITE_SETTINGS.pricingIntro,
            },
            {
              name: 'pricingPlans',
              label: 'Tarjetas de valores',
              type: 'array',
              labels: { singular: 'Plan', plural: 'Planes' },
              defaultValue: DEFAULT_PRICING_PLANS.map(plan => ({
                ...plan,
                features: plan.features.join('\n'),
              })),
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'badge', label: 'Etiqueta superior', type: 'text', admin: { width: '35%' } },
                    { name: 'title', label: 'Nombre del plan', type: 'text', required: true, admin: { width: '40%' } },
                    { name: 'price', label: 'Valor', type: 'text', required: true, admin: { width: '25%', placeholder: '$44.000' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'subnote',
                      label: 'Nota bajo el precio (opcional)',
                      type: 'textarea',
                      admin: { width: '70%', placeholder: 'Ej: 10 sesiones a $31.000 c/u' },
                    },
                    {
                      name: 'highlighted',
                      label: 'Destacar tarjeta (fondo azul)',
                      type: 'checkbox',
                      defaultValue: false,
                      admin: { width: '30%' },
                    },
                  ],
                },
                {
                  name: 'features',
                  label: 'Incluye (una línea por ítem)',
                  type: 'textarea',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
