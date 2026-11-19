import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_events_kind" AS ENUM('agenda_click', 'whatsapp_open', 'whatsapp_click', 'contact_submit', 'treatment_view');
  CREATE TABLE "site_events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum_site_events_kind" NOT NULL,
  	"path" varchar,
  	"label" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_pricing_plans" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"badge" varchar,
  	"title" varchar NOT NULL,
  	"price" varchar NOT NULL,
  	"subnote" varchar,
  	"highlighted" boolean DEFAULT false,
  	"features" varchar
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"whatsapp_enabled" boolean DEFAULT true,
  	"whatsapp_phone" varchar DEFAULT '+56 9 3863 0890',
  	"whatsapp_header_title" varchar DEFAULT 'WhatsApp',
  	"whatsapp_greeting1" varchar DEFAULT 'Hey 👋, bienvenido a **Fisio Invasiva**',
  	"whatsapp_greeting2" varchar DEFAULT '¿Cómo podemos ayudarte?',
  	"whatsapp_button_text" varchar DEFAULT 'Abrir chat',
  	"whatsapp_prefill_message" varchar DEFAULT 'Hola, me gustaría consultar y agendar una hora en Fisio Invasiva.',
  	"booking_url" varchar DEFAULT 'https://kinesiologofisioterapeutadeclaudiavalenzuela.site.agendapro.com/cl/sucursal/107922',
  	"booking_cta_text" varchar DEFAULT 'Agendar hora',
  	"phone_display" varchar DEFAULT '+56 9 3863 0890',
  	"email" varchar DEFAULT 'contacto@fisioinvasiva.cl',
  	"address" varchar DEFAULT 'Coyancura 2283 oficina 302, Providencia, Santiago',
  	"hours" varchar DEFAULT 'Lunes a sábado, 9:00 a 19:00',
  	"maps_url" varchar DEFAULT 'https://www.google.com/maps/search/?api=1&query=Coyancura+2283+Providencia+Santiago',
  	"instagram_url" varchar DEFAULT 'https://www.instagram.com/terapia_fisioinvasiva/',
  	"google_reviews_url" varchar DEFAULT 'https://share.google/ay32o4HwwQOiA1uTV',
  	"hero_title" varchar DEFAULT 'Somos **especialistas** y **pioneros**',
  	"hero_subtitle" varchar DEFAULT 'Kinesiología y fisioterapia invasiva con atención personalizada en Providencia.',
  	"about_quote" varchar DEFAULT 'Realizamos una terapia única de Fisioterapia invasiva en Chile, la cual se integra en el proceso de rehabilitación de nuestros pacientes con un enfoque personalizado.',
  	"about_signature" varchar DEFAULT 'Claudia Valenzuela Ríos',
  	"about_credentials" varchar DEFAULT '(PhD. PT. MSc. MOFI.)',
  	"visit_heading" varchar DEFAULT '¡Te esperamos! A pasos de metro Los Leones',
  	"pricing_intro" varchar DEFAULT 'Buscamos traer y accesibilizar en medida de lo posible nuestro trabajo que genera resultados y cambia la vida de nuestros pacientes.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "site_events_id" integer;
  ALTER TABLE "site_settings_pricing_plans" ADD CONSTRAINT "site_settings_pricing_plans_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_events_kind_idx" ON "site_events" USING btree ("kind");
  CREATE INDEX "site_events_path_idx" ON "site_events" USING btree ("path");
  CREATE INDEX "site_events_updated_at_idx" ON "site_events" USING btree ("updated_at");
  CREATE INDEX "site_events_created_at_idx" ON "site_events" USING btree ("created_at");
  CREATE INDEX "site_settings_pricing_plans_order_idx" ON "site_settings_pricing_plans" USING btree ("_order");
  CREATE INDEX "site_settings_pricing_plans_parent_id_idx" ON "site_settings_pricing_plans" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_site_events_fk" FOREIGN KEY ("site_events_id") REFERENCES "public"."site_events"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_site_events_id_idx" ON "payload_locked_documents_rels" USING btree ("site_events_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_events" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_pricing_plans" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_events" CASCADE;
  DROP TABLE "site_settings_pricing_plans" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_site_events_fk";
  
  DROP INDEX "payload_locked_documents_rels_site_events_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "site_events_id";
  DROP TYPE "public"."enum_site_events_kind";`)
}
