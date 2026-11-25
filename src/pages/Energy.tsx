import { useState } from 'react'
import { Icon } from '../components/Icon'
import { PageHead } from '../components/PageHead'
import { ProductCard } from '../components/ProductCard'
import { useStore } from '../state/store'
import './pages.css'

const PERIODS = ['Días', 'Semanas', 'Meses'] as const
const USES = ['Hogar', 'Comercio', 'Evento', 'Obra', 'Industria'] as const

/** Solicitud de alquiler o instalación: sin precios inventados, llega por WhatsApp con todos los datos */
function RentRequest() {
  const { products, site } = useStore()
  const gens = products.filter((p) => p.category === 'Plantas eléctricas')
  const [gen, setGen] = useState(gens[0]?.slug ?? '')
  const [kind, setKind] = useState<'Alquiler' | 'Compra con instalación'>('Alquiler')
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('Días')
  const [units, setUnits] = useState(3)
  const [use, setUse] = useState<(typeof USES)[number]>('Hogar')
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const g = gens.find((x) => x.slug === gen)
  const msg = `Hola ARIA, quiero ${kind === 'Alquiler' ? `alquilar por ${units} ${period.toLowerCase()}` : 'comprar con instalación'} la planta ${g ? `${g.brand} ${g.name}` : ''}. Uso: ${use}. ${city ? `Ciudad: ${city}.` : ''} ${name ? `Mi nombre es ${name}.` : ''}`

  return (
    <form className="box form" onSubmit={(e) => { e.preventDefault(); window.open(`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener') }}>
      <div className="seg" role="group" aria-label="Tipo de solicitud">
        {(['Alquiler', 'Compra con instalación'] as const).map((k) => (
          <button type="button" key={k} className="seg__opt" aria-pressed={kind === k} onClick={() => setKind(k)}>{k}</button>
        ))}
      </div>
      <label className="field">
        <span className="field__label">Planta</span>
        <select className="input" value={gen} onChange={(e) => setGen(e.target.value)}>
          {gens.map((x) => <option key={x.slug} value={x.slug}>{x.brand} {x.name}</option>)}
        </select>
      </label>
      {kind === 'Alquiler' ? (
        <div className="form__row">
          <label className="field">
            <span className="field__label">Tiempo</span>
            <input className="input" type="number" min={1} max={60} value={units} onChange={(e) => setUnits(Math.max(1, +e.target.value || 1))} />
          </label>
          <label className="field">
            <span className="field__label">Unidad</span>
            <select className="input" value={period} onChange={(e) => setPeriod(e.target.value as (typeof PERIODS)[number])}>
              {PERIODS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
        </div>
      ) : null}
      <div className="field">
        <span className="field__label">¿Para qué la necesitas?</span>
        <div className="seg" role="group" aria-label="Uso">
          {USES.map((u) => <button type="button" key={u} className="seg__opt seg__opt--sm" aria-pressed={use === u} onClick={() => setUse(u)}>{u}</button>)}
        </div>
      </div>
      <div className="form__row">
        <label className="field"><span className="field__label">Tu nombre</span><input className="input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className="field"><span className="field__label">Ciudad</span><input className="input" autoComplete="address-level2" value={city} onChange={(e) => setCity(e.target.value)} /></label>
      </div>
      <button className="btn btn--block" type="submit"><Icon name="chat" size={18} /> Enviar solicitud por WhatsApp</button>
      <p className="field__hint">Te respondemos con disponibilidad, precio del día y fecha de entrega. Escríbenos también al {site.phone}.</p>
    </form>
  )
}

export default function Energy() {
  const { products } = useStore()
  const plantas = products.filter((p) => p.category === 'Plantas eléctricas')
  const solar = products.filter((p) => p.category === 'Energía solar')
  return (
    <>
      <PageHead crumb="Energía" title="Luz cuando la necesitas." lead="Plantas Hyundai GD Power de 25 a 1000 kVA, generadores residenciales Cummins y energía solar Greenenergy. Venta, alquiler e instalación." />
      <section className="sec wrap">
        <div className="two">
          <div style={{ display: 'grid', gap: 18 }}>
            <h2 className="sec__title">Alquila o instala tu planta.</h2>
            <p className="sec__lead">Para casas, comercios, eventos, obras e industria. Llevamos la planta, la conectamos y te damos soporte mientras la uses.</p>
            <ul className="feature-list">
              <li><Icon name="truck" /> Transporte e instalación con técnico</li>
              <li><Icon name="wrench" /> Mantenimiento programado</li>
              <li><Icon name="bolt" /> Monofásicas y trifásicas, insonorizadas</li>
            </ul>
          </div>
          <RentRequest />
        </div>
      </section>
      <section className="sec wrap">
        <div className="sec__head"><h2 className="sec__title">Plantas eléctricas.</h2></div>
        <div className="pgrid">{plantas.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      </section>
      <section className="sec wrap">
        <div className="sec__head"><h2 className="sec__title">Energía solar.</h2><p className="sec__lead">Inversores híbridos y paneles de 550 W con 25 años de garantía de energía.</p></div>
        <div className="pgrid">{solar.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      </section>
    </>
  )
}
