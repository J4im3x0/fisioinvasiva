import React from 'react'
import type { AdminViewServerProps } from 'payload'
import { buildWhatsAppUrl, getSiteSettings } from '@/lib/site-settings'

type TopTreatment = {
  path: string
  label: string
  views: number
  editId?: number
}

export async function ClinicDashboard({ payload }: AdminViewServerProps) {
  const settings = await getSiteSettings(payload)
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  let statsAvailable = true
  let agenda30d = 0
  let agendaTotal = 0
  let whatsappClick30d = 0
  let whatsappOpen30d = 0
  let whatsappClickTotal = 0
  let contact30d = 0
  let contactTotal = 0
  let views30d = 0
  let viewsTotal = 0
  let topTreatments: TopTreatment[] = []

  let publishedPosts = 0
  let draftPosts = 0
  let visualPosts = 0
  let mediaCount = 0

  try {
    const [pubRes, draftRes, visualRes, mediaRes] = await Promise.all([
      payload.count({
        collection: 'content',
        where: { and: [{ kind: { equals: 'post' } }, { visibility: { equals: 'publish' } }] },
      }),
      payload.count({
        collection: 'content',
        where: { and: [{ kind: { equals: 'post' } }, { visibility: { not_equals: 'publish' } }] },
      }),
      payload.count({
        collection: 'content',
        where: { and: [{ kind: { equals: 'post' } }, { useVisualEditor: { equals: true } }] },
      }),
      payload.count({ collection: 'media' }),
    ])
    publishedPosts = pubRes.totalDocs
    draftPosts = draftRes.totalDocs
    visualPosts = visualRes.totalDocs
    mediaCount = mediaRes.totalDocs
  } catch {
    // Keep zero fallbacks if content tables are unavailable.
  }

  try {
    const countKind = (kind: string, onlyRecent: boolean) =>
      payload.count({
        collection: 'site-events',
        overrideAccess: true,
        where: onlyRecent
          ? { and: [{ kind: { equals: kind } }, { createdAt: { greater_than_equal: since30d } }] }
          : { kind: { equals: kind } },
      })

    const [
      a30,
      aAll,
      wClick30,
      wOpen30,
      wClickAll,
      c30,
      cAll,
      v30,
      vAll,
      recentViews,
      postsRes,
    ] = await Promise.all([
      countKind('agenda_click', true),
      countKind('agenda_click', false),
      countKind('whatsapp_click', true),
      countKind('whatsapp_open', true),
      countKind('whatsapp_click', false),
      countKind('contact_submit', true),
      countKind('contact_submit', false),
      countKind('treatment_view', true),
      countKind('treatment_view', false),
      payload.find({
        collection: 'site-events',
        overrideAccess: true,
        where: { and: [{ kind: { equals: 'treatment_view' } }, { createdAt: { greater_than_equal: since30d } }] },
        limit: 500,
        sort: '-createdAt',
        depth: 0,
      }),
      payload.find({
        collection: 'content',
        where: { kind: { equals: 'post' } },
        limit: 200,
        depth: 0,
        select: { title: true, path: true },
      }),
    ])

    agenda30d = a30.totalDocs
    agendaTotal = aAll.totalDocs
    whatsappClick30d = wClick30.totalDocs
    whatsappOpen30d = wOpen30.totalDocs
    whatsappClickTotal = wClickAll.totalDocs
    contact30d = c30.totalDocs
    contactTotal = cAll.totalDocs
    views30d = v30.totalDocs
    viewsTotal = vAll.totalDocs

    const postsByPath = new Map<string, { id: number; title: string }>()
    for (const post of postsRes.docs) {
      if (post.path) postsByPath.set(post.path, { id: post.id, title: post.title })
    }

    const grouped = new Map<string, TopTreatment>()
    for (const event of recentViews.docs) {
      const eventPath = event.path || '/'
      const existing = grouped.get(eventPath)
      if (existing) {
        existing.views++
      } else {
        const matched = postsByPath.get(eventPath)
        grouped.set(eventPath, {
          path: eventPath,
          label: matched?.title || event.label || eventPath,
          views: 1,
          editId: matched?.id,
        })
      }
    }
    topTreatments = [...grouped.values()].sort((a, b) => b.views - a.views).slice(0, 5)
  } catch {
    statsAvailable = false
  }

  const maxViews = topTreatments[0]?.views || 1
  const whatsappActive = settings.whatsappEnabled && Boolean(buildWhatsAppUrl(settings.whatsappPhone))

  return (
    <section className="clinic-dashboard" aria-label="Resumen de la clínica">
      <div className="clinic-dashboard__header">
        <div>
          <h2 className="clinic-dashboard__title">Panel de Fisio Invasiva</h2>
          <p className="clinic-dashboard__subtitle">
            Estadísticas de pacientes (últimos 30 días) y accesos directos para configurar la web.
          </p>
        </div>
        <div className="clinic-dashboard__status">
          <span
            className={`clinic-dashboard__pill${whatsappActive ? ' clinic-dashboard__pill--ok' : ''}`}
          >
            {whatsappActive ? `WhatsApp activo · ${settings.whatsappPhone}` : 'WhatsApp desactivado'}
          </span>
          <a className="clinic-dashboard__primary-btn" href="/admin/globals/site-settings">
            Configurar WhatsApp y sitio
          </a>
        </div>
      </div>

      {!statsAvailable && (
        <p className="clinic-dashboard__notice">
          Las estadísticas se activarán automáticamente al aplicar la migración de base de datos.
        </p>
      )}

      <div className="clinic-dashboard__kpis">
        <article className="clinic-kpi">
          <span className="clinic-kpi__label">Clics en Agendar hora</span>
          <strong className="clinic-kpi__value">{agenda30d}</strong>
          <span className="clinic-kpi__meta">Últimos 30 días · {agendaTotal} total</span>
        </article>
        <article className="clinic-kpi">
          <span className="clinic-kpi__label">Chats de WhatsApp</span>
          <strong className="clinic-kpi__value">{whatsappClick30d}</strong>
          <span className="clinic-kpi__meta">
            {whatsappOpen30d} aperturas del chat · {whatsappClickTotal} clics total
          </span>
        </article>
        <article className="clinic-kpi">
          <span className="clinic-kpi__label">Consultas por formulario</span>
          <strong className="clinic-kpi__value">{contact30d}</strong>
          <span className="clinic-kpi__meta">Últimos 30 días · {contactTotal} total</span>
        </article>
        <article className="clinic-kpi">
          <span className="clinic-kpi__label">Lecturas de tratamientos</span>
          <strong className="clinic-kpi__value">{views30d}</strong>
          <span className="clinic-kpi__meta">Últimos 30 días · {viewsTotal} total</span>
        </article>
      </div>

      <div className="clinic-dashboard__grid">
        <div className="clinic-panel">
          <div className="clinic-panel__head">
            <h3>Tratamientos más leídos (30 días)</h3>
            <a href="/admin/collections/site-events">Ver registro</a>
          </div>
          {topTreatments.length > 0 ? (
            <ul className="clinic-top-list">
              {topTreatments.map(item => (
                <li key={item.path}>
                  <div className="clinic-top-list__row">
                    {item.editId ? (
                      <a href={`/admin/collections/content/${item.editId}`}>{item.label}</a>
                    ) : (
                      <span>{item.label}</span>
                    )}
                    <strong>{item.views}</strong>
                  </div>
                  <div className="clinic-top-list__bar">
                    <span style={{ width: `${Math.max(8, Math.round((item.views / maxViews) * 100))}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="clinic-panel__empty">
              Aún no hay lecturas registradas en los últimos 30 días. Se actualizarán automáticamente cuando
              los pacientes visiten tus tratamientos.
            </p>
          )}
        </div>

        <div className="clinic-panel">
          <div className="clinic-panel__head">
            <h3>Gestión rápida del sitio</h3>
            <a href="/" target="_blank" rel="noopener noreferrer">
              Abrir web ↗
            </a>
          </div>
          <div className="clinic-inventory">
            <div>
              <strong>{publishedPosts}</strong>
              <span>Tratamientos publicados</span>
            </div>
            <div>
              <strong>{draftPosts}</strong>
              <span>Borradores</span>
            </div>
            <div>
              <strong>{visualPosts}</strong>
              <span>Con editor visual</span>
            </div>
            <div>
              <strong>{mediaCount}</strong>
              <span>Imágenes</span>
            </div>
          </div>
          <div className="clinic-actions">
            <a href="/admin/globals/site-settings">Configurar WhatsApp, agenda y valores</a>
            <a href="/admin/collections/content">Editar tratamientos y páginas</a>
            <a href="/admin/collections/content/create">Crear nuevo tratamiento</a>
            <a href="/admin/collections/media">Biblioteca de imágenes</a>
          </div>
        </div>
      </div>
    </section>
  )
}
