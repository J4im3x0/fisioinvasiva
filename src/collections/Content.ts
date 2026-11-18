import type { CollectionConfig } from 'payload'
import { youtubeEmbedUrl } from '../lib/youtube-embed'

const columnFields = (side: 'left' | 'right') => ({
  name: side,
  label: side === 'left' ? 'Columna izquierda' : 'Columna derecha',
  type: 'group' as const,
  fields: [
    { name: 'body', label: 'Texto e imágenes', type: 'richText' as const },
    { name: 'videoUrl', label: 'Video de YouTube', type: 'text' as const, validate: (value: string | null | undefined) => !value || youtubeEmbedUrl(value) ? true : 'Usa un enlace HTTPS de YouTube.' },
    { name: 'videoPortrait', label: 'Video vertical', type: 'checkbox' as const },
    { name: 'gallery', label: 'Galería', type: 'array' as const, fields: [{ name: 'image', label: 'Imagen', type: 'upload' as const, relationTo: 'media' as const }] },
  ],
})

export const Content: CollectionConfig = {
  slug: 'content', labels: { singular: 'Contenido', plural: 'Contenidos' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'kind', 'visibility', 'wordpressId'], preview: doc => doc.kind === 'post' && typeof doc.path === 'string' && doc.path.startsWith('/') && !doc.path.startsWith('//') ? `${doc.path}?preview=visual` : null },
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
    { name: 'sections', label: 'Secciones del tratamiento', type: 'array', labels: { singular: 'Fila de dos columnas', plural: 'Filas de dos columnas' }, admin: { description: 'Cada fila corresponde a una sección de la página. Las columnas se muestran en el mismo orden que en la web.', condition: data => data.kind === 'post' }, fields: [{ type: 'row', fields: [columnFields('left'), columnFields('right')] }] },
    { name: 'body', label: 'Contenido del artículo', type: 'richText', admin: { description: 'Para artículos sin secciones de dos columnas.', condition: data => !['/', '/nosotros/', '/testimonios/', '/contacto/'].includes(data.path) && (!Array.isArray(data.sections) || data.sections.length === 0) } },
    { name: 'useVisualEditor', label: 'Publicar contenido editable', type: 'checkbox', defaultValue: false, admin: { description: 'Guarda primero y usa Vista previa para revisar las secciones. Activa esta opción cuando quieras reemplazar la versión original de WordPress.' } },
    { name: 'html', label: 'HTML original de WordPress', type: 'textarea', admin: { hidden: true } },
    { name: 'seoTitle', label: 'T?tulo SEO', type: 'text' }, { name: 'seoDescription', label: 'Descripci?n SEO', type: 'textarea' },
  ],
}
