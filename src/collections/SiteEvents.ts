import type { CollectionConfig } from 'payload'

export const SiteEvents: CollectionConfig = {
  slug: 'site-events',
  labels: { singular: 'Evento', plural: 'Actividad del sitio' },
  admin: {
    useAsTitle: 'kind',
    defaultColumns: ['kind', 'path', 'label', 'createdAt'],
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: () => false,
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'kind',
      label: 'Tipo de acción',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Clic en Agendar hora', value: 'agenda_click' },
        { label: 'Apertura chat WhatsApp', value: 'whatsapp_open' },
        { label: 'Clic en Abrir chat WhatsApp', value: 'whatsapp_click' },
        { label: 'Formulario de contacto enviado', value: 'contact_submit' },
        { label: 'Lectura de tratamiento', value: 'treatment_view' },
      ],
    },
    {
      name: 'path',
      label: 'Página',
      type: 'text',
      index: true,
    },
    {
      name: 'label',
      label: 'Detalle',
      type: 'text',
    },
  ],
}
