// Catálogo de ejemplo. Al conectar el panel admin, esto vendrá de la API.
import { img, type ImgKey } from './images'

export type Category = 'Motos' | 'Vehículos' | 'Plantas' | 'Energía solar' | 'Accesorios' | 'Ferretería'

export type Product = {
  id: number
  slug: string
  category: Category
  brand: string
  name: string
  price: number
  /** Precio de alquiler por día, si aplica */
  rentPerDay?: number
  image: ImgKey
  /** cutout = foto con fondo blanco (se integra al piso); photo = foto con fondo */
  look: 'cutout' | 'photo'
  condition: 'Nuevo' | 'Usado'
  highlight: string
  description: string
  specs: Record<string, string>
}

export const CATEGORIES: { name: Category; slug: string; blurb: string; image: ImgKey; look: Product['look'] }[] = [
  { name: 'Motos', slug: 'motos', blurb: 'Urbanas, naked y deportivas. Con póliza en Vento.', image: 'gsx', look: 'photo' },
  { name: 'Vehículos', slug: 'vehiculos', blurb: 'SUV y sedanes nuevos, revisados uno por uno.', image: 'tracker', look: 'cutout' },
  { name: 'Plantas', slug: 'plantas', blurb: 'Generadores para casa, comercio e industria. Venta y alquiler.', image: 'toyama', look: 'cutout' },
  { name: 'Energía solar', slug: 'energia-solar', blurb: 'Inversores Greenenergy para dejar de depender de la red.', image: 'solar', look: 'photo' },
  { name: 'Accesorios', slug: 'accesorios', blurb: 'Cascos certificados y chaquetas con protecciones.', image: 'casco', look: 'photo' },
  { name: 'Ferretería', slug: 'ferreteria', blurb: 'Herramientas manuales, de obra y la línea Maurer.', image: 'tools', look: 'photo' },
]

export const categoryBySlug = new Map(CATEGORIES.map((c) => [c.slug, c]))
export const slugByCategory = new Map(CATEGORIES.map((c) => [c.name, c.slug]))

export const PRODUCTS: Product[] = [
  { id: 1, slug: 'vento-200-poliza', category: 'Motos', brand: 'Vento', name: 'Vento 200 con póliza', price: 1450, image: 'vento', look: 'photo', condition: 'Nuevo', highlight: 'Póliza de seguro incluida', description: 'La moto de trabajo que ya sale asegurada. Todas las Vento se entregan con póliza de Seguros Caracas.', specs: { Cilindraje: '200 cc', Transmisión: '5 velocidades', Seguro: 'Póliza incluida', Garantía: '2 años' } },
  { id: 2, slug: 'aichi-spike-150', category: 'Motos', brand: 'Aichi', name: 'Aichi Spike 150', price: 1280, image: 'spike', look: 'photo', condition: 'Nuevo', highlight: 'Freno de doble banda', description: 'Económica y resistente, con sistema de freno de doble banda y tablero análogo.', specs: { Cilindraje: '150 cc', Frenos: 'Doble banda', Rendimiento: '35 km/L', Garantía: '2 años o 20.000 km' } },
  { id: 3, slug: 'hjm-150-clasica', category: 'Motos', brand: 'HJM', name: 'HJM 150 Clásica', price: 1190, image: 'moto', look: 'cutout', condition: 'Nuevo', highlight: 'La más vendida', description: 'Diseño clásico, mantenimiento sencillo y repuestos disponibles en tienda.', specs: { Cilindraje: '150 cc', Luces: 'Halógenas', Tablero: 'Tacómetro análogo', Garantía: '1 año' } },
  { id: 4, slug: 'loncin-cuatrimoto-4x4', category: 'Motos', brand: 'Loncin', name: 'Cuatrimoto Loncin 4x4', price: 7800, image: 'atv', look: 'cutout', condition: 'Nuevo', highlight: 'Tracción 4x4', description: 'Para campo, playa y trabajo pesado. Dos puestos y tracción seleccionable.', specs: { Motor: '550 cc', Tracción: '4x4 seleccionable', Puestos: '2', Garantía: '1 año' } },
  { id: 5, slug: 'suzuki-gsx-r-1000', category: 'Motos', brand: 'Suzuki', name: 'Suzuki GSX-R 1000', price: 14900, image: 'gsx', look: 'photo', condition: 'Nuevo', highlight: 'Deportiva de 999 cc', description: 'Superbike de cuatro cilindros con frenos Brembo y ABS de curva.', specs: { Cilindraje: '999 cc', Potencia: '199 hp', Frenos: 'Brembo con ABS', Garantía: '2 años' } },
  { id: 6, slug: 'yamaha-mt-03', category: 'Motos', brand: 'Yamaha', name: 'Yamaha MT-03', price: 4900, image: 'mt03', look: 'photo', condition: 'Usado', highlight: '8.200 km, un dueño', description: 'Naked ligera para ciudad y carretera, revisada en nuestro taller.', specs: { Cilindraje: '321 cc', Kilometraje: '8.200 km', Frenos: 'Disco con ABS', Garantía: '6 meses' } },
  { id: 7, slug: 'kawasaki-z800', category: 'Motos', brand: 'Kawasaki', name: 'Kawasaki Z800', price: 7200, image: 'z800', look: 'photo', condition: 'Usado', highlight: '806 cc, cuatro cilindros', description: 'Naked de media cilindrada con mucho torque y posición cómoda.', specs: { Cilindraje: '806 cc', Kilometraje: '14.500 km', Color: 'Verde y negro', Garantía: '6 meses' } },
  { id: 8, slug: 'chevrolet-tracker-2024', category: 'Vehículos', brand: 'Chevrolet', name: 'Chevrolet Tracker 2024', price: 21900, image: 'tracker', look: 'cutout', condition: 'Nuevo', highlight: 'Turbo 1.2, automática', description: 'SUV compacta con motor turbo, seis bolsas de aire y pantalla de 8 pulgadas.', specs: { Año: '2024', Motor: '1.2 turbo', Transmisión: 'Automática', Garantía: '3 años o 100.000 km' } },
  { id: 9, slug: 'toyota-corolla-cross-hibrida', category: 'Vehículos', brand: 'Toyota', name: 'Toyota Corolla Cross Híbrida', price: 32500, image: 'corolla', look: 'cutout', condition: 'Nuevo', highlight: 'Híbrida, 21 km/L', description: 'La SUV híbrida de Toyota: bajo consumo, Toyota Safety Sense y garantía de batería.', specs: { Año: '2025', Motor: '1.8 híbrido', Consumo: '21 km/L', Garantía: '3 años; batería 8 años' } },
  { id: 10, slug: 'kia-k3-2024', category: 'Vehículos', brand: 'Kia', name: 'Kia K3 2024', price: 19800, image: 'k3', look: 'cutout', condition: 'Nuevo', highlight: 'Sedán eficiente', description: 'Sedán moderno con buen espacio, conectividad y bajo consumo.', specs: { Año: '2024', Motor: '1.6', Transmisión: 'Automática CVT', Garantía: '3 años' } },
  { id: 11, slug: 'suv-compacta-azul', category: 'Vehículos', brand: 'Changan', name: 'Changan CS55 Plus', price: 24500, image: 'suv', look: 'photo', condition: 'Nuevo', highlight: '0 km, techo panorámico', description: 'SUV compacta con techo panorámico, cámara 360 y motor turbo.', specs: { Año: '2024', Motor: '1.5 turbo', Transmisión: 'Automática', Garantía: '3 años' } },
  { id: 12, slug: 'cummins-residencial', category: 'Plantas', brand: 'Cummins', name: 'Generador Cummins residencial 13 kW', price: 6900, rentPerDay: 90, image: 'gen', look: 'photo', condition: 'Nuevo', highlight: 'Arranque automático', description: 'Planta silenciosa a gas o gasolina con transferencia automática. Instalación incluida.', specs: { Potencia: '13 kW', Combustible: 'Gas o gasolina', Transferencia: 'Automática', Garantía: '2 años' } },
  { id: 13, slug: 'genmaq-30-kva', category: 'Plantas', brand: 'Genmaq', name: 'Planta Genmaq 30 kVA insonorizada', price: 11800, rentPerDay: 150, image: 'genmaq', look: 'photo', condition: 'Nuevo', highlight: 'Para comercio e industria', description: 'Planta diésel con cabina insonorizada, ideal para locales, edificios y obras.', specs: { Potencia: '30 kVA', Combustible: 'Diésel', Cabina: 'Insonorizada', Garantía: '2 años' } },
  { id: 14, slug: 'toyama-tg3100', category: 'Plantas', brand: 'Toyama', name: 'Generador Toyama TG3100', price: 520, rentPerDay: 25, image: 'toyama', look: 'cutout', condition: 'Nuevo', highlight: 'Portátil, 3 kVA', description: 'Generador portátil para nevera, luces y equipos pequeños durante los cortes.', specs: { Potencia: '3 kVA', Combustible: 'Gasolina', Arranque: 'Manual', Autonomía: '10 h al 50 %' } },
  { id: 15, slug: 'ducati-dgr-2500', category: 'Plantas', brand: 'Ducati Energia', name: 'Generador Ducati DGR 2500S', price: 640, rentPerDay: 30, image: 'ducati', look: 'cutout', condition: 'Nuevo', highlight: 'Arranque eléctrico', description: 'Portátil con ruedas, arranque eléctrico y voltímetro integrado.', specs: { Potencia: '2,5 kVA', Combustible: 'Gasolina', Arranque: 'Eléctrico', Peso: '42 kg' } },
  { id: 16, slug: 'inversor-greenenergy', category: 'Energía solar', brand: 'Greenenergy', name: 'Inversor híbrido Greenenergy', price: 1250, image: 'solar', look: 'photo', condition: 'Nuevo', highlight: 'De 3.000 a 12.500 VA', description: 'Inversor con cargador MPPT para paneles y baterías de litio. Instalación con técnico certificado.', specs: { Potencia: '3.000 a 12.500 VA', Cargador: 'MPPT', Uso: 'Hogar y negocio', Garantía: '1 año' } },
  { id: 17, slug: 'casco-cross-hro', category: 'Accesorios', brand: 'HRO', name: 'Casco cross HRO', price: 85, image: 'casco', look: 'photo', condition: 'Nuevo', highlight: 'Certificado DOT', description: 'Casco de cross liviano con ventilación frontal y visera ajustable.', specs: { Tipo: 'Cross', Tallas: 'S a XL', Certificación: 'DOT', Disponibles: '22' } },
  { id: 18, slug: 'chaqueta-edge', category: 'Accesorios', brand: 'Edge', name: 'Chaqueta Edge con protecciones', price: 120, image: 'jacket', look: 'photo', condition: 'Nuevo', highlight: 'Reflectiva', description: 'Chaqueta impermeable con protecciones en hombros y codos y paneles reflectivos.', specs: { Protecciones: 'Hombros y codos', Tallas: 'S a XXL', Material: 'Cordura impermeable', Disponibles: '15' } },
  { id: 19, slug: 'set-herramientas', category: 'Ferretería', brand: 'ARIA Pro', name: 'Set de herramientas manuales', price: 58, image: 'tools', look: 'photo', condition: 'Nuevo', highlight: '24 piezas', description: 'Martillos, llaves, alicates y cortador en acero al cromo vanadio.', specs: { Piezas: '24', Material: 'Cromo vanadio', Garantía: '6 meses', Disponibles: '40' } },
  { id: 20, slug: 'kit-pintura', category: 'Ferretería', brand: 'ARIA Pro', name: 'Kit de pintura y brochas', price: 42, image: 'worker', look: 'photo', condition: 'Nuevo', highlight: 'Para obra y hogar', description: 'Rodillos, brochas, bandeja y cinta para pintar un espacio completo.', specs: { Incluye: 'Rodillos, brochas, bandeja y cinta', Uso: 'Obra y hogar', Garantía: '3 meses', Disponibles: '65' } },
  { id: 21, slug: 'linea-maurer', category: 'Ferretería', brand: 'Maurer', name: 'Línea Maurer de obra y jardín', price: 96, image: 'maurer', look: 'photo', condition: 'Nuevo', highlight: 'Precio por volumen', description: 'Palas, picos, rastrillos y herramientas de jardín de la marca Maurer.', specs: { Tipo: 'Obra y jardín', Marca: 'Maurer', Garantía: '12 meses', Disponibles: '28' } },
]

export const productBySlug = new Map(PRODUCTS.map((p) => [p.slug, p]))
export const productById = new Map(PRODUCTS.map((p) => [p.id, p]))

export const productImage = (p: Product) => img[p.image]

export const money = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export const IVA = 0.16
