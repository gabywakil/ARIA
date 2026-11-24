import { Link, useParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Logo } from '../components/Logo'
import { money } from '../data/products'
import { SITE } from '../data/site'
import { useCart } from '../state/cart'
import { Flow } from '../components/Flow'
import NotFound from './NotFound'
import './pages.css'

const PAY_INFO: Record<string, string> = {
  Zelle: 'Envía el total a pagos@aria.com (dato de ejemplo) y responde el correo con el comprobante.',
  'Pago móvil': 'Banco de Venezuela, 0414 000 0000, RIF J-00000000-0 (datos de ejemplo). Monto en bolívares a la tasa BCV del día.',
  Transferencia: 'Te enviamos los datos bancarios al correo. Indica el número del documento en la referencia.',
  'Efectivo en tienda': `Paga al retirar en ${SITE.city}. Agenda tu cita por WhatsApp.`,
}

export default function Receipt() {
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
        <Flow step={3} />
        <h1 className="phead__title">{inv.kind === 'Factura' ? 'Pedido confirmado' : 'Cotización lista'}</h1>
      </div>
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
        </div>
        <table>
          <thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Total</th></tr></thead>
          <tbody>
            {inv.lines.map((l) => (
              <tr key={l.name}><td>{l.name}</td><td>{l.qty}</td><td>{money(l.price)}</td><td>{money(l.price * l.qty)}</td></tr>
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
              <p>{PAY_INFO[inv.method]}</p>
              <p className="muted">Tu pedido se reserva por 48 horas mientras confirmamos el pago.</p>
            </>
          ) : (
            <p className="muted">Precios válidos por 7 días. Para confirmar, responde el correo o escríbenos por WhatsApp.</p>
          )}
        </footer>
      </article>

      <div className="receipt__actions noprint">
        <button className="btn" onClick={() => window.print()}><Icon name="download" size={18} /> Descargar PDF</button>
        <a className="btn btn--line" href={mail}><Icon name="mail" size={18} /> Reenviar al correo</a>
        <Link className="btn btn--line" to="/catalogo">Seguir comprando</Link>
      </div>
    </div>
  )
}
