import { useState } from 'react'
import { Icon } from '../components/Icon'
import { PageHead } from '../components/PageHead'
import { SITE } from '../data/site'
import './pages.css'

const TOPICS = ['Comprar un producto', 'Agendar una visita', 'Alquiler de plantas', 'Servicio técnico', 'Otro']

export default function Contact() {
  const [topic, setTopic] = useState(TOPICS[0])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [msg, setMsg] = useState('')
  const [tried, setTried] = useState(false)
  const [done, setDone] = useState(false)
  const errs = {
    name: name.trim().length < 3 ? 'Escribe tu nombre.' : '',
    phone: phone.replace(/\D/g, '').length < 10 ? 'Escribe un teléfono con código de área.' : '',
  }

  return (
    <>
      <PageHead crumb="Contacto" title="Hablemos." lead="Escríbenos, llámanos o agenda una visita. Respondemos en horario de tienda el mismo día." />
      <section className="sec wrap">
        <div className="two">
          <div style={{ display: 'grid', gap: 28 }}>
            <ul className="list-rows">
              <li style={{ gridTemplateColumns: '32px 1fr' }}><Icon name="chat" size={24} /><div><h3 style={{ fontSize: 'var(--fs-lg)' }}>WhatsApp</h3><a className="link" href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noreferrer">{SITE.phone}</a></div></li>
              <li style={{ gridTemplateColumns: '32px 1fr' }}><Icon name="mail" size={24} /><div><h3 style={{ fontSize: 'var(--fs-lg)' }}>Correo</h3><a className="link" href={`mailto:${SITE.email}`}>{SITE.email}</a></div></li>
              <li style={{ gridTemplateColumns: '32px 1fr' }}><Icon name="pin" size={24} /><div><h3 style={{ fontSize: 'var(--fs-lg)' }}>Tienda</h3><p>{SITE.address}</p></div></li>
              <li style={{ gridTemplateColumns: '32px 1fr' }}><Icon name="clock" size={24} /><div><h3 style={{ fontSize: 'var(--fs-lg)' }}>Horario</h3><p>{SITE.hours}</p></div></li>
            </ul>
          </div>
          <div className="box">
            {done ? (
              <div className="success">
                <span className="success__mark"><Icon name="check" size={28} /></span>
                <h2 className="pdp__h">Mensaje enviado</h2>
                <p className="muted">Gracias, {name.split(' ')[0]}. Te escribimos al {phone} hoy mismo.</p>
              </div>
            ) : (
              <form className="form" noValidate onSubmit={(e) => { e.preventDefault(); setTried(true); if (!errs.name && !errs.phone) setDone(true) }}>
                <div className="field">
                  <span className="field__label">¿En qué te ayudamos?</span>
                  <div className="seg" role="group" aria-label="Motivo">
                    {TOPICS.map((t) => (
                      <button type="button" key={t} className="seg__opt" aria-pressed={topic === t} onClick={() => setTopic(t)}>{t}</button>
                    ))}
                  </div>
                </div>
                <label className="field">
                  <span className="field__label">Nombre</span>
                  <input className="input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={tried && errs.name ? true : undefined} />
                  {tried && errs.name ? <span className="field__error">{errs.name}</span> : null}
                </label>
                <label className="field">
                  <span className="field__label">Teléfono o WhatsApp</span>
                  <input className="input" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={tried && errs.phone ? true : undefined} />
                  {tried && errs.phone ? <span className="field__error">{errs.phone}</span> : null}
                </label>
                <label className="field">
                  <span className="field__label">Mensaje (opcional)</span>
                  <textarea className="input" value={msg} onChange={(e) => setMsg(e.target.value)} />
                </label>
                <button className="btn btn--block" type="submit">Enviar mensaje</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
