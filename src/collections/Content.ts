import type { CollectionConfig } from 'payload'
export const Content: CollectionConfig = {
  slug: 'content', labels: { singular: 'Contenido', plural: 'Contenidos' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'kind', 'visibility', 'wordpressId'] },
  access: { read: ({ req }) => req.user ? true : { visibility: { equals: 'publish' } } },
  fields: [
    { name: 'title', label: 'T?tulo', type: 'text', required: true },
    { name: 'path', label: 'Ruta original', type: 'text', required: true, unique: true, index: true },
    { name: 'wordpressId', label: 'ID de WordPress', type: 'number', unique: true, index: true },
    { name: 'kind', type: 'select', required: true, options: ['post', 'page'], defaultValue: 'post' },
    { name: 'visibility', label: 'Visibilidad', type: 'select', required: true, options: ['publish', 'draft', 'private', 'pending', 'future'], defaultValue: 'draft' },
    { name: 'publishedAt', type: 'date' }, { name: 'authorName', label: 'Autor', type: 'text' },
    { name: 'categories', type: 'text' }, { name: 'tags', type: 'text' },
    { name: 'featuredImage', type: 'relationship', relationTo: 'media' },
    { name: 'html', label: 'Contenido HTML editable', type: 'textarea', admin: { rows: 24 } },
    { name: 'seoTitle', label: 'T?tulo SEO', type: 'text' }, { name: 'seoDescription', label: 'Descripci?n SEO', type: 'textarea' },
  ],
}
