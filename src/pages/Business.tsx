import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { PageHead } from '../components/PageHead'
import { useStore } from '../state/store'
import './pages.css'

const NEEDS = ['Flota de motos o vehículos', 'Plantas eléctricas o energía solar', 'Ferretería para obra', 'Compra al mayor para revender', 'Otro']
type F = { company: string; rif: string; contact: string; email: string; phone: string; need: string; volume: string; message: string }
const EMPTY: F = { company: '', rif: '', contact: '', email: '', phone: '', need: NEEDS[0], volume: '', message: '' }

function check(f: F) {
  const e: Partial<Record<keyof F, string>> = {}
  if (f.company.trim().length < 2) e.company = 'Escribe el nombre de la empresa.'
  if (f.contact.trim().length < 3) e.contact = 'Escribe quién te representa.'
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Revisa el correo.'
  if (f.phone.replace(/\D/g, '').length < 10) e.phone = 'Escribe un teléfono con código de área.'
  return e
}

export default function Business() {
  const { addLead } = useStore()
  const [f, setF] = useState<F>(EMPTY)
  const [tried, setTried] = useState(false)
  const [done, setDone] = useState(false)
  const errors = check(f)
  const set = (k: keyof F) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF((x) => ({ ...x, [k]: e.target.value }))
  const text = (k: keyof F, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="field">
      <span className="field__label">{label}</span>
      <input className="input" value={f[k]} onChange={set(k)} aria-invalid={tried && errors[k] ? true : undefined} {...props} />
      {tried && errors[k] ? <span className="field__error">{errors[k]}</span> : null}
    </label>
  )
  return (
    <>
      <PageHead crumb="Empresas y flotas" title="Para empresas, flotas y obras." lead="Lo de una sola compra se pide en la web. Las flotas, las obras y las compras que se repiten se conversan aparte, con un asesor dedicado." />
      <section className="sec wrap">
        <div className="biz">
          <article className="biz__card">
            <Icon name="truck" size={28} />
            <h2>Flotas y compras por volumen</h2>
            <p className="muted">Motos para reparto, vehículos de trabajo, plantas para tu operación o ferretería para una obra. Te armamos una sola propuesta con precio por volumen.</p>
            <a className="btn" href="#solicitud">Pedir propuesta</a>
          </article>
          <article className="biz__card">
            <Icon name="users" size={28} />
            <h2>Aliados que compran seguido</h2>
            <p className="muted">Talleres, comercios y constructoras con compras frecuentes: condiciones especiales y despacho prioritario.</p>
            <Link className="btn btn--line" to="/aliados">Postularme como aliado</Link>
          </article>
        </div>
      </section>
      <section className="sec wrap two" id="solicitud" style={{ scrollMarginTop: 90 }}>
        <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
          <h2 className="sec__title">Cuéntanos qué necesitas.</h2>
          <p className="sec__lead">Un asesor revisa tu solicitud y te escribe en menos de 24 horas hábiles con una propuesta.</p>
          <ul className="list-plain">
            <li><strong>Una sola factura</strong><span>Todo el pedido en un documento, a nombre de tu empresa.</span></li>
            <li><strong>Entrega coordinada</strong><span>Despachamos donde está tu operación u obra.</span></li>
            <li><strong>Seguimiento</strong><span>Ves el estado de cada pedido con su número.</span></li>
          </ul>
        </div>
        <div className="box">
          {done ? (
            <div className="success">
              <span className="success__mark"><Icon name="check" size={28} /></span>
              <h2 className="sec__title" style={{ fontSize: 'var(--fs-2xl)' }}>Solicitud enviada</h2>
              <p className="muted">Gracias, {f.contact.split(' ')[0]}. Te escribimos a {f.email} o al {f.phone} en menos de 24 horas hábiles.</p>
              <Link className="btn" to="/catalogo">Ver el catálogo</Link>
            </div>
          ) : (
            <form
              className="form"
              noValidate
              onSubmit={(e) => {
                e.preventDefault()
                setTried(true)
                if (Object.keys(errors).length) return
                // Llega al panel admin, sección Clientes > Empresas
                addLead({ ...f, company: f.company.trim(), rif: f.rif.trim().toUpperCase() })
                setDone(true)
              }}
            >
              {text('company', 'Empresa', { autoComplete: 'organization' })}
              <div className="form__row">
                {text('rif', 'RIF (opcional)', { placeholder: 'J-12345678-9' })}
                {text('contact', 'Persona de contacto', { autoComplete: 'name' })}
              </div>
              <div className="form__row">
                {text('email', 'Correo', { type: 'email', autoComplete: 'email' })}
                {text('phone', 'Teléfono', { type: 'tel', autoComplete: 'tel' })}
              </div>
              <div className="form__row">
                <label className="field">
                  <span className="field__label">¿Qué necesitas?</span>
                  <select className="input" value={f.need} onChange={set('need')}>{NEEDS.map((n) => <option key={n}>{n}</option>)}</select>
                </label>
                {text('volume', 'Cantidad aproximada', { placeholder: 'Ej.: 10 motos, 3 plantas' })}
              </div>
              <label className="field">
                <span className="field__label">Detalles (opcional)</span>
                <textarea className="input" value={f.message} onChange={set('message')} placeholder="Modelos, plazos, lugar de entrega…" />
              </label>
              <button className="btn btn--block" type="submit">Enviar solicitud</button>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
