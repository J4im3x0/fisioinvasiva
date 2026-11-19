'use client'

import React from 'react'
import { useField, useFieldPath, useForm, useFormFields, useRowLabel } from '@payloadcms/ui'
import type { FormState, TextFieldClientProps, UIFieldClientProps } from 'payload'
import {
  countGalleryImages,
  summarizeColumn,
  swapSectionColumnsState,
  type ColumnSummaryInput,
} from '@/lib/section-editor-helpers'
import { youtubeEmbedUrl } from '@/lib/youtube-embed'

type SectionRowData = {
  left?: ColumnSummaryInput
  right?: ColumnSummaryInput
}

export function SectionRowLabel() {
  const { data, rowNumber } = useRowLabel<SectionRowData>()
  const index = (rowNumber ?? 0) + 1
  return (
    <span className="section-row-label">
      <strong className="section-row-label__index">Fila {index}</strong>
      <span className="section-row-label__col">
        <em>Izq:</em> {summarizeColumn(data?.left)}
      </span>
      <span className="section-row-label__sep" aria-hidden="true">
        |
      </span>
      <span className="section-row-label__col">
        <em>Der:</em> {summarizeColumn(data?.right)}
      </span>
    </span>
  )
}

export function SectionRowToolbar(props: Partial<UIFieldClientProps>) {
  const contextPath = useFieldPath()
  const path = props.path || contextPath || ''
  const { getFields, replaceFieldRow } = useForm()
  const match = path.match(/^(.+)\.(\d+)\.[^.]+$/)
  if (!match) return null
  const arrayPath = match[1]
  const rowIndex = Number(match[2])
  const schemaPath = props.schemaPath ? props.schemaPath.replace(/\.[^.]+$/, '') : arrayPath

  const handleSwap = () => {
    const subFieldState = swapSectionColumnsState(getFields(), rowIndex, arrayPath) as FormState
    replaceFieldRow({
      path: arrayPath,
      rowIndex,
      schemaPath,
      subFieldState,
    })
  }

  return (
    <div className="section-row-toolbar">
      <span className="section-row-toolbar__hint">
        Vista en 2 columnas · Si dejas una columna vacía, la otra ocupará todo el ancho.
      </span>
      {!props.readOnly && (
        <button
          type="button"
          className="section-row-toolbar__swap"
          onClick={handleSwap}
          title="Intercambia todo el contenido entre la columna izquierda y la derecha"
        >
          ⇄ Intercambiar columnas
        </button>
      )}
    </div>
  )
}

export function ColumnMediaLabel() {
  const { data } = useRowLabel<ColumnSummaryInput>()
  const hasVideo = Boolean(youtubeEmbedUrl(data?.videoUrl))
  const galleryCount = countGalleryImages(data?.gallery)
  return (
    <span className="column-media-label">
      <span className="column-media-label__title">Video y galería</span>
      {hasVideo && (
        <span className="column-media-label__badge column-media-label__badge--active">
          {data?.videoPortrait ? 'YouTube vertical' : 'YouTube'}
        </span>
      )}
      {galleryCount > 0 && (
        <span className="column-media-label__badge column-media-label__badge--active">
          {galleryCount === 1 ? '1 foto' : `${galleryCount} fotos`}
        </span>
      )}
      {!hasVideo && galleryCount === 0 && <span className="column-media-label__badge">Opcional</span>}
    </span>
  )
}

export function YouTubePreview(props: Partial<TextFieldClientProps>) {
  const contextPath = useFieldPath()
  const path = props.path || contextPath || ''
  const { value } = useField<string>({ path })
  const portraitPath = path.replace(/\.videoUrl$/, '.videoPortrait')
  const isPortrait = useFormFields(([fields]) => Boolean(fields[portraitPath]?.value))
  const embedUrl = youtubeEmbedUrl(value)
  if (!embedUrl) return null
  return (
    <div className={`youtube-field-preview${isPortrait ? ' youtube-field-preview--portrait' : ''}`}>
      <iframe
        src={embedUrl}
        title="Vista previa del video de YouTube"
        loading="lazy"
        allowFullScreen
      />
    </div>
  )
}
