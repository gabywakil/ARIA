import { Link, useParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Logo } from '../components/Logo'
import { money } from '../data/products'
import { useStore } from '../state/store'
import { useCart } from '../state/cart'
import { Flow } from '../components/Flow'
import { Timeline } from '../components/Timeline'
import { payInfo } from '../data/site'
import NotFound from './NotFound'
import './pages.css'

export default function Receipt() {
  const { site: SITE } = useStore()
  const { number } = useParams()
  const { invoices } = useCart()
  const inv = invoices.find((i) => i.number === number)
  if (!inv) return <NotFound />

  const mail = `mailto:${inv.customer.email}?subject=${encodeURIComponent(`${inv.kind} ${inv.number} de ARIA`)}&body=${encodeURIComponent(
    `Hola ${inv.customer.name},\n\nAdjuntamos tu ${inv.kind.toLowerCase()} ${inv.number} por ${money(inv.total)}.\n\nARIA Inventory & Mobility`,
  )}`

  return (
    <div className="wrap receipt">
      <div className="noprint">
        <Flow step={6} />
        <h1 className="phead__title">{inv.kind === 'Factura' ? 'Pedido recibido' : 'Cotización enviada'}</h1>
        <p className="phead__lead">
          Tu número es <strong>{inv.number}</strong>. Guárdalo para{' '}
          <Link className="link" to={`/seguimiento?n=${inv.number}`}>seguir tu pedido</Link> sin crear cuenta.
        </p>
      </div>
      {inv.kind === 'Factura' ? (
        <div className="order-card noprint">
          <h2 className="pdp__h">Estado</h2>
          <Timeline inv={inv} />
        </div>
      ) : null}
      <div className="notice noprint" role="status">
        <Icon name="mail" />
        <span>Enviamos una copia a <strong>{inv.customer.email}</strong>. Si no la ves en unos minutos, revisa la carpeta de spam.</span>
      </div>

      <article className="doc" aria-label={`${inv.kind} ${inv.number}`}>
        <header className="doc__top">
          <Logo />
          <p className="doc__id">{inv.kind}<strong>{inv.number}</strong>{inv.date}</p>
        </header>
        <div className="doc__parties">
          <div>
            <h2>Emitido por</h2>
            <p><strong>ARIA Inventory & Mobility</strong><br />RIF J-00000000-0<br />{SITE.city}<br />{SITE.email}</p>
          </div>
          <div>
            <h2>Cliente</h2>
            <p><strong>{inv.customer.name}</strong><br />{inv.customer.doc}<br />{inv.customer.email}<br />{inv.customer.phone}</p>
          </div>
          {inv.delivery ? (
            <div>
              <h2>Entrega</h2>
              <p><strong>{inv.delivery.mode}</strong>{inv.delivery.address ? <><br />{inv.delivery.address}<br />{inv.delivery.city}, {inv.delivery.state}</> : <><br />{SITE.address}</>}{inv.delivery.notes ? <><br />{inv.delivery.notes}</> : null}</p>
            </div>
          ) : null}
        </div>
        <table>
          <thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Total</th></tr></thead>
          <tbody>
            {inv.lines.map((l) => (
              <tr key={l.name}><td>{l.name}</td><td>{l.qty}</td><td>{l.price !== null ? money(l.price) : 'Por cotizar'}</td><td>{l.price !== null ? money(l.price * l.qty) : 'Por cotizar'}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="totals">
          <div><span>Subtotal</span><span>{money(inv.subtotal)}</span></div>
          <div><span>IVA 16 %</span><span>{money(inv.tax)}</span></div>
          <div className="totals__grand"><span>Total</span><span>{money(inv.total)}</span></div>
        </div>
        <footer className="doc__pay">
          {inv.kind === 'Factura' ? (
            <>
              <strong>Cómo pagar: {inv.method}</strong>
              <p>{payInfo(SITE.city)[inv.method]}</p>
              <p className="muted">Tu pedido se reserva por 48 horas mientras confirmamos el pago.</p>
            </>
          ) : (
            <p className="muted">{inv.pending ? `Te enviaremos el precio de ${inv.pending === 1 ? 'un producto' : `${inv.pending} productos`} marcados “Por cotizar” en menos de 24 horas. ` : ''}Precios válidos por 7 días. Para confirmar, responde el correo o escríbenos por WhatsApp.</p>
          )}
        </footer>
      </article>

      <div className="receipt__actions noprint">
        {inv.kind === 'Factura' ? (
          <a className="btn" href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(`Hola ARIA, envío el comprobante de pago del pedido ${inv.number} por ${money(inv.total)}.`)}`} target="_blank" rel="noreferrer">
            <Icon name="chat" size={18} /> Enviar comprobante por WhatsApp
          </a>
        ) : null}
        <button className="btn btn--line" onClick={() => window.print()}><Icon name="download" size={18} /> Descargar PDF</button>
        <a className="btn btn--line" href={mail}><Icon name="mail" size={18} /> Reenviar al correo</a>
        <Link className="btn btn--line" to="/catalogo">Seguir comprando</Link>
      </div>
    </div>
  )
}
