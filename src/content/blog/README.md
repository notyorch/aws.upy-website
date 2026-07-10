# Blog — JSON + Markdown

Cada entrada es un par de archivos con el **mismo nombre** (slug):

```
src/content/blog/
  mi-entrada.json    ← metadatos
  mi-entrada.md      ← cuerpo en Markdown
```

## Crear una entrada

1. Copia la plantilla:
   ```bash
   cp src/content/blog/_template/post.json src/content/blog/mi-entrada.json
   cp src/content/blog/_template/post.md src/content/blog/mi-entrada.md
   ```

2. Edita el JSON (título, fecha, tags, `instagramUrl`…).

3. Escribe el Markdown.

4. Push → Amplify rebuild.

## Campos JSON

| Campo | Descripción |
|-------|-------------|
| `slug` | URL: `/blog/{slug}` |
| `date` | Fecha ISO: `2026-07-09` |
| `published` | `false` para ocultar |
| `instagramUrl` | Link del post de Instagram a incrustar (opcional) |
| `description` | Resumen para tarjetas |

## Instagram

Pon la URL del post en `instagramUrl`. La página carga el embed oficial de Instagram.
Si está vacío, se muestra un placeholder listo para el embed.
