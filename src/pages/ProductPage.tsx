import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { ProductCard, ProductShot } from '../components/ProductCard'
import { IVA, PRODUCTS, money, productBySlug, slugByCategory } from '../data/products'
import { SITE } from '../data/site'
import { useCart } from '../state/cart'
import NotFound from './NotFound'
import './pages.css'

function Finance({ price }: { price: number }) {
  const [down, setDown] = useState(30)
  const [months, setMonths] = useState(12)
  const fee = (price * (1 - down / 100)) / months
  return (
    <div className="box finance">
      <h2 className="pdp__h">Simula tu financiación</h2>
      <label className="field">
        <span className="finance__row"><span>Inicial</span><strong className="num">{down} % ({money(price * down / 100)})</strong></span>
        <input type="range" min={20} max={70} step={5} value={down} onChange={(e) => setDown(+e.target.value)} />
      </label>
      <label className="field">
        <span className="finance__row"><span>Plazo</span><strong className="num">{months} meses</strong></span>
        <input type="range" min={6} max={36} step={6} value={months} onChange={(e) => setMonths(+e.target.value)} />
      </label>
      <hr className="rule" />
      <div className="finance__row" style={{ alignItems: 'baseline' }}>
        <span>Cuota mensual estimada</span>
        <span className="finance__fee num">{money(fee)}</span>
      </div>
      <p className="field__hint">Simulación sin intereses, sujeta a aprobación. Un asesor te confirma las condiciones.</p>
    </div>
  )
}

export default function ProductPage() {
  const { slug = '' } = useParams()
  const p = productBySlug.get(slug)
  const [qty, setQty] = useState(1)
  const { add, clearAdded } = useCart()
  const nav = useNavigate()
  if (!p) return <NotFound />

  const related = PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4)
  const wa = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(`Hola ARIA, me interesa: ${p.name} (${money(p.price)}).`)}`

  return (
    <>
      <div className="wrap">
        <nav className="phead__crumb" aria-label="Ruta" style={{ paddingTop: 28, marginBottom: 0 }}>
          <Link to="/">Inicio</Link><span aria-hidden="true">/</span>
          <Link to={`/catalogo/${slugByCategory.get(p.category)}`}>{p.category}</Link><span aria-hidden="true">/</span>
          <span aria-current="page">{p.name}</span>
        </nav>
        <div className="pdp">
          <div className="pdp__media">
            <ProductShot product={p} eager />
          </div>
          <div className="pdp__info">
            <p className="pcard__meta">{p.brand}<span className="pcard__used">{p.condition}</span></p>
            <h1 className="pdp__title display">{p.name}</h1>
            <p className="sec__lead">{p.description}</p>
            <div>
              <p className="pdp__price num">{money(p.price)}</p>
              <p className="pdp__tax num">{money(p.price * (1 + IVA))} con IVA incluido{p.rentPerDay ? `. Alquiler desde ${money(p.rentPerDay)} por día.` : '.'}</p>
            </div>
            <div className="pdp__buy">
              <div className="stepper" role="group" aria-label="Cantidad">
                <button aria-label="Quitar uno" onClick={() => setQty((q) => Math.max(1, q - 1))}><Icon name="minus" size={18} /></button>
                <output aria-live="polite">{qty}</output>
                <button aria-label="Agregar uno" onClick={() => setQty((q) => q + 1)}><Icon name="plus" size={18} /></button>
              </div>
              <button className="btn" onClick={() => add(p.id, qty)}>Agregar al carrito</button>
              <button className="btn btn--line" onClick={() => { add(p.id, qty); clearAdded(); nav('/carrito') }}>Comprar ahora</button>
            </div>
            <a className="link pdp__wa" href={wa} target="_blank" rel="noreferrer"><Icon name="chat" size={18} /> Preguntar por WhatsApp</a>
            <ul className="feature-list" style={{ fontSize: 'var(--fs-sm)' }}>
              <li><Icon name="shield" size={18} /> Garantía: {p.specs['Garantía'] ?? 'de fábrica'}</li>
              <li><Icon name="doc" size={18} /> Factura en línea, descargable en PDF</li>
              <li><Icon name="truck" size={18} /> Entrega coordinada o retiro en Lechería</li>
            </ul>
            <div>
              <h2 className="pdp__h">Ficha técnica</h2>
              <table className="spec">
                <tbody>
                  <tr><th scope="row">Marca</th><td>{p.brand}</td></tr>
                  <tr><th scope="row">Estado</th><td>{p.condition}</td></tr>
                  {Object.entries(p.specs).map(([k, v]) => (
                    <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            {p.price >= 1000 ? <Finance price={p.price} /> : null}
          </div>
        </div>
      </div>
      {related.length ? (
        <section className="sec wrap">
          <div className="sec__head sec__head--row">
            <h2 className="sec__title">También en {p.category.toLowerCase()}.</h2>
            <Link to={`/catalogo/${slugByCategory.get(p.category)}`} className="btn btn--line btn--sm">Ver todos</Link>
          </div>
          <div className="pgrid">
            {related.map((r) => <ProductCard key={r.id} product={r} />)}
          </div>
        </section>
      ) : null}
    </>
  )
}
