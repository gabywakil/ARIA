import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { PageHead } from '../components/PageHead'
import { CATEGORIES } from '../data/products'
import './pages.css'

const BENEFITS = [
  { t: 'Precio por volumen', d: 'Descuentos escalonados desde la tercera unidad o por monto mensual.' },
  { t: 'Crédito para empresas', d: 'Hasta 30 días para pagar una vez aprobada tu solicitud.' },
  { t: 'Cotización en 24 horas', d: 'Un asesor dedicado responde tus pedidos el mismo día.' },
  { t: 'Despacho prioritario', d: 'Tus pedidos salen primero, a cualquier parte del país.' },
]
const TYPES = ['Taller mecánico', 'Constructora u obra', 'Comercio o tienda', 'Flota o empresa de reparto', 'Otro']

type F = { company: string; rif: string; type: string; contact: string; email: string; phone: string; city: string; message: string; accept: boolean }
const EMPTY: F = { company: '', rif: '', type: '', contact: '', email: '', phone: '', city: '', message: '', accept: false }

function check(f: F, interests: Set<string>) {
  const e: Partial<Record<keyof F | 'interests', string>> = {}
  if (f.company.trim().length < 2) e.company = 'Escribe el nombre de tu empresa o negocio.'
  if (!/^[JGVEP]-?\d{6,9}(-?\d)?$/i.test(f.rif.trim())) e.rif = 'Usa el formato J-12345678-9.'
  if (!f.type) e.type = 'Elige el tipo de negocio.'
  if (f.contact.trim().length < 3) e.contact = 'Escribe el nombre de la persona de contacto.'
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Revisa el correo.'
  if (f.phone.replace(/\D/g, '').length < 10) e.phone = 'Escribe un teléfono con código de área.'
  if (!interests.size) e.interests = 'Elige al menos una línea de producto.'
  if (!f.accept) e.accept = 'Necesitamos tu autorización para revisar la solicitud.'
  return e
}

export default function Allies() {
  const [f, setF] = useState<F>(EMPTY)
  const [interests, setInterests] = useState<Set<string>>(() => new Set())
  const [tried, setTried] = useState(false)
  const [done, setDone] = useState(false)
  const errors = check(f, interests)
  const err = (k: keyof typeof errors) => (tried ? errors[k] : undefined)
  const set = <K extends keyof F>(k: K, v: F[K]) => setF((x) => ({ ...x, [k]: v }))

  const text = (k: keyof F, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="field">
      <span className="field__label">{label}</span>
      <input className="input" value={f[k] as string} onChange={(e) => set(k, e.target.value as never)} aria-invalid={err(k) ? true : undefined} {...props} />
      {err(k) ? <span className="field__error">{err(k)}</span> : null}
    </label>
  )

  return (
    <>
      <PageHead crumb="Aliados" title="Crece con ARIA." lead="Para talleres, constructoras, comercios y flotas que compran con frecuencia. Postúlate y un asesor te contacta en menos de 24 horas." />
      <section className="sec wrap">
        <div className="two">
          <div style={{ display: 'grid', gap: 28, position: 'sticky', top: 'calc(var(--hdr-h) + 24px)' }}>
            <h2 className="sec__title">Lo que obtienes como aliado.</h2>
            <ul className="list-rows" style={{ borderTop: 0 }}>
              {BENEFITS.map((b) => (
                <li key={b.t} style={{ gridTemplateColumns: '32px 1fr', padding: '18px 0' }}>
                  <Icon name="check" size={24} />
                  <div><h3 style={{ fontSize: 'var(--fs-lg)' }}>{b.t}</h3><p>{b.d}</p></div>
                </li>
              ))}
            </ul>
          </div>
          <div className="box">
            {done ? (
              <div className="success">
                <span className="success__mark"><Icon name="check" size={28} /></span>
                <h2 className="sec__title" style={{ fontSize: 'var(--fs-2xl)' }}>Solicitud enviada</h2>
                <p className="muted">Gracias, {f.contact.split(' ')[0]}. Revisamos los datos de {f.company} y te escribimos a {f.email} en menos de 24 horas hábiles.</p>
                <Link className="btn" to="/catalogo">Ver el catálogo</Link>
              </div>
            ) : (
              <form
                className="form"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault()
                  setTried(true)
                  if (!Object.keys(errors).length) setDone(true)
                }}
              >
                <h2 className="pdp__h">Postúlate como aliado</h2>
                {text('company', 'Empresa o negocio', { autoComplete: 'organization' })}
                <div className="form__row">
                  {text('rif', 'RIF', { placeholder: 'J-12345678-9' })}
                  <label className="field">
                    <span className="field__label">Tipo de negocio</span>
                    <select className="input" value={f.type} onChange={(e) => set('type', e.target.value)} aria-invalid={err('type') ? true : undefined}>
                      <option value="">Elige una opción</option>
                      {TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    {err('type') ? <span className="field__error">{err('type')}</span> : null}
                  </label>
                </div>
                {text('contact', 'Persona de contacto', { autoComplete: 'name' })}
                <div className="form__row">
                  {text('email', 'Correo', { type: 'email', autoComplete: 'email' })}
                  {text('phone', 'Teléfono', { type: 'tel', autoComplete: 'tel' })}
                </div>
                {text('city', 'Ciudad', { autoComplete: 'address-level2' })}
                <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
                  <legend className="field__label" style={{ marginBottom: 6 }}>¿Qué líneas te interesan?</legend>
                  <div className="interest">
                    {CATEGORIES.map((c) => (
                      <button
                        type="button"
                        key={c.slug}
                        className="seg__opt"
                        aria-pressed={interests.has(c.name)}
                        onClick={() =>
                          setInterests((prev) => {
                            const n = new Set(prev)
                            if (n.has(c.name)) n.delete(c.name)
                            else n.add(c.name)
                            return n
                          })
                        }
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                  {err('interests') ? <span className="field__error">{err('interests')}</span> : null}
                </fieldset>
                <label className="field">
                  <span className="field__label">¿Qué necesitas? (opcional)</span>
                  <textarea className="input" value={f.message} onChange={(e) => set('message', e.target.value)} placeholder="Volumen mensual estimado, productos, plazos…" />
                </label>
                <label className="check">
                  <input type="checkbox" checked={f.accept} onChange={(e) => set('accept', e.target.checked)} />
                  <span>Autorizo a ARIA a verificar los datos de mi empresa para evaluar la solicitud.</span>
                </label>
                {err('accept') ? <span className="field__error">{err('accept')}</span> : null}
                <button className="btn btn--block" type="submit">Enviar solicitud</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
