# Eventos — JSON + Markdown

Cada evento es un par de archivos con el **mismo nombre** (slug):

```
src/content/events/
  mi-evento.json    ← metadatos (fecha, lugar, agenda, Meetup…)
  mi-evento.md      ← cuerpo narrativo en Markdown
```

## Crear un evento nuevo

1. Copia la plantilla:
   ```bash
   cp src/content/events/_template/event.json src/content/events/mi-evento.json
   cp src/content/events/_template/event.md src/content/events/mi-evento.md
   ```

2. Edita `mi-evento.json` con los datos del evento.

3. Escribe el contenido en `mi-evento.md` (párrafos, negritas, listas).

4. Opcional: agrega el archivo `.ics` en `public/events/mi-evento.ics`.

5. Haz push → Amplify reconstruye el sitio automáticamente.

## Campos importantes en JSON

| Campo | Descripción |
|-------|-------------|
| `slug` | URL del evento: `/eventos/{slug}` |
| `date` | Fecha ISO: `2026-07-09` |
| `published` | `false` para ocultar sin borrar |
| `thumbnail` | Imagen 1:1 de alta resolución |
| `meetupUrl` | Link de registro |
| `description` | Resumen para tarjetas del grid |

`dateLabel` y `dateFormatted` se generan solos a partir de `date`.

## Plantilla de correo

Para invitaciones por email, crea un HTML en `/mail/` basado en `kickoff-2026-invitacion.html`.
