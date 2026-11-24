# ARIA — Sistema de diseño (web oficial)

## Brief
- **Qué es:** ARIA Inventory & Mobility, comercializadora en Lechería (Anzoátegui, Venezuela): motos, vehículos, plantas eléctricas (venta y alquiler), energía solar, accesorios y ferretería.
- **Para quién:** personas que compran su moto o carro y negocios que necesitan energía o herramientas. Llegan sobre todo desde Instagram y el celular.
- **Trabajo principal de la página:** que el visitante encuentre el producto, vea su precio y especificaciones, y cotice o compre sin hablar con nadie si no quiere.
- **Restricciones del cliente (no se negocian):** todo el fondo blanco, un solo color (verde ARIA `#07803F`) y solo en lo que se puede tocar. Los textos nunca van en verde. Nada de emojis.

## Color
| Token | Hex | Uso |
|---|---|---|
| `--paper` | `#FFFFFF` | Fondo de todo |
| `--ink` | `#1D1D1F` | Títulos y texto principal |
| `--ink-2` | `#5E6166` | Texto secundario (contraste 6,2:1) |
| `--line` | `#E4E5E7` | Líneas y bordes |
| `--green` | `#07803F` | Botones, estados activos, foco, progreso (5,1:1 con blanco) |
| `--green-press` | `#066A34` | Botón presionado o en hover |

## Tipografía
Una sola familia: **Instrument Sans** (variable, con eje de ancho).
- **Títulos:** ancho condensado (`wdth` 78), peso 600, interlineado apretado. El ancho condensado recuerda las placas y fichas técnicas del mundo motor y permite titulares enormes en el celular.
- **Texto:** ancho normal, peso 400, 17 px, interlineado 1,5.
- **Cifras y precios:** números tabulares (`tabular-nums`) para que las columnas de specs se alineen.
- Escala: 13 · 15 · 17 · 21 · 28 · 40 · 56 · 80 · 128.
- Sin etiquetas en mayúsculas sostenidas, sin flechas pegadas al texto de botones.

## Layout
**Concepto: la sala de exhibición.** Fondo blanco como el piso de un showroom; los productos recortados se apoyan sobre una línea de horizonte fina, como en un estudio fotográfico. Las fichas técnicas se leen como tablas, no como tarjetas decoradas.

```
┌────────────────────────────────────────────────────────────┐
│ ARIA            Catálogo Energía Servicios Aliados   [ 2 ] │
├────────────────────────────────────────────────────────────┤
│ Lo que mueve                                               │
│ a Lechería.            (titular condensado gigante)        │
│                                                            │
│ [Motos][Vehículos][Plantas][Solar][Ferretería]  ← selector │
│            ┌───────────────────────┐   Suzuki GSX-R 1000    │
│            │   producto recortado   │   999 cc · ABS        │
│ ───────────┴───────────────────────┴── $14.900  [Ver]      │
└────────────────────────────────────────────────────────────┘
```
- Grid de 12 columnas, ancho máximo 1240 px, alineado a la izquierda (el inicio de cada línea es fijo y el ojo no salta).
- Índice de categorías como filas grandes de texto condensado; en escritorio la foto aparece junto al cursor.
- En móvil, todo a una columna, botones de 48 px de alto y carrito siempre accesible.

## Principios
1. **Un solo momento memorable:** el selector del hero, que cambia el producto en exhibición y su ficha. El resto es silencioso.
2. **El verde significa “puedes tocar esto”.** Si algo no es interactivo, no es verde.
3. **La información es el adorno:** precio, cilindraje, potencia y garantía, siempre visibles y alineados.
4. **El movimiento responde a la persona** (seleccionar, abrir, agregar al carrito). No hay animaciones de entrada en cada sección.
5. **Base de calidad:** contraste AA, foco visible, `prefers-reduced-motion`, móvil desde 360 px.

## Revisión contra el brief
- *Primer borrador:* hero centrado con carrusel automático, tarjetas flotantes de vidrio y cifras que cuentan solas. **Lo cambié** porque es el tratamiento por defecto de cualquier tienda y el carrusel automático le quita el control al visitante. Ahora el visitante elige qué ver.
- *Primer borrador:* etiquetas pequeñas en mayúsculas encima de cada título. **Las quité**: son plantilla y no informan nada.
- *Primer borrador:* tarjetas idénticas con la misma sombra para todo. **Lo cambié** por tablas y filas con líneas finas; las tarjetas quedan solo para productos.
- *Primer borrador:* fuente del sistema (estilo Apple). **La cambié** por Instrument Sans condensada, que le da identidad propia a ARIA sin perder la limpieza que el cliente aprobó.
