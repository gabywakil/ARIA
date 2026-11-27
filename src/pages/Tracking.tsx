import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageHead } from '../components/PageHead'
import { Timeline } from '../components/Timeline'
import { money } from '../data/products'
import { useCart } from '../state/cart'
import { useStore } from '../state/store'
import './pages.css'

/** Seguimiento sin cuenta: número de pedido + últimos 4 dígitos del teléfono */
export default function Tracking() {
  const [params] = useSearchParams()
  const { invoices } = useCart()
  const { site } = useStore()
  const [num, setNum] = useState(params.get('n') ?? '')
  const [tail, setTail] = useState('')
  const [asked, setAsked] = useState(false)
  const clean = num.trim().toUpperCase()
  const found = invoices.find((i) => i.number === clean && i.customer.phone.replace(/\D/g, '').endsWith(tail))
  const ok = asked && tail.length === 4 && found

  return (
    <>
      <PageHead crumb="Seguimiento" title="¿Dónde está mi pedido?" lead="Escribe el número que aparece en tu recibo y los últimos 4 dígitos de tu teléfono. No necesitas cuenta." />
      <div className="wrap track">
        <form
          className="track__form box"
          onSubmit={(e) => {
            e.preventDefault()
            setAsked(true)
          }}
        >
          <label className="field">
            <span className="field__label">Número de pedido o cotización</span>
            <input className="input" value={num} onChange={(e) => setNum(e.target.value)} placeholder="PED-123456" autoCapitalize="characters" required />
          </label>
          <label className="field">
            <span className="field__label">Últimos 4 dígitos de tu teléfono</span>
            <input className="input" value={tail} onChange={(e) => setTail(e.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" placeholder="0000" required />
          </label>
          <button className="btn btn--block" type="submit">Ver estado</button>
          {asked && !ok ? (
            <p className="field__error" role="alert">
              No encontramos ese pedido. Revisa el número o escríbenos por{' '}
              <a href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Hola, quiero saber el estado de mi pedido ${clean}`)}`} target="_blank" rel="noreferrer">WhatsApp</a>.
            </p>
          ) : null}
        </form>
        <div>
          {ok ? (
            <div className="order-card">
              <div className="order-card__head">
                <h2 className="pdp__h">{found.kind === 'Factura' ? 'Pedido' : 'Cotización'} {found.number}</h2>
                <span className="muted">{found.date}</span>
              </div>
              <p className="muted">{found.lines.length} {found.lines.length === 1 ? 'producto' : 'productos'} · {money(found.total)}{found.pending ? ' + productos por cotizar' : ''} · {found.delivery?.mode ?? 'Entrega por coordinar'}</p>
              {found.kind === 'Factura' ? (
                <Timeline inv={found} />
              ) : (
                <p>Un asesor te envía los precios por correo y WhatsApp en menos de 24 horas. Cuando la apruebes, la convertimos en pedido.</p>
              )}
              <Link className="link" to={`/recibo/${found.number}`}>Ver recibo completo</Link>
            </div>
          ) : (
            <div className="order-card muted">
              <p>El estado se actualiza cada vez que avanzamos con tu pedido: recibido, pago confirmado, preparando, listo para retirar o en camino, y entregado.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
