// Catálogo de ARIA. La base sale de los catálogos de las marcas (src/data/catalog.json,
// generado con scripts/build-catalog.py). El panel admin agrega, edita u oculta productos encima de esta base.
import base from './catalog.json'

export type Category = 'Motos' | 'Cuatrimotos y UTV' | 'Vehículos' | 'Plantas eléctricas' | 'Energía solar' | 'Ferretería'

export type Variant = { code: string; size: string; price: number | null }

export type Product = {
  id: number
  slug: string
  category: Category
  /** Subcategoría: p. ej. "Scooters eléctricos", "Herramientas de corte" */
  sub?: string
  brand: string
  name: string
  /** Precio en US$. null = precio a consultar */
  price: number | null
  rentPerDay?: number | null
  /** Nombre del archivo en src/assets/products, o una URL/dataURL subida desde el admin */
  image: string
  condition: 'Nuevo' | 'Usado'
  highlight: string
  description: string
  specs: Record<string, string>
  features?: string[]
  variants?: Variant[]
  stock?: number
  hidden?: boolean
  featured?: boolean
}

export const CATEGORIES: { name: Category; slug: string; blurb: string }[] = [
  { name: 'Motos', slug: 'motos', blurb: 'Vento, Forza, Aichi, HJM y Loncin: de trabajo, urbanas, doble propósito, naked y eléctricas.' },
  { name: 'Cuatrimotos y UTV', slug: 'cuatrimotos', blurb: 'Loncin XWOLF, Hisun y Vento para campo, playa y trabajo pesado.' },
  { name: 'Vehículos', slug: 'vehiculos', blurb: 'Pickups ZX Auto, Toyota Corolla Cross, Nissan Sentra y GAC.' },
  { name: 'Plantas eléctricas', slug: 'plantas', blurb: 'Generadores Hyundai GD Power de 25 a 1000 kVA y Cummins residenciales.' },
  { name: 'Energía solar', slug: 'energia-solar', blurb: 'Inversores y paneles Greenenergy para casa, comercio y campo.' },
  { name: 'Ferretería', slug: 'ferreteria', blurb: 'Herramientas Tolsen, mallas y cerrajería Nexon y pintura ConstruY.' },
]

export const categoryBySlug = new Map(CATEGORIES.map((c) => [c.slug, c]))
export const slugByCategory = new Map(CATEGORIES.map((c) => [c.name, c.slug]))

export const BASE_PRODUCTS = base as unknown as Product[]

// Imágenes empaquetadas (WebP sin fondo). Vite les pone hash y solo incluye las que existen.
const files = import.meta.glob('../assets/products/*.webp', { eager: true, import: 'default' }) as Record<string, string>
const IMG = new Map(Object.entries(files).map(([k, v]) => [k.split('/').pop()!.replace('.webp', ''), v]))

export const imageSrc = (image: string) => (image.startsWith('data:') || image.startsWith('http') ? image : IMG.get(image) ?? '')
export const productImage = (p: Product) => imageSrc(p.image)

export const money = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: n < 100 && n % 1 ? 2 : 0, maximumFractionDigits: 2 }).format(n)

/** Precio para mostrar: el menor de las variantes con precio, o el del producto */
export function fromPrice(p: Product): number | null {
  const vs = p.variants?.map((v) => v.price).filter((x): x is number => typeof x === 'number' && x > 0)
  if (vs?.length) return Math.min(...vs)
  return p.price && p.price > 0 ? p.price : null
}

export function priceLabel(p: Product) {
  const f = fromPrice(p)
  if (f === null) return 'Precio a consultar'
  return p.variants && p.variants.length > 1 ? `Desde ${money(f)}` : money(f)
}

export const IVA = 0.16
