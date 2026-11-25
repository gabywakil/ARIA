import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { PageHead } from '../components/PageHead'
import { money } from '../data/products'
import { useStore } from '../state/store'
import './pages.css'

// Lista completa de referencias de ferretería extraída de los catálogos Tolsen y Nexon.
// Pesa bastante, así que se descarga solo al abrir esta página.
type Ref = { b: string; s: string; t: string; c: string; z: string; p: number | null }

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const PAGE = 60

export default function References() {
  const [refs, setRefs] = useState<Ref[] | null>(null)
  const [error, setError] = useState(false)
  const [query, setQuery] = useState('')
  const [brand, setBrand] = useState('Todas')
  const [section, setSection] = useState('Todas')
  const [limit, setLimit] = useState(PAGE)
  const q = useDeferredValue(norm(query.trim()))
  const { site } = useStore()

  useEffect(() => {
    let alive = true
    fetch('./catalogo/ferreteria.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: Ref[]) => alive && setRefs(d))
      .catch(() => alive && setError(true))
    return () => {
      alive = false
    }
  }, [])

  const sections = useMemo(() => [...new Set((refs ?? []).filter((r) => brand === 'Todas' || r.b === brand).map((r) => r.s))].sort(), [refs, brand])
  const list = useMemo(
    () => (refs ?? []).filter((r) => (brand === 'Todas' || r.b === brand) && (section === 'Todas' || r.s === section) && (!q || norm(`${r.t} ${r.c} ${r.z} ${r.s}`).includes(q))),
    [refs, brand, section, q],
  )

  return (
    <>
      <PageHead
        crumb="Referencias de ferretería"
        title="Todas las referencias, con su precio."
        lead="Busca por nombre, código o medida en los catálogos Tolsen y Nexon. Precios de referencia en dólares a tasa BCV, sin IVA."
      />
      <div className="cat__bar">
        <div className="wrap cat__tools">
          <label className="cat__search">
            <span className="vh">Buscar</span>
            <Icon name="search" size={18} />
            <input className="input" type="search" placeholder="Ej.: alicate, 10000, malla, taladro" value={query} onChange={(e) => { setQuery(e.target.value); setLimit(PAGE) }} />
          </label>
          <select className="input cat__select" aria-label="Marca" value={brand} onChange={(e) => { setBrand(e.target.value); setSection('Todas'); setLimit(PAGE) }}>
            <option value="Todas">Tolsen y Nexon</option>
            <option>Tolsen</option>
            <option>Nexon</option>
          </select>
          <select className="input cat__select" aria-label="Sección" value={section} onChange={(e) => { setSection(e.target.value); setLimit(PAGE) }}>
            <option value="Todas">Todas las secciones</option>
            {sections.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <section className="wrap" style={{ paddingBottom: 'var(--section)' }}>
        {error ? (
          <p className="notice">No pudimos cargar la lista. Recarga la página o escríbenos por WhatsApp.</p>
        ) : !refs ? (
          <p className="cat__count" aria-busy="true">Cargando referencias…</p>
        ) : (
          <>
            <p className="cat__count" aria-live="polite">{list.length.toLocaleString('es-VE')} referencias</p>
            <div className="scrollx">
              <table className="refs">
                <thead>
                  <tr><th>Código</th><th>Producto</th><th>Medida</th><th>Sección</th><th className="refs__p">Precio</th><th><span className="vh">Pedir</span></th></tr>
                </thead>
                <tbody>
                  {list.slice(0, limit).map((r) => (
                    <tr key={`${r.b}-${r.c}-${r.z}`}>
                      <td className="num refs__c">{r.c}</td>
                      <td><strong>{r.t}</strong><span className="refs__b">{r.b}</span></td>
                      <td>{r.z || 'Estándar'}</td>
                      <td className="muted">{r.s}</td>
                      <td className="num refs__p">{r.p ? money(r.p) : 'Consultar'}</td>
                      <td>
                        <a className="iconbtn" href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Hola ARIA, quiero pedir ${r.b} ${r.c}: ${r.t} ${r.z}`)}`} target="_blank" rel="noreferrer" aria-label={`Pedir ${r.t} por WhatsApp`}>
                          <Icon name="chat" size={18} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {list.length > limit ? (
              <div style={{ display: 'grid', justifyItems: 'center', marginTop: 32 }}>
                <button className="btn btn--line" onClick={() => setLimit((l) => l + PAGE * 2)}>Ver más ({(list.length - limit).toLocaleString('es-VE')} restantes)</button>
              </div>
            ) : null}
            <p className="field__hint" style={{ marginTop: 24 }}>
              ¿Prefieres ver las fotos? <Link className="link" to="/catalogo/ferreteria">Ir a la ferretería con fotos</Link>
            </p>
          </>
        )}
      </section>
    </>
  )
}
