import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { money, productById } from '../data/products'
import { useCart, type Invoice } from '../state/cart'
import { Flow } from '../components/Flow'
import './pages.css'

const METHODS = [
  { id: 'Zelle', detail: 'Pago en dólares. Te enviamos el correo de destino con el recibo.' },
  { id: 'Pago móvil', detail: 'En bolívares a la tasa BCV del día. Datos bancarios en el recibo.' },
  { id: 'Transferencia', detail: 'Transferencia nacional o internacional en dólares.' },
  { id: 'Efectivo en tienda', detail: 'Pagas al retirar en Lechería, con cita previa.' },
] as const

type Form = { name: string; doc: string; email: string; phone: string }
const EMPTY: Form = { name: '', doc: '', email: '', phone: '' }

function validate(f: Form) {
  const e: Partial<Record<keyof Form, string>> = {}
  if (f.name.trim().length < 3) e.name = 'Escribe tu nombre completo o el de tu empresa.'
  if (!/^[VEJGP]-?\d{6,9}(-?\d)?$/i.test(f.doc.trim())) e.doc = 'Usa el formato V-12345678 o J-12345678-9.'
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Revisa el correo: ahí te llega el recibo.'
  if (f.phone.replace(/\D/g, '').length < 10) e.phone = 'Escribe un teléfono con código de área.'
  return e
}

export default function Checkout() {
  const [params] = useSearchParams()
  const [kind, setKind] = useState<Invoice['kind']>(params.get('tipo') === 'cotizacion' ? 'Cotización' : 'Factura')
  const [form, setForm] = useState<Form>(EMPTY)
  const [method, setMethod] = useState<string>(METHODS[0].id)
  const [tried, setTried] = useState(false)
  const { lines, count, subtotal, tax, total, saveInvoice } = useCart()
  const nav = useNavigate()
  const errors = validate(form)
  const show = (k: keyof Form) => (tried ? errors[k] : undefined)

  if (count === 0) {
    return (
      <div className="wrap empty" style={{ minHeight: '50vh', alignContent: 'center' }}>
        <h1 className="phead__title">No hay nada que facturar.</h1>
        <Link className="btn" to="/catalogo">Ir al catálogo</Link>
      </div>
    )
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTried(true)
    if (Object.keys(errors).length) return
    const invoice: Invoice = {
      number: `${kind === 'Factura' ? 'FAC' : 'COT'}-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' }),
      kind,
      customer: { ...form },
      method,
      lines: lines.flatMap((l) => {
        const p = productById.get(l.id)
        return p ? [{ name: p.name, qty: l.qty, price: p.price }] : []
      }),
      subtotal,
      tax,
      total,
    }
    saveInvoice(invoice)
    nav(`/recibo/${invoice.number}`)
  }

  const field = (k: keyof Form, label: string, props: React.InputHTMLAttributes<HTMLInputElement>, hint?: string) => (
    <label className="field">
      <span className="field__label">{label}</span>
      <input
        className="input"
        value={form[k]}
        onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
        aria-invalid={show(k) ? true : undefined}
        aria-describedby={show(k) ? `err-${k}` : undefined}
        {...props}
      />
      {show(k) ? <span className="field__error" id={`err-${k}`}>{show(k)}</span> : hint ? <span className="field__hint">{hint}</span> : null}
    </label>
  )

  return (
    <div className="wrap">
      <div style={{ paddingTop: 40 }}>
        <Flow step={2} />
        <h1 className="phead__title">Datos y pago</h1>
      </div>
      <form className="cart" onSubmit={submit} noValidate>
        <div style={{ display: 'grid', gap: 36 }}>
          <fieldset style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: 12 }}>
            <legend className="pdp__h">¿Qué quieres generar?</legend>
            <div className="seg">
              {(['Factura', 'Cotización'] as const).map((k) => (
                <button type="button" key={k} className="seg__opt" aria-pressed={kind === k} onClick={() => setKind(k)}>{k}</button>
              ))}
            </div>
            <p className="field__hint">{kind === 'Factura' ? 'Confirmas el pedido y recibes las instrucciones de pago.' : 'Recibes los precios por escrito, válidos por 7 días, sin compromiso.'}</p>
          </fieldset>
          <div className="form">
            <h2 className="pdp__h">Tus datos</h2>
            {field('name', 'Nombre o razón social', { autoComplete: 'name' })}
            <div className="form__row">
              {field('doc', 'Cédula o RIF', { placeholder: 'V-12345678' })}
              {field('phone', 'Teléfono', { type: 'tel', autoComplete: 'tel', placeholder: '0414 000 0000' })}
            </div>
            {field('email', 'Correo', { type: 'email', autoComplete: 'email' }, 'Aquí te llega el recibo en PDF.')}
          </div>
          {kind === 'Factura' ? (
            <fieldset className="pay" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="pdp__h" style={{ marginBottom: 12 }}>Método de pago</legend>
              {METHODS.map((m) => (
                <label key={m.id} className="pay__opt">
                  <input type="radio" name="method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} />
                  <span><strong>{m.id}</strong><span>{m.detail}</span></span>
                </label>
              ))}
            </fieldset>
          ) : null}
        </div>
        <aside className="summary box" aria-label="Resumen del pedido">
          <h2 className="pdp__h">Tu pedido</h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10, fontSize: 'var(--fs-sm)' }}>
            {lines.map((l) => {
              const p = productById.get(l.id)
              return p ? (
                <li key={l.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span>{l.qty} × {p.name}</span><span className="num">{money(p.price * l.qty)}</span>
                </li>
              ) : null
            })}
          </ul>
          <hr className="rule" />
          <div className="totals">
            <div><span>Subtotal</span><span>{money(subtotal)}</span></div>
            <div><span>IVA 16 %</span><span>{money(tax)}</span></div>
            <div className="totals__grand"><span>Total</span><span>{money(total)}</span></div>
          </div>
          {tried && Object.keys(errors).length ? <p className="field__error" role="alert">Revisa los campos marcados antes de continuar.</p> : null}
          <button className="btn btn--block" type="submit">{kind === 'Factura' ? 'Confirmar y generar factura' : 'Generar cotización'}</button>
          <Link to="/carrito" className="btn btn--line btn--block">Volver al carrito</Link>
        </aside>
      </form>
    </div>
  )
}
