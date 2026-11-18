import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "content_sections_left_gallery" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "image_id" integer
  );

  CREATE TABLE "content_sections_right_gallery" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "image_id" integer
  );

  CREATE TABLE "content_sections" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "left_body" jsonb,
    "left_video_url" varchar,
    "left_video_portrait" boolean,
    "right_body" jsonb,
    "right_video_url" varchar,
    "right_video_portrait" boolean
  );

  ALTER TABLE "content_sections_left_gallery" ADD CONSTRAINT "content_sections_left_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_sections_left_gallery" ADD CONSTRAINT "content_sections_left_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_sections_right_gallery" ADD CONSTRAINT "content_sections_right_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_sections_right_gallery" ADD CONSTRAINT "content_sections_right_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_sections" ADD CONSTRAINT "content_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "content_sections_left_gallery_order_idx" ON "content_sections_left_gallery" USING btree ("_order");
  CREATE INDEX "content_sections_left_gallery_parent_id_idx" ON "content_sections_left_gallery" USING btree ("_parent_id");
  CREATE INDEX "content_sections_left_gallery_image_idx" ON "content_sections_left_gallery" USING btree ("image_id");
  CREATE INDEX "content_sections_right_gallery_order_idx" ON "content_sections_right_gallery" USING btree ("_order");
  CREATE INDEX "content_sections_right_gallery_parent_id_idx" ON "content_sections_right_gallery" USING btree ("_parent_id");
  CREATE INDEX "content_sections_right_gallery_image_idx" ON "content_sections_right_gallery" USING btree ("image_id");
  CREATE INDEX "content_sections_order_idx" ON "content_sections" USING btree ("_order");
  CREATE INDEX "content_sections_parent_id_idx" ON "content_sections" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "content_sections_left_gallery" CASCADE;
  DROP TABLE "content_sections_right_gallery" CASCADE;
  DROP TABLE "content_sections" CASCADE;`)
}
