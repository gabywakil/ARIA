import { useDeferredValue, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { PageHead } from '../components/PageHead'
import { FAQ, FAQ_CATS } from '../data/site'
import { useStore } from '../state/store'
import './pages.css'

export default function Faq() {
  const { site } = useStore()
  const [cat, setCat] = useState<string>('Todas')
  const [q, setQ] = useState('')
  const dq = useDeferredValue(q.trim().toLowerCase())
  const list = FAQ.filter((f) => (cat === 'Todas' || f.cat === cat) && (!dq || `${f.q} ${f.a}`.toLowerCase().includes(dq)))
  return (
    <>
      <PageHead crumb="Preguntas frecuentes" title="Preguntas frecuentes." lead="Todo sobre cómo comprar, pagar, recibir tu pedido y la garantía." />
      <section className="wrap faqpage">
        <div className="faqpage__tools">
          <label className="cat__search">
            <Icon name="search" size={18} />
            <input className="input" type="search" placeholder="Busca tu duda" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <div className="cat__subs" role="group" aria-label="Temas" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Todas', ...FAQ_CATS].map((c) => (
              <button key={c} className="seg__opt seg__opt--sm" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
        </div>
        <div className="faqpage__list">
          {list.length ? (
            list.map((f) => (
              <details key={f.q} className="faq">
                <summary>{f.q}<Icon name="plus" /></summary>
                <p>{f.a}</p>
              </details>
            ))
          ) : (
            <p className="muted" style={{ padding: '24px 0' }}>No encontramos esa pregunta. Escríbenos y te respondemos.</p>
          )}
        </div>
        <div className="faqpage__more box">
          <h2 className="pdp__h">¿No está tu duda?</h2>
          <p className="muted">Un asesor te responde por WhatsApp en horario de tienda.</p>
          <div className="ally__act" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a className="btn" href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer"><Icon name="chat" size={18} /> Escribir por WhatsApp</a>
            <Link className="btn btn--line" to="/como-comprar">Cómo comprar</Link>
          </div>
        </div>
      </section>
    </>
  )
}
