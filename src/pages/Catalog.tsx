import { useDeferredValue, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { PageHead } from '../components/PageHead'
import { ProductCard } from '../components/ProductCard'
import { CATEGORIES, categoryBySlug, fromPrice } from '../data/products'
import { useStore } from '../state/store'
import './pages.css'

type Sort = 'destacados' | 'menor' | 'mayor' | 'az'
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const PAGE = 24

export default function Catalog() {
  const { cat } = useParams()
  const { products } = useStore()
  const category = cat ? categoryBySlug.get(cat) : undefined
  const [params] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [sort, setSort] = useState<Sort>('destacados')
  const [sub, setSub] = useState('Todas')
  const [brand, setBrand] = useState(params.get('marca') ?? 'Todas')
  const [limit, setLimit] = useState(PAGE)
  const q = useDeferredValue(norm(query.trim()))

  // Al cambiar de categoría se limpian los filtros
  const [lastCat, setLastCat] = useState(cat)
  if (lastCat !== cat) {
    setLastCat(cat)
    setSub('Todas')
    setBrand(params.get('marca') ?? 'Todas')
    setLimit(PAGE)
  }

  const inCat = useMemo(() => products.filter((p) => !category || p.category === category.name), [products, category])
  const subs = useMemo(() => [...new Set(inCat.map((p) => p.sub).filter(Boolean) as string[])], [inCat])
  const brands = useMemo(() => [...new Set(inCat.map((p) => p.brand))].sort(), [inCat])

  const items = useMemo(() => {
    const list = inCat.filter(
      (p) =>
        (sub === 'Todas' || p.sub === sub) &&
        (brand === 'Todas' || p.brand === brand) &&
        (!q || norm(`${p.name} ${p.brand} ${p.sub ?? ''} ${p.category} ${p.variants?.map((v) => v.code).join(' ') ?? ''}`).includes(q)),
    )
    const price = (p: (typeof list)[number]) => fromPrice(p) ?? Number.POSITIVE_INFINITY
    if (sort === 'menor') return list.toSorted((a, b) => price(a) - price(b))
    if (sort === 'mayor') return list.toSorted((a, b) => (fromPrice(b) ?? -1) - (fromPrice(a) ?? -1))
    if (sort === 'az') return list.toSorted((a, b) => a.name.localeCompare(b.name, 'es'))
    return list.toSorted((a, b) => Number(!!b.featured) - Number(!!a.featured))
  }, [inCat, sub, brand, q, sort])

  return (
    <>
      <PageHead
        crumb={category ? category.name : 'Catálogo'}
        title={category ? category.name : 'Catálogo completo'}
        lead={category ? category.blurb : 'Motos, vehículos, plantas, energía solar y ferretería. Busca por modelo, marca o código del catálogo.'}
      >
        {category?.slug === 'ferreteria' ? (
          <Link className="link" to="/ferreteria/referencias" style={{ marginTop: 18 }}>Buscar entre todas las referencias Tolsen y Nexon con su precio</Link>
        ) : null}
      </PageHead>
      <div className="cat__bar">
        <div className="wrap" style={{ display: 'grid', gap: 14 }}>
          <nav className="seg cat__seg" aria-label="Categorías">
            <Link to="/catalogo" className={`seg__opt${!category ? ' active' : ''}`} aria-current={!category ? 'page' : undefined}>Todo</Link>
            {CATEGORIES.map((c) => (
              <Link key={c.slug} to={`/catalogo/${c.slug}`} className={`seg__opt${category?.slug === c.slug ? ' active' : ''}`} aria-current={category?.slug === c.slug ? 'page' : undefined}>
                {c.name}
              </Link>
            ))}
          </nav>
          <div className="cat__tools">
            <label className="cat__search">
              <span className="vh">Buscar producto</span>
              <Icon name="search" size={18} />
              <input className="input" type="search" placeholder="Busca por modelo, marca o código" value={query} onChange={(e) => { setQuery(e.target.value); setLimit(PAGE) }} />
            </label>
            <label>
              <span className="vh">Marca</span>
              <select className="input cat__select" value={brand} onChange={(e) => { setBrand(e.target.value); setLimit(PAGE) }}>
                <option value="Todas">Todas las marcas</option>
                {brands.map((b) => <option key={b}>{b}</option>)}
              </select>
            </label>
            <label>
              <span className="vh">Ordenar</span>
              <select className="input cat__select" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                <option value="destacados">Destacados</option>
                <option value="menor">Precio: menor a mayor</option>
                <option value="mayor">Precio: mayor a menor</option>
                <option value="az">Nombre: A a Z</option>
              </select>
            </label>
          </div>
          {subs.length > 1 ? (
            <div className="seg cat__seg cat__subs" role="group" aria-label="Subcategorías">
              {['Todas', ...subs].map((s) => (
                <button key={s} className="seg__opt seg__opt--sm" aria-pressed={sub === s} onClick={() => { setSub(s); setLimit(PAGE) }}>{s}</button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <section className="wrap" style={{ paddingBottom: 'var(--section)' }}>
        <p className="cat__count" aria-live="polite">{items.length === 1 ? '1 producto' : `${items.length} productos`}</p>
        {items.length ? (
          <>
            <div className="pgrid">
              {items.slice(0, limit).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {items.length > limit ? (
              <div style={{ display: 'grid', justifyItems: 'center', marginTop: 40 }}>
                <button className="btn btn--line" onClick={() => setLimit((l) => l + PAGE)}>Ver más ({items.length - limit} restantes)</button>
              </div>
            ) : null}
          </>
        ) : (
          <div className="empty">
            <h2 className="sec__title">No encontramos “{query}”.</h2>
            <p className="muted">Prueba con otra marca o pregúntale a un asesor: muchos productos llegan por pedido.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className="btn btn--line" onClick={() => { setQuery(''); setSub('Todas'); setBrand('Todas') }}>Limpiar filtros</button>
              <Link className="btn" to="/contacto">Hablar con un asesor</Link>
            </div>
          </div>
        )}
      </section>
    </>
  )
}
