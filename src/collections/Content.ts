import type { CollectionConfig, Field } from 'payload'
import { youtubeEmbedUrl } from '../lib/youtube-embed'

const FIXED_PAGES = ['/', '/nosotros/', '/testimonios/', '/contacto/']

const columnFields = (side: 'left' | 'right'): Field => ({
  name: side,
  label: side === 'left' ? 'Columna izquierda' : 'Columna derecha',
  type: 'group',
  admin: {
    width: '50%',
    className: `treatment-column-card treatment-column-card--${side}`,
  },
  fields: [
    { name: 'body', label: 'Texto e imágenes', type: 'richText' },
    {
      type: 'collapsible',
      label: 'Video y galería',
      admin: {
        initCollapsed: true,
        className: 'treatment-column-media',
        components: {
          Label: '/components/admin/SectionEditorComponents#ColumnMediaLabel',
        },
      },
      fields: [
        {
          name: 'videoUrl',
          label: 'Video de YouTube',
          type: 'text',
          admin: {
            placeholder: 'https://www.youtube.com/watch?v=...',
            components: {
              afterInput: ['/components/admin/SectionEditorComponents#YouTubePreview'],
            },
          },
          validate: (value: string | null | undefined) =>
            !value || youtubeEmbedUrl(value) ? true : 'Usa un enlace HTTPS de YouTube.',
        },
        {
          name: 'videoPortrait',
          label: 'Video vertical (Shorts 9:16)',
          type: 'checkbox',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.videoUrl),
          },
        },
        {
          name: 'gallery',
          label: 'Galería de imágenes',
          type: 'array',
          labels: { singular: 'Imagen', plural: 'Imágenes' },
          fields: [{ name: 'image', label: 'Imagen', type: 'upload', relationTo: 'media' }],
        },
      ],
    },
  ],
})

export const Content: CollectionConfig = {
  slug: 'content',
  labels: { singular: 'Contenido', plural: 'Contenidos' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'visibility', 'useVisualEditor'],
    preview: doc =>
      typeof doc.path === 'string' && doc.path.startsWith('/') && !doc.path.startsWith('//')
        ? `${doc.path}?preview=visual`
        : null,
  },
  access: {
    read: ({ req }) => (req.user ? true : { visibility: { equals: 'publish' } }),
  },
  fields: [
    { name: 'title', label: 'Título', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contenido',
          fields: [
            {
              name: 'sections',
              label: 'Secciones en dos columnas',
              type: 'array',
              labels: { singular: 'Fila', plural: 'Filas' },
              admin: {
                className: 'treatment-sections-array',
                description:
                  'Cada fila se muestra en 2 columnas lado a lado, igual que en la web. Arrastra las filas para reordenar o usa "Intercambiar columnas" dentro de cada fila.',
                condition: data => data.kind === 'post',
                components: {
                  RowLabel: '/components/admin/SectionEditorComponents#SectionRowLabel',
                },
              },
              fields: [
                {
                  type: 'ui',
                  name: 'sectionToolbar',
                  admin: {
                    components: {
                      Field: '/components/admin/SectionEditorComponents#SectionRowToolbar',
                    },
                  },
                },
                {
                  type: 'row',
                  admin: { className: 'treatment-columns-row' },
                  fields: [columnFields('left'), columnFields('right')],
                },
              ],
            },
            {
              name: 'body',
              label: 'Contenido en una columna',
              type: 'richText',
              admin: {
                description: 'Para páginas simples o artículos importados sin secciones de dos columnas.',
                condition: data =>
                  !FIXED_PAGES.includes(data.path) &&
                  (data.kind !== 'post' ||
                    ((!Array.isArray(data.sections) || data.sections.length === 0) && Boolean(data.body))),
              },
            },
          ],
        },
        {
          label: 'Categorías y SEO',
          fields: [
            {
              type: 'row',
              admin: { condition: data => data.kind === 'post' },
              fields: [
                {
                  name: 'categories',
                  label: 'Categorías (separadas por comas)',
                  type: 'text',
                  admin: { width: '50%' },
                },
                {
                  name: 'tags',
                  label: 'Etiquetas (separadas por comas)',
                  type: 'text',
                  admin: { width: '50%' },
                },
              ],
            },
            { name: 'authorName', label: 'Autor', type: 'text' },
            { name: 'seoTitle', label: 'Título SEO', type: 'text' },
            { name: 'seoDescription', label: 'Descripción SEO', type: 'textarea' },
            {
              name: 'wordpressId',
              label: 'ID de WordPress',
              type: 'number',
              unique: true,
              index: true,
              admin: { readOnly: true },
            },
          ],
        },
      ],
    },
    {
      name: 'visibility',
      label: 'Estado',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Publicado', value: 'publish' },
        { label: 'Borrador', value: 'draft' },
        { label: 'Privado', value: 'private' },
        { label: 'Pendiente', value: 'pending' },
        { label: 'Programado', value: 'future' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'useVisualEditor',
      label: 'Publicar contenido editable',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'Guarda primero y usa "Vista previa" para revisar. Activa esta casilla cuando quieras publicar la versión editable en la web.',
      },
    },
    {
      name: 'path',
      label: 'Ruta en el sitio',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        placeholder: '/nombre-del-tratamiento/',
      },
    },
    {
      name: 'kind',
      label: 'Tipo de contenido',
      type: 'select',
      required: true,
      defaultValue: 'post',
      options: [
        { label: 'Tratamiento / Artículo', value: 'post' },
        { label: 'Página', value: 'page' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'featuredImage',
      label: 'Imagen destacada',
      type: 'upload',
      relationTo: 'media',
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      label: 'Fecha de publicación',
      type: 'date',
      admin: { position: 'sidebar' },
    },
    { name: 'html', label: 'HTML original de WordPress', type: 'textarea', admin: { hidden: true } },
  ],
}
