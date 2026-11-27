import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { priceLabel } from '../data/products'
import { useStore } from '../state/store'
import { Icon } from './Icon'
import { ProductShot } from './ProductCard'

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const SUGGEST = ['Vento', 'Planta eléctrica', 'Panel solar', 'Taladro', 'Cerradura', 'UTV']

/** Buscador del encabezado: resultados mientras escribes, Enter abre el catálogo filtrado */
export function Search({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { products } = useStore()
  const [q, setQ] = useState('')
  const dq = useDeferredValue(norm(q.trim()))
  const input = useRef<HTMLInputElement>(null)
  const nav = useNavigate()

  useEffect(() => {
    if (!open) return
    setTimeout(() => input.current?.focus(), 30)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [open, onClose])

  const results = useMemo(() => {
    if (dq.length < 2) return []
    const words = dq.split(/\s+/)
    return products.filter((p) => {
      const hay = norm(`${p.brand} ${p.name} ${p.sub ?? ''} ${p.category} ${p.variants?.map((v) => v.code).join(' ') ?? ''}`)
      return words.every((w) => hay.includes(w))
    }).slice(0, 8)
  }, [products, dq])

  if (!open) return null
  const go = (term: string) => {
    onClose()
    nav(`/catalogo?q=${encodeURIComponent(term)}`)
  }
  return (
    <div className="srch" role="dialog" aria-modal="true" aria-label="Buscar productos">
      <button className="srch__scrim" aria-label="Cerrar búsqueda" onClick={onClose} />
      <div className="srch__panel">
        <form
          className="srch__bar"
          onSubmit={(e) => {
            e.preventDefault()
            if (q.trim()) go(q.trim())
          }}
        >
          <Icon name="search" size={20} />
          <input ref={input} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busca motos, plantas, herramientas o un código" aria-label="Buscar" />
          <button type="button" className="iconbtn" aria-label="Cerrar" onClick={onClose}><Icon name="close" size={18} /></button>
        </form>
        {dq.length < 2 ? (
          <div className="srch__hint">
            <span className="muted">Lo más buscado</span>
            <div className="srch__chips">
              {SUGGEST.map((s) => <button key={s} className="seg__opt seg__opt--sm" onClick={() => setQ(s)}>{s}</button>)}
            </div>
          </div>
        ) : results.length ? (
          <ul className="srch__list">
            {results.map((p) => (
              <li key={p.id}>
                <Link to={`/producto/${p.slug}`} onClick={onClose}>
                  <ProductShot product={p} />
                  <span><strong>{p.name}</strong><small className="muted">{p.brand} · {p.sub ?? p.category}</small></span>
                  <span className="srch__price">{priceLabel(p)}</span>
                </Link>
              </li>
            ))}
            <li><button className="link" onClick={() => go(q.trim())}>Ver todos los resultados de “{q.trim()}”</button></li>
          </ul>
        ) : (
          <div className="srch__hint">
            <p>No encontramos “{q.trim()}” en el catálogo.</p>
            <Link className="link" to={`/ferreteria/referencias`} onClick={onClose}>Buscar entre las 1.773 referencias de ferretería</Link>
          </div>
        )}
      </div>
    </div>
  )
}
