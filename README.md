# ARIA Inventory & Mobility — web oficial

Tienda en línea de ARIA (Lechería, Anzoátegui): motos, vehículos, plantas eléctricas, energía solar, accesorios y ferretería.
Hecha en **React + TypeScript + Vite**. Diseño y desarrollo: GW Studios.

## Cómo correrla

```bash
npm install
npm run dev      # servidor local en http://localhost:5173
npm run build    # genera la carpeta dist/ lista para publicar
npm run preview  # sirve el build para revisarlo
```

## Publicar en GitHub Pages
1. Sube el proyecto a la rama `main`.
2. En GitHub: **Settings → Pages → Source: GitHub Actions**.
3. Cada push a `main` publica la web con `.github/workflows/deploy.yml`.

Las rutas usan `HashRouter` (`/#/catalogo`), así funcionan en GitHub Pages sin configuración extra.

## Estructura
```
src/
  data/        productos, categorías, textos de la marca e imágenes
  state/       carrito (con historial de facturas) y avisos
  components/  encabezado, pie, tarjeta de producto, íconos
  pages/       una página por ruta (se cargan bajo demanda)
  styles/      tokens de diseño (tokens.css) y estilos base
DESIGN.md      sistema de diseño: color, tipografía, layout y principios
prototipo/     el prototipo HTML anterior, como referencia
```

## Rutas
| Ruta | Página |
|---|---|
| `/` | Inicio |
| `/catalogo` y `/catalogo/:categoria` | Catálogo con filtros |
| `/producto/:slug` | Ficha del producto |
| `/energia` | Plantas, alquiler y solar |
| `/servicios`, `/nosotros`, `/aliados`, `/noticias`, `/contacto` | Contenido |
| `/carrito` → `/pago` → `/recibo/:numero` | Compra, factura o cotización y recibo en PDF |

## Pendiente para producción
- Reemplazar textos y cifras de ejemplo (`src/data/site.ts`) con la información real de ARIA.
- Conectar el catálogo al panel de administrador (hoy vive en `src/data/products.ts`).
- Envío real del recibo por correo (necesita un backend o servicio de correo).
- Fotos de producto en alta resolución.
