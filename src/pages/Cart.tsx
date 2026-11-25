import { Link, useNavigate } from 'react-router-dom'
import { Flow } from '../components/Flow'
import { Icon } from '../components/Icon'
import { ProductShot } from '../components/ProductCard'
import { money } from '../data/products'
import { lineName, unitPrice, useCart } from '../state/cart'
import { useStore } from '../state/store'
import './pages.css'

export default function Cart() {
  const { lines, count, subtotal, tax, total, pending, setQty, remove, invoices } = useCart()
  const { byId } = useStore()
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
              const p = byId.get(l.id)!
              const u = unitPrice(p, l.code)
              return (
                <li key={l.key} className="cline">
                  <Link to={`/producto/${p.slug}`}><ProductShot product={p} /></Link>
                  <div>
                    <Link to={`/producto/${p.slug}`} className="cline__name">{lineName(p, l.code)}</Link>
                    <p className="cline__unit num">{p.brand}, {u !== null ? `${money(u)} c/u` : 'precio a consultar'}</p>
                    <div className="cline__ctrl">
                      <div className="stepper" role="group" aria-label={`Cantidad de ${p.name}`}>
                        <button aria-label="Quitar uno" onClick={() => setQty(l.key, l.qty - 1)}><Icon name="minus" size={18} /></button>
                        <output>{l.qty}</output>
                        <button aria-label="Agregar uno" onClick={() => setQty(l.key, l.qty + 1)}><Icon name="plus" size={18} /></button>
                      </div>
                      <button className="cline__rm" onClick={() => remove(l.key)}>Quitar</button>
                    </div>
                  </div>
                  <p className="cline__total">{u !== null ? money(u * l.qty) : <span className="pcard__price--ask">A cotizar</span>}</p>
                </li>
              )
            })}
          </ul>
          <aside className="summary box" aria-label="Resumen">
            <h2 className="pdp__h">Resumen</h2>
            <div className="totals">
              <div><span>Subtotal ({count} {count === 1 ? 'producto' : 'productos'})</span><span>{money(subtotal)}</span></div>
              <div><span>IVA 16 %</span><span>{money(tax)}</span></div>
              {pending ? <div><span>Productos por cotizar</span><span>{pending}</span></div> : null}
              <div className="totals__grand"><span>Total{pending ? ' parcial' : ''}</span><span>{money(total)}</span></div>
            </div>
            {pending ? (
              <>
                <p className="notice" style={{ fontSize: 'var(--fs-sm)' }}>
                  <Icon name="doc" /> <span>Tienes {pending === 1 ? 'un producto' : `${pending} productos`} con precio a consultar. Pide la cotización y te enviamos el precio final en menos de 24 horas.</span>
                </p>
                <button className="btn btn--block" onClick={() => nav('/pago?tipo=cotizacion')}>Solicitar cotización</button>
              </>
            ) : (
              <>
                <button className="btn btn--block" onClick={() => nav('/pago?tipo=factura')}>Generar factura</button>
                <button className="btn btn--line btn--block" onClick={() => nav('/pago?tipo=cotizacion')}>Solicitar cotización</button>
              </>
            )}
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
                    <td>{money(i.total)}{i.pending ? ' + por cotizar' : ''}</td>
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
