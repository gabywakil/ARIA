import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { ProductShot } from '../components/ProductCard'
import { money, productById } from '../data/products'
import { useCart } from '../state/cart'
import { Flow } from '../components/Flow'
import './pages.css'

export default function Cart() {
  const { lines, count, subtotal, tax, total, setQty, remove, invoices } = useCart()
  const nav = useNavigate()

  return (
    <div className="wrap">
      <div style={{ paddingTop: 40 }}>
        <Flow step={1} />
        <h1 className="phead__title">Tu carrito</h1>
      </div>
      {count === 0 ? (
        <div className="empty" style={{ justifyItems: 'start', textAlign: 'left' }}>
          <p className="sec__lead">Todavía no agregas productos. Explora el catálogo y vuelve cuando quieras: el carrito se guarda en este dispositivo.</p>
          <Link className="btn" to="/catalogo">Ir al catálogo</Link>
        </div>
      ) : (
        <div className="cart">
          <ul className="cart__lines">
            {lines.map((l) => {
              const p = productById.get(l.id)
              if (!p) return null
              return (
                <li key={l.id} className="cline">
                  <Link to={`/producto/${p.slug}`}><ProductShot product={p} /></Link>
                  <div>
                    <Link to={`/producto/${p.slug}`} className="cline__name">{p.name}</Link>
                    <p className="cline__unit num">{money(p.price)} c/u</p>
                    <div className="cline__ctrl">
                      <div className="stepper" role="group" aria-label={`Cantidad de ${p.name}`}>
                        <button aria-label="Quitar uno" onClick={() => setQty(p.id, l.qty - 1)}><Icon name="minus" size={18} /></button>
                        <output>{l.qty}</output>
                        <button aria-label="Agregar uno" onClick={() => setQty(p.id, l.qty + 1)}><Icon name="plus" size={18} /></button>
                      </div>
                      <button className="cline__rm" onClick={() => remove(p.id)}>Quitar</button>
                    </div>
                  </div>
                  <p className="cline__total">{money(p.price * l.qty)}</p>
                </li>
              )
            })}
          </ul>
          <aside className="summary box" aria-label="Resumen">
            <h2 className="pdp__h">Resumen</h2>
            <div className="totals">
              <div><span>Subtotal ({count} {count === 1 ? 'producto' : 'productos'})</span><span>{money(subtotal)}</span></div>
              <div><span>IVA 16 %</span><span>{money(tax)}</span></div>
              <div className="totals__grand"><span>Total</span><span>{money(total)}</span></div>
            </div>
            <button className="btn btn--block" onClick={() => nav('/pago?tipo=factura')}>Generar factura</button>
            <button className="btn btn--line btn--block" onClick={() => nav('/pago?tipo=cotizacion')}>Solicitar cotización</button>
            <p className="field__hint">La cotización no te compromete a pagar. Las dos llegan a tu correo y se descargan en PDF.</p>
          </aside>
        </div>
      )}

      {invoices.length ? (
        <section style={{ paddingBottom: 'var(--section)' }}>
          <h2 className="sec__title" style={{ fontSize: 'var(--fs-2xl)', marginBottom: 16 }}>Tu historial</h2>
          <div className="scrollx">
            <table className="hist">
              <thead><tr><th>Documento</th><th>Fecha</th><th>Tipo</th><th>Productos</th><th>Total</th></tr></thead>
              <tbody>
                {invoices.map((i) => (
                  <tr key={i.number}>
                    <td><Link to={`/recibo/${i.number}`}>{i.number}</Link></td>
                    <td>{i.date}</td>
                    <td>{i.kind}</td>
                    <td>{i.lines.reduce((s, x) => s + x.qty, 0)}</td>
                    <td>{money(i.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  )
}
