import { convertLexicalToHTMLAsync } from '@payloadcms/richtext-lexical/html-async'
import { getPayloadPopulateFn } from '@payloadcms/richtext-lexical'
import type { Payload } from 'payload'
import type { Content, Media } from '@/payload-types'
import { sanitizeContentHtml } from '@/lib/sanitize-content-html'
import { youtubeEmbedUrl } from '@/lib/youtube-embed'

type Column = NonNullable<NonNullable<Content['sections']>[number]['left']>

export default async function TreatmentSections({ sections, payload }: { sections: NonNullable<Content['sections']>; payload: Payload }) {
  const populate = await getPayloadPopulateFn({ payload, currentDepth: 0, depth: 1 })
  const renderColumn = async (column?: Column | null) => {
    const html = column?.body ? sanitizeContentHtml(await convertLexicalToHTMLAsync({ data: column.body, populate })) : ''
    const video = youtubeEmbedUrl(column?.videoUrl)
    const gallery = await Promise.all((column?.gallery || []).map(async item => {
      if (!item.image) return null
      return typeof item.image === 'number' ? await payload.findByID({ collection: 'media', id: item.image }) : item.image
    }))
    return <div className="wp-layout-column">
      <div dangerouslySetInnerHTML={{ __html: html }} />
      {video && <div className={`wp-video${column?.videoPortrait ? ' wp-video-short' : ''}`}><iframe src={video} title="Video del tratamiento" loading="lazy" allowFullScreen /></div>}
      {gallery.length > 0 && <div className="wp-slides">{gallery.filter((image): image is Media => Boolean(image?.url)).map(image => <img key={image.id} src={image.url!} alt={image.alt || ''} width={image.width || undefined} height={image.height || undefined} loading="lazy" />)}</div>}
    </div>
  }
  return <div className="article-content treatment-content treatment-content--editable">{await Promise.all(sections.map(async (section, index) => <section className="wp-layout-row" key={section.id || index}>{await renderColumn(section.left)}{await renderColumn(section.right)}</section>))}</div>
}
