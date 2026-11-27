import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { money, type Category } from '../data/products'
import { DELIVERY, PAY_METHODS, STATES_VE } from '../data/site'
import { lineName, unitPrice, useCart, type Invoice } from '../state/cart'
import { useStore } from '../state/store'
import { Flow } from '../components/Flow'
import { Icon } from '../components/Icon'
import './pages.css'

type Form = {
  name: string
  doc: string
  email: string
  phone: string
  mode: string
  state: string
  city: string
  address: string
  notes: string
}
const EMPTY: Form = { name: '', doc: '', email: '', phone: '', mode: DELIVERY[0].id, state: 'Anzoátegui', city: '', address: '', notes: '' }
const SAVED = 'aria:buyer:v1'

/** Productos grandes: la entrega siempre la coordina un asesor */
const BIG: Category[] = ['Motos', 'Cuatrimotos y UTV', 'Vehículos', 'Plantas eléctricas']

function loadSaved(): Form {
  try {
    const raw = localStorage.getItem(SAVED)
    if (raw) return { ...EMPTY, ...(JSON.parse(raw) as Partial<Form>) }
  } catch {
    /* sin almacenamiento */
  }
  return EMPTY
}

function errorsFor(step: number, f: Form) {
  const e: Partial<Record<keyof Form, string>> = {}
  if (step === 2) {
    if (f.name.trim().length < 3) e.name = 'Escribe tu nombre completo o el de tu empresa.'
    if (!/^[VEJGP]-?\d{6,9}(-?\d)?$/i.test(f.doc.trim())) e.doc = 'Usa el formato V-12345678 o J-12345678-9.'
    if (f.phone.replace(/\D/g, '').length < 10) e.phone = 'Escribe un teléfono con código de área.'
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Revisa el correo: ahí te llega el recibo.'
  }
  if (step === 3 && f.mode !== DELIVERY[0].id) {
    if (f.city.trim().length < 2) e.city = 'Escribe la ciudad.'
    if (f.address.trim().length < 8) e.address = 'Escribe la dirección con un punto de referencia.'
  }
  return e
}

export default function Checkout() {
  const [params] = useSearchParams()
  const [kind, setKind] = useState<Invoice['kind']>(params.get('tipo') === 'cotizacion' ? 'Cotización' : 'Factura')
  const [form, setForm] = useState<Form>(loadSaved)
  const [remember, setRemember] = useState(() => form.name !== '')
  const [method, setMethod] = useState<string>(PAY_METHODS[0].id)
  const [step, setStep] = useState(2)
  const [tried, setTried] = useState(false)
  const [accept, setAccept] = useState(false)
  const { lines, count, subtotal, tax, total, pending, saveInvoice } = useCart()
  const { byId } = useStore()
  const nav = useNavigate()
  const top = useRef<HTMLDivElement>(null)
  // Con productos sin precio solo se puede cotizar
  const effKind: Invoice['kind'] = pending ? 'Cotización' : kind
  const hasBig = lines.some((l) => BIG.includes(byId.get(l.id)?.category as Category))
  const errors = errorsFor(step, form)
  const show = (k: keyof Form) => (tried ? errors[k] : undefined)

  useEffect(() => {
    top.current?.scrollIntoView({ block: 'start' })
  }, [step])

  if (count === 0) {
    return (
      <div className="wrap empty" style={{ minHeight: '50vh', alignContent: 'center' }}>
        <h1 className="phead__title">Tu carrito está vacío.</h1>
        <Link className="btn" to="/catalogo">Ir al catálogo</Link>
      </div>
    )
  }

  const go = (to: number) => {
    setTried(false)
    setStep(to)
  }
  const next = () => {
    setTried(true)
    if (Object.keys(errors).length) return
    // La cotización no pide método de pago: salta directo a revisar
    go(step === 3 && effKind === 'Cotización' ? 5 : step + 1)
  }

  const confirm = () => {
    setTried(true)
    if (!accept) return
    try {
      if (remember) localStorage.setItem(SAVED, JSON.stringify({ ...form, notes: '' }))
      else localStorage.removeItem(SAVED)
    } catch {
      /* sin almacenamiento */
    }
    const now = new Date()
    const invoice: Invoice = {
      number: `${effKind === 'Factura' ? 'PED' : 'COT'}-${now.getTime().toString().slice(-6)}`,
      date: now.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' }),
      createdAt: now.toISOString(),
      kind: effKind,
      customer: { name: form.name.trim(), doc: form.doc.trim().toUpperCase(), email: form.email.trim(), phone: form.phone.trim() },
      delivery:
        form.mode === DELIVERY[0].id
          ? { mode: form.mode, notes: form.notes.trim() }
          : { mode: form.mode, state: form.state, city: form.city.trim(), address: form.address.trim(), notes: form.notes.trim() },
      method: effKind === 'Factura' ? method : '',
      lines: lines.flatMap((l) => {
        const p = byId.get(l.id)
        return p ? [{ name: `${p.brand} ${lineName(p, l.code)}`, qty: l.qty, price: unitPrice(p, l.code) }] : []
      }),
      subtotal,
      tax,
      total,
      pending,
    }
    saveInvoice(invoice)
    nav(`/recibo/${invoice.number}`)
  }

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const field = (k: keyof Form, label: string, props: React.InputHTMLAttributes<HTMLInputElement>, hint?: string) => (
    <label className="field">
      <span className="field__label">{label}</span>
      <input className="input" value={form[k]} onChange={set(k)} aria-invalid={show(k) ? true : undefined} aria-describedby={show(k) ? `err-${k}` : undefined} {...props} />
      {show(k) ? <span className="field__error" id={`err-${k}`}>{show(k)}</span> : hint ? <span className="field__hint">{hint}</span> : null}
    </label>
  )
  const delivery = DELIVERY.find((d) => d.id === form.mode) ?? DELIVERY[0]
  // Paso visible en la barra: 2 datos, 3 entrega, 4 pago, 5 revisar
  const title = { 2: 'Tus datos', 3: '¿Cómo lo recibes?', 4: '¿Cómo pagas?', 5: 'Revisa y confirma' }[step]

  return (
    <div className="wrap" ref={top} style={{ scrollMarginTop: 90 }}>
      <div style={{ paddingTop: 40 }}>
        <Flow step={Math.min(step, 5)} onPick={(n) => n >= 2 && go(n)} />
        <h1 className="phead__title">{title}</h1>
      </div>
      <div className="cart">
        <form
          className="co"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            if (step === 5) confirm()
            else next()
          }}
        >
          {step === 2 ? (
            <>
              <fieldset className="co__set">
                <legend className="pdp__h">¿Qué quieres hacer?</legend>
                <div className="seg">
                  {(['Factura', 'Cotización'] as const).map((k) => (
                    <button type="button" key={k} className="seg__opt" aria-pressed={effKind === k} disabled={k === 'Factura' && pending > 0} onClick={() => setKind(k)}>
                      {k === 'Factura' ? 'Comprar' : 'Pedir cotización'}
                    </button>
                  ))}
                </div>
                <p className="field__hint">
                  {pending
                    ? 'Tu carrito tiene productos con precio a consultar, así que te enviamos una cotización. No pagas nada ahora.'
                    : effKind === 'Factura'
                      ? 'Confirmas el pedido y recibes las instrucciones de pago.'
                      : 'Recibes los precios por escrito, válidos por 7 días, sin compromiso.'}
                </p>
              </fieldset>
              <div className="form">
                {field('name', 'Nombre o razón social', { autoComplete: 'name' })}
                <div className="form__row">
                  {field('doc', 'Cédula o RIF', { placeholder: 'V-12345678' })}
                  {field('phone', 'Teléfono (WhatsApp)', { type: 'tel', autoComplete: 'tel', placeholder: '0414 000 0000' })}
                </div>
                {field('email', 'Correo', { type: 'email', autoComplete: 'email' }, 'Aquí te llega el recibo.')}
                <label className="check">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  <span>Recordar mis datos en este equipo para la próxima compra</span>
                </label>
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              {hasBig ? (
                <p className="notice"><Icon name="truck" /><span>Tu pedido incluye motos, vehículos o plantas. Un asesor coordina contigo la entrega, el traslado y los papeles.</span></p>
              ) : null}
              <fieldset className="pay co__set">
                <legend className="pdp__h">Entrega</legend>
                {DELIVERY.map((d) => (
                  <label key={d.id} className="pay__opt">
                    <input type="radio" name="mode" value={d.id} checked={form.mode === d.id} onChange={set('mode')} />
                    <span><strong>{d.id} <em className="pay__tag">{d.short}</em></strong><span>{d.detail}</span></span>
                  </label>
                ))}
              </fieldset>
              {form.mode !== DELIVERY[0].id ? (
                <div className="form">
                  <div className="form__row">
                    <label className="field">
                      <span className="field__label">Estado</span>
                      <select className="input" value={form.state} onChange={set('state')}>
                        {(form.mode === 'Entrega local' ? ['Anzoátegui'] : STATES_VE).map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </label>
                    {field('city', 'Ciudad', { autoComplete: 'address-level2' })}
                  </div>
                  {field('address', 'Dirección', { autoComplete: 'street-address', placeholder: 'Calle, edificio o casa y un punto de referencia' })}
                </div>
              ) : null}
              <label className="field">
                <span className="field__label">Notas para la entrega (opcional)</span>
                <textarea className="input" rows={3} value={form.notes} onChange={set('notes')} placeholder={form.mode === DELIVERY[0].id ? 'Día y hora en que prefieres retirar' : 'Horario para recibir, quién recibe, agencia preferida…'} />
              </label>
            </>
          ) : null}

          {step === 4 ? (
            <fieldset className="pay co__set">
              <legend className="pdp__h">Método de pago</legend>
              {PAY_METHODS.filter((m) => m.id !== 'Efectivo en tienda' || form.mode === DELIVERY[0].id).map((m) => (
                <label key={m.id} className="pay__opt">
                  <input type="radio" name="method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} />
                  <span><strong>{m.id}</strong><span>{m.detail}</span></span>
                </label>
              ))}
              <p className="field__hint">No cobramos nada en esta página. Recibes las instrucciones con tu número de pedido y reservamos los productos por 48 horas.</p>
            </fieldset>
          ) : null}

          {step === 5 ? (
            <div className="review">
              <section>
                <header><h2 className="pdp__h">Datos</h2><button type="button" className="link" onClick={() => go(2)}>Cambiar</button></header>
                <p>{form.name}<br />{form.doc.toUpperCase()} · {form.phone}<br />{form.email}</p>
              </section>
              <section>
                <header><h2 className="pdp__h">Entrega</h2><button type="button" className="link" onClick={() => go(3)}>Cambiar</button></header>
                <p>
                  {delivery.id} · {delivery.short}
                  {form.mode !== DELIVERY[0].id ? <><br />{form.address}, {form.city}, {form.state}</> : null}
                  {form.notes ? <><br /><span className="muted">{form.notes}</span></> : null}
                </p>
              </section>
              {effKind === 'Factura' ? (
                <section>
                  <header><h2 className="pdp__h">Pago</h2><button type="button" className="link" onClick={() => go(4)}>Cambiar</button></header>
                  <p>{method}</p>
                </section>
              ) : null}
              <label className="check">
                <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} aria-invalid={tried && !accept ? true : undefined} />
                <span>Acepto los <Link to="/legal/terminos" target="_blank">términos de compra</Link> y la <Link to="/legal/privacidad" target="_blank">política de privacidad</Link>.</span>
              </label>
              {tried && !accept ? <p className="field__error" role="alert">Para continuar, acepta los términos.</p> : null}
            </div>
          ) : null}

          {tried && Object.keys(errors).length ? <p className="field__error" role="alert">Revisa los campos marcados.</p> : null}
          <div className="co__nav">
            {step > 2 ? (
              <button type="button" className="btn btn--line" onClick={() => go(step === 5 && effKind === 'Cotización' ? 3 : step - 1)}>Atrás</button>
            ) : (
              <Link to="/carrito" className="btn btn--line">Volver al carrito</Link>
            )}
            <button className="btn" type="submit">
              {step === 5 ? (effKind === 'Factura' ? 'Confirmar pedido' : 'Enviar cotización') : 'Continuar'}
            </button>
          </div>
        </form>

        <aside className="summary box" aria-label="Resumen del pedido">
          <h2 className="pdp__h">Tu pedido</h2>
          <ul className="sum__list">
            {lines.map((l) => {
              const p = byId.get(l.id)
              if (!p) return null
              const u = unitPrice(p, l.code)
              return (
                <li key={l.key}>
                  <span>{l.qty} × {lineName(p, l.code)}</span><span className="num">{u !== null ? money(u * l.qty) : 'A cotizar'}</span>
                </li>
              )
            })}
          </ul>
          <hr className="rule" />
          <div className="totals">
            <div><span>Subtotal</span><span>{money(subtotal)}</span></div>
            <div><span>IVA 16 %</span><span>{money(tax)}</span></div>
            <div><span>Entrega</span><span>{step >= 3 ? delivery.short : 'Siguiente paso'}</span></div>
            <div className="totals__grand"><span>Total</span><span>{money(total)}</span></div>
          </div>
          <ul className="trust">
            <li><Icon name="shield" size={18} />Garantía de fábrica en todo el catálogo</li>
            <li><Icon name="card" size={18} />No cobramos en la web: pagas con instrucciones verificadas</li>
            <li><Icon name="chat" size={18} />Un asesor te escribe para confirmar</li>
          </ul>
        </aside>
      </div>
    </div>
  )
}
