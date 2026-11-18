import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "content" ADD COLUMN "body" jsonb;
  ALTER TABLE "content" ADD COLUMN "use_visual_editor" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "content" DROP COLUMN "body";
  ALTER TABLE "content" DROP COLUMN "use_visual_editor";`)
}
