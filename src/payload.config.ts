import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import path from 'node:path'
import sharp from 'sharp'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Content } from './collections/Content'

export default buildConfig({
  admin: { user: Users.slug, importMap: { baseDir: path.resolve('src') } },
  collections: [Users, Media, Content],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL || '' } }),
  sharp,
  typescript: { outputFile: path.resolve('src/payload-types.ts') },
})
