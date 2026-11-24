import { useDeferredValue, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { PageHead } from '../components/PageHead'
import { ProductCard } from '../components/ProductCard'
import { CATEGORIES, PRODUCTS, categoryBySlug } from '../data/products'
import './pages.css'

type Sort = 'destacados' | 'menor' | 'mayor'
type Cond = 'Todos' | 'Nuevo' | 'Usado'

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export default function Catalog() {
  const { cat } = useParams()
  const category = cat ? categoryBySlug.get(cat) : undefined
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<Sort>('destacados')
  const [cond, setCond] = useState<Cond>('Todos')
  const q = useDeferredValue(norm(query.trim()))

  const items = useMemo(() => {
    const list = PRODUCTS.filter(
      (p) =>
        (!category || p.category === category.name) &&
        (cond === 'Todos' || p.condition === cond) &&
        (!q || norm(`${p.name} ${p.brand} ${p.category}`).includes(q)),
    )
    if (sort === 'menor') return list.toSorted((a, b) => a.price - b.price)
    if (sort === 'mayor') return list.toSorted((a, b) => b.price - a.price)
    return list
  }, [category, cond, q, sort])

  return (
    <>
      <PageHead
        crumb={category ? category.name : 'Catálogo'}
        title={category ? category.name : 'Catálogo completo'}
        lead={category ? category.blurb : 'Filtra por línea, busca por marca y compara precios. Todo en dólares, IVA 16 % aparte.'}
      />
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
              <input className="input" type="search" placeholder="Busca por modelo o marca" value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
            <label>
              <span className="vh">Estado</span>
              <select className="input cat__select" value={cond} onChange={(e) => setCond(e.target.value as Cond)}>
                <option value="Todos">Nuevos y usados</option>
                <option value="Nuevo">Solo nuevos</option>
                <option value="Usado">Solo usados</option>
              </select>
            </label>
            <label>
              <span className="vh">Ordenar</span>
              <select className="input cat__select" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                <option value="destacados">Destacados</option>
                <option value="menor">Precio: menor a mayor</option>
                <option value="mayor">Precio: mayor a menor</option>
              </select>
            </label>
          </div>
        </div>
      </div>
      <section className="wrap" style={{ paddingBottom: 'var(--section)' }}>
        <p className="cat__count" aria-live="polite">{items.length === 1 ? '1 producto' : `${items.length} productos`}</p>
        {items.length ? (
          <div className="pgrid">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <h2 className="sec__title">No encontramos “{query}”.</h2>
            <p className="muted">Prueba con otra marca o pregúntale a un asesor: muchos productos llegan por pedido.</p>
            <div className="hero__cta" style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn--line" onClick={() => { setQuery(''); setCond('Todos') }}>Limpiar filtros</button>
              <Link className="btn" to="/contacto">Hablar con un asesor</Link>
            </div>
          </div>
        )}
      </section>
    </>
  )
}
