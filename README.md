# Fisio Invasiva — migración en desarrollo

**No publicar todavía.** Esta versión requiere ejecutar y revisar la importación completa, comprobar las rutas e imágenes y validar el formulario y la publicación desde Payload. El XML de WordPress no es un respaldo completo.

## Requisitos y configuración

Docker Compose en el servidor y Nginx externo con HTTPS ya instalado. Copia `.env.example` a `.env`; establece una contraseña de PostgreSQL fuerte y alfanumérica y un `PAYLOAD_SECRET` aleatorio largo. Configura SMTP y `CONTACT_FROM` para que el formulario envíe a `CONTACT_TO` (la exportación indica contacto@fisioinvasiva.cl). No subas `.env` ni la exportación a Git.

Ejecuta `docker compose up -d --build`. Solo la app expone el puerto 3000 en 127.0.0.1; PostgreSQL permanece dentro de Docker. En una prueba, usa un hostname privado con autenticación, sin afectar al WordPress activo. El ejemplo `nginx.example.conf` muestra el bloque que se debe adaptar al servidor HTTPS existente. Protege el acceso a la instancia de prueba y crea el primer usuario en `/admin` antes de hacerla accesible; conserva sus credenciales de forma segura.

La migración inicial de PostgreSQL está en `src/migrations` y Payload la ejecuta al inicializarse en producción. Conserva los volúmenes `pgdata` y `media` entre reconstrucciones del contenedor.

## Prueba en dev.fisioinvasiva.cl

Apunta el subdominio al servidor y crea un bloque HTTPS separado en el Nginx existente con `server_name dev.fisioinvasiva.cl`. Usa el proxy de `nginx.example.conf` hacia `127.0.0.1:3000`; deja el bloque de `fisioinvasiva.cl` apuntando a WordPress. Protege el subdominio con autenticación y envía `X-Robots-Tag: noindex, nofollow` para que la copia no aparezca en buscadores.

En el directorio del repositorio del servidor, crea `.env` desde `.env.example`, configura al menos `POSTGRES_PASSWORD` y `PAYLOAD_SECRET`, y ejecuta `docker compose up -d --build`. Compose genera `DATABASE_URL` con el host interno `db`; no tienes que definirlo en `.env` para el despliegue. Abre `https://dev.fisioinvasiva.cl/admin` para crear el primer usuario de Payload. El autor de WordPress se conserva como texto en los artículos importados; su cuenta para publicar en Payload se crea por separado en `/admin`.

## Importación

Copia la exportación WXR dentro del contenedor con `docker compose cp /ruta/exportacion.xml app:/tmp/wordpress.xml` y ejecuta `docker compose exec app npm run import:wordpress -- /tmp/wordpress.xml --inventory` para inventariar. Ejecuta luego el mismo comando sin `--inventory` para importar. El script actualiza por ID de WordPress y genera `/app/informe-importacion.md`; cópialo fuera con `docker compose cp app:/app/informe-importacion.md ./informe-importacion.md`. Cada sincronización sobrescribe los campos importados: evita editar esos campos en Payload hasta después de la última sincronización.

WordPress debe seguir en línea durante la importación porque el script descarga de allí las imágenes públicas utilizadas. Comprueba el resultado con `docker compose exec db psql -U fisio -d fisio -c "SELECT kind, visibility, count(*) FROM content GROUP BY kind, visibility ORDER BY kind, visibility;"`, revisa `/blog/` y abre cada artículo en el subdominio. Las rutas de los artículos se importan desde sus URLs originales. Los enlaces absolutos dentro del HTML pueden seguir llevando al WordPress principal durante la prueba; el sitemap actual también usa el dominio principal.

La exportación encontrada contiene 12 entradas públicas, 6 páginas públicas, 1 privada y 105 adjuntos. Revisa el informe: Elementor, widgets, shortcodes, vídeos, formatos de SEO y medios no públicos pueden requerir intervención manual. Las referencias de medios que no puedan descargarse deberán resolverse antes de modificar el dominio. El HTML es editable en Payload como texto HTML; no es una conversión completa al editor visual de WordPress. La página de inicio se implementa por separado y la copia importada no la modifica.

## Antes de cambiar el dominio

1. Respalda base de datos y archivos completos de WordPress; conserva su configuración Nginx y confirma cómo restaurarlos. Respalda también los volúmenes de PostgreSQL y media de la prueba.
2. En WordPress congela los cambios editoriales; exporta otra vez e importa la última copia. Revisa el informe y compara totales por estado, contenido, imágenes y URLs. Valida en privado las páginas sensibles. El script no elimina contenido que haya desaparecido de la exportación: compáralo y resuelve diferencias manualmente.
3. Verifica sitemap, 301 necesarios, rutas, formulario con un envío real, enlace y medición de AgendaPro, y la publicación desde `/admin`. La configuración de medición antigua requiere inspección adicional. No cambies el tráfico si hay fallos o referencias antiguas sin resolver.
4. Apunta el Nginx HTTPS existente a `127.0.0.1:3000`, comprueba las funciones anteriores en producción y supervisa errores. Si falla una función crítica, restaura la configuración Nginx anterior y vuelve a iniciar WordPress con su base y archivos intactos.

## Desarrollo local

Si ejecutas la app fuera de Docker con `npm run dev`, configura `DATABASE_URL` hacia una instancia de PostgreSQL accesible desde tu PC y `PAYLOAD_SECRET` en `.env`. Para desplegar con Compose, basta con `POSTGRES_PASSWORD` y `PAYLOAD_SECRET`. `npm run typecheck` comprueba tipos y `npm run build` compila producción.

## Reseñas de Google

La sección muestra un carrusel con flechas, deslizamiento táctil y avance automático cada seis segundos. El avance se pausa al pasar el cursor o mantener el foco y respeta la preferencia de movimiento reducido. Para traer reseñas actuales, habilita Places API (New) y facturación en Google Cloud y configura `GOOGLE_PLACES_API_KEY` en `.env` del contenedor. `GOOGLE_PLACE_ID` es opcional: si falta, la app busca la ficha por nombre y dirección. Google entrega hasta cinco reseñas por relevancia; el carrusel las consulta al abrir la sección, sin almacenarlas. La clave solo se usa en el servidor. Comprueba que la ficha encontrada corresponde a Coyancura 2283 antes de publicar. Sin clave, permanece el enlace directo a Google. Para mostrar todas las reseñas en el sitio se necesitaría acceso OAuth a la ficha verificada mediante Google Business Profile API.

Antes de activar Places, revisa que las páginas públicas de términos y privacidad incluyan los términos y la política de privacidad de Google, como exige la [política de Places API](https://developers.google.com/maps/documentation/places/web-service/policies).
