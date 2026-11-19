import { convertLexicalToHTMLAsync } from '@payloadcms/richtext-lexical/html-async'
import { getPayloadPopulateFn } from '@payloadcms/richtext-lexical'
import type { Payload } from 'payload'
import type { Content, Media } from '@/payload-types'
import { sanitizeContentHtml } from '@/lib/sanitize-content-html'
import { hasLexicalContent } from '@/lib/section-editor-helpers'
import { youtubeEmbedUrl } from '@/lib/youtube-embed'

type Column = NonNullable<NonNullable<Content['sections']>[number]['left']>

export default async function TreatmentSections({
  sections,
  payload,
}: {
  sections: NonNullable<Content['sections']>
  payload: Payload
}) {
  const populate = await getPayloadPopulateFn({ payload, currentDepth: 0, depth: 1 })
  const resolveColumn = async (column?: Column | null) => {
    const html =
      column?.body && hasLexicalContent(column.body)
        ? sanitizeContentHtml(await convertLexicalToHTMLAsync({ data: column.body, populate })).trim()
        : ''
    const video = youtubeEmbedUrl(column?.videoUrl)
    const resolvedGallery = await Promise.all(
      (column?.gallery || []).map(async item => {
        if (!item.image) return null
        if (typeof item.image !== 'number') return item.image
        return await payload.findByID({ collection: 'media', id: item.image, disableErrors: true })
      }),
    )
    const gallery = resolvedGallery.filter((image): image is Media => Boolean(image?.url))
    if (!html && !video && gallery.length === 0) return null
    return (
      <div className="wp-layout-column">
        {html && <div dangerouslySetInnerHTML={{ __html: html }} />}
        {video && (
          <div className={`wp-video${column?.videoPortrait ? ' wp-video-short' : ''}`}>
            <iframe src={video} title="Video del tratamiento" loading="lazy" allowFullScreen />
          </div>
        )}
        {gallery.length > 0 && (
          <div className="wp-slides">
            {gallery.map(image => (
              <img
                key={image.id}
                src={image.url!}
                alt={image.alt || ''}
                width={image.width || undefined}
                height={image.height || undefined}
                loading="lazy"
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  const rows = await Promise.all(
    sections.map(async (section, index) => {
      const [left, right] = await Promise.all([resolveColumn(section.left), resolveColumn(section.right)])
      if (!left && !right) return null
      const single = !left || !right
      return (
        <section
          className={`wp-layout-row${single ? ' wp-layout-row--single' : ''}`}
          key={section.id || index}
        >
          {left}
          {right}
        </section>
      )
    }),
  )

  return <div className="article-content treatment-content treatment-content--editable">{rows}</div>
}
