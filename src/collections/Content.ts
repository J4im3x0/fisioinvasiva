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
    { name: 'categories', label: 'Categorías (separadas por comas)', type: 'text' }, { name: 'tags', label: 'Etiquetas (separadas por comas)', type: 'text' },
    { name: 'featuredImage', type: 'relationship', relationTo: 'media' },
    { name: 'body', label: 'Contenido visual', type: 'richText', admin: { description: 'Edita títulos, párrafos, enlaces, listas e imágenes. En entradas importadas, activa la opción siguiente para publicar esta versión.' } },
    { name: 'useVisualEditor', label: 'Publicar contenido del editor visual', type: 'checkbox', defaultValue: false, admin: { description: 'Al activarlo, la web usa el contenido visual. Si queda desactivado, conserva el diseño HTML original de WordPress.' } },
    { name: 'html', label: 'HTML original de WordPress', type: 'textarea', admin: { hidden: true } },
    { name: 'seoTitle', label: 'T?tulo SEO', type: 'text' }, { name: 'seoDescription', label: 'Descripci?n SEO', type: 'textarea' },
  ],
}
