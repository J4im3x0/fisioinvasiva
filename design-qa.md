# Comparación visual de la landing

Referencia: https://fisioinvasiva.cl/. Se compararon secciones y recorridos en Chrome a 390 y 1440 px; se revisó además la versión local a 320, 768 y 1920 px. Las medidas son de cajas DOM tras cargar la página; las fotos originales usan carga diferida y aparecen al desplazarse.

| Elemento | Original | Versión local |
| --- | ---: | ---: |
| Navegación a 1440 px | x=285, ancho=804 | x=285, ancho=804 |
| Navegación a 1920 px | x=525, ancho=804 | x=525, ancho=804 |
| Primera tarjeta de tratamiento a 390 px | x=71, y=1886, ancho=248 | x=71, y=1886, ancho=248 |
| Primera tarjeta de tratamiento a 1920 px | x=329, ancho=401 | x=328, ancho=401 |
| Investigación a 390 px | x=57, y=3744 | x=57, y=3744 |
| Foto de la sede a 390 px | x=69, y=4649, 252×233 | x=69, y=4649, 252×233 |
| Precio inicial a 390 px | x=69, y=5599, ancho=252 | x=69, y=5599, ancho=252 |
| Foto de testimonios a 1440 px | x=659, y=6314, 654×507 | x=659, y=6314, 654×507 |
| Tarjeta de puntuación a 1440 px | x=986, y=6582, 399×132 | x=986, y=6582, 399×132 |

Se centró la navegación dentro del ancho de contenido, se ocultó la barra visible del carrusel sin bloquear el gesto de desplazamiento, se redujeron las tarjetas de tratamientos en pantallas anchas y se recuperó el texto junto a ambos enlaces “Conoce todos los tratamientos”. Se corrigieron el orden de Investigación y pasión, las proporciones de sede y precios, la escala de testimonios y la alineación del footer. La CTA fija mantiene “Agendar hora” visible en móvil.

La sección de Google usa Places API (New) desde el servidor cuando se configura `GOOGLE_PLACES_API_KEY` y, opcionalmente, `GOOGLE_PLACE_ID`. Sin clave, ofrece el enlace directo a la ficha indicada por el propietario. La API no guarda reseñas ni expone la clave al navegador. Se probaron respuestas simuladas con selección de sede y reseña, además del estado sin configurar. No se verificó la respuesta real de Google porque no hay clave en este PC.

Verificado localmente: `npm run build`, ausencia de desbordamiento horizontal y de barra visible de las tarjetas a 320/390/768/1440/1920 px, menú móvil, representación de una reseña simulada, enlace de agenda y conservación de `utm_source` y `gclid` en la redirección a AgendaPro. Se comprobaron fotos de testimonios y logo de Google tras desplazamiento.

Pendiente de entorno: Docker y PostgreSQL no están disponibles en este PC. Las rutas dinámicas de contenido requieren levantar la base y ejecutar la importación antes de comprobarlas; `/admin`, el formulario con envío real y la API real de Google no se probaron. La publicación en el servidor y las pruebas de producción siguen a cargo del propietario según el plan aprobado.

## Carrusel de reseñas

La página original `/testimonios/` incluye un widget Trustindex de WordPress con diseño `slider`, tres tarjetas visibles y avance cada seis segundos. Su HTML y hoja de estilos proceden del plugin de WordPress, por lo que no son una fuente automática independiente para la nueva web. La versión Next.js consulta Places API (New) al entrar en la sección y presenta sus reseñas en un carrusel de tres tarjetas en escritorio, dos en tableta y una en móvil. Las flechas, puntos, deslizamiento táctil y avance automático funcionan; el avance se pausa al pasar el cursor o mantener el foco y se desactiva con movimiento reducido.

Verificado con cinco reseñas simuladas en Chrome a 390, 768 y 1440 px: cantidad de tarjetas y puntos, flechas anterior/siguiente, avance automático, gesto táctil, movimiento reducido, ausencia de barra visible y ausencia de desbordamiento horizontal. También se verificaron los estados de una sola reseña y sin clave, la atribución con el logo oficial de Google Maps, el mapeo de la respuesta y `npm run build`. No se han visto reseñas reales en la nueva web porque aún no se configuró `GOOGLE_PLACES_API_KEY`; Google Places devuelve como máximo cinco reseñas por relevancia. Para más reseñas se requiere la API de Google Business Profile y OAuth de la ficha verificada.

## Carruseles de tratamientos

La portada original usa dos carruseles Elementor/Swiper con cinco puntos, flechas, tres tarjetas en escritorio, dos en tableta y una en móvil, avance cada cinco segundos y navegación circular. La versión local ahora usa Swiper con esas mismas pautas; conserva las dimensiones ya ajustadas de las tarjetas y no muestra barra de desplazamiento.

Verificado en Chrome a 320, 390, 768, 1440 y 1920 px: cinco puntos en ambos grupos, tarjetas visibles 1/2/3 según ancho, flechas anterior/siguiente, navegación circular desde el último tratamiento, avance automático, gesto táctil y ausencia de desbordamiento horizontal. Con movimiento reducido no avanza automáticamente. A 390 px la sección Investigación sigue en y=3744 y a 1440 px en y≈3913, dentro de un píxel de la comparación anterior. `npm run build` terminó correctamente.

## Header sticky de ancho completo

El fondo blanco sticky ahora ocupa todo el ancho del viewport; el logo, la navegación y el teléfono conservan el contenedor centrado de 1440 px. Verificado después de desplazarse a 320, 390, 768, 1440, 1920 y 2540 px: header x=0, ancho igual al viewport, y=0, navegación en la misma posición anterior y sin desbordamiento horizontal. El menú móvil abre después del desplazamiento. `npm run build` pasó.
