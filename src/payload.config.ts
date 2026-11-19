import { postgresAdapter } from '@payloadcms/db-postgres'
import { FixedToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { es } from '@payloadcms/translations/languages/es'
import { buildConfig } from 'payload'
import path from 'node:path'
import sharp from 'sharp'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Content } from './collections/Content'
import { SiteEvents } from './collections/SiteEvents'
import { SiteSettings } from './globals/SiteSettings'
import { migrations } from './migrations'

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve('src') },
    components: {
      beforeDashboard: ['/components/admin/ClinicDashboard#ClinicDashboard'],
    },
  },
  i18n: { supportedLanguages: { es }, fallbackLanguage: 'es' },
  collections: [Users, Media, Content, SiteEvents],
  globals: [SiteSettings],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL || '' }, prodMigrations: migrations }),
  sharp,
  typescript: { outputFile: path.resolve('src/payload-types.ts') },
})
