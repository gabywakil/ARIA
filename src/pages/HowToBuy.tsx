import { Link } from 'react-router-dom'
import { Icon, type IconName } from '../components/Icon'
import { PageHead } from '../components/PageHead'
import { DELIVERY, PAY_METHODS } from '../data/site'
import './pages.css'

const STEPS: { icon: IconName; t: string; d: string; more: string }[] = [
  { icon: 'search', t: 'Elige tus productos', d: 'Busca por categoría, marca o código y compara fichas técnicas.', more: 'Si un producto viene en varias medidas, eliges la tuya en la ficha y ves su precio.' },
  { icon: 'cart', t: 'Agrégalos al carrito', d: 'Compra lo que tiene precio o pide cotización de lo que dice “a consultar”.', more: 'Puedes mezclar productos: si hay alguno sin precio, te enviamos una cotización completa.' },
  { icon: 'doc', t: 'Escribe tus datos una vez', d: 'Nombre, cédula o RIF, teléfono y correo. Sin crear cuenta.', more: 'Si quieres, tu navegador los recuerda para la próxima compra.' },
  { icon: 'truck', t: 'Elige cómo lo recibes', d: 'Retiro en tienda, entrega local o envío nacional.', more: 'Motos, vehículos y plantas: un asesor coordina contigo el traslado y los papeles.' },
  { icon: 'card', t: 'Paga con instrucciones verificadas', d: 'Zelle, pago móvil, transferencia o efectivo en tienda.', more: 'No cobramos en la web. Reservamos tus productos 48 horas mientras confirmamos el pago.' },
  { icon: 'check', t: 'Sigue tu pedido', d: 'Con tu número de pedido ves cada paso hasta la entrega.', more: 'Recibido, pago confirmado, preparando, listo y entregado. También te avisamos por WhatsApp.' },
]

export default function HowToBuy() {
  return (
    <>
      <PageHead crumb="Cómo comprar" title="Comprar en ARIA es así de simple." lead="Seis pasos, sin cuentas ni formularios eternos. Y un asesor real si necesitas ayuda en cualquier momento.">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
          <Link className="btn" to="/catalogo">Empezar a comprar</Link>
          <Link className="btn btn--line" to="/seguimiento">Seguir mi pedido</Link>
        </div>
      </PageHead>
      <section className="sec wrap">
        <ol className="steps6">
          {STEPS.map((s, i) => (
            <li key={s.t} data-rv>
              <span className="steps6__n">{String(i + 1).padStart(2, '0')}</span>
              <Icon name={s.icon} size={26} />
              <h2>{s.t}</h2>
              <p>{s.d}</p>
              <p className="muted">{s.more}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="sec wrap two">
        <div>
          <h2 className="sec__title">Formas de pago.</h2>
          <ul className="list-plain">
            {PAY_METHODS.map((m) => <li key={m.id}><strong>{m.id}</strong><span>{m.detail}</span></li>)}
          </ul>
        </div>
        <div>
          <h2 className="sec__title">Entregas.</h2>
          <ul className="list-plain">
            {DELIVERY.map((d) => <li key={d.id}><strong>{d.id} · {d.short}</strong><span>{d.detail}</span></li>)}
          </ul>
          <Link className="link" to="/legal/envios" style={{ marginTop: 18 }}>Envíos, garantía y devoluciones</Link>
        </div>
      </section>
      <section className="sec wrap">
        <div className="cta-band">
          <div>
            <h2 className="sec__title">¿Compras para una empresa o una flota?</h2>
            <p className="sec__lead">Precios por volumen, una sola factura y un asesor dedicado.</p>
          </div>
          <Link className="btn" to="/empresas">Ver opciones para empresas</Link>
        </div>
      </section>
    </>
  )
}
