import type { CollectionConfig } from 'payload'
export const Media: CollectionConfig = {
  slug: 'media', access: { read: () => true },
  fields: [ { name: 'alt', type: 'text' }, { name: 'wordpressId', type: 'number', unique: true, index: true }, { name: 'originalUrl', label: 'URL de origen en WordPress (solo referencia)', type: 'text', admin: { readOnly: true } } ],
  upload: { staticDir: 'media' },
}
