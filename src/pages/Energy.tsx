import { useState } from 'react'
import { Icon } from '../components/Icon'
import { PageHead } from '../components/PageHead'
import { ProductCard } from '../components/ProductCard'
import { PRODUCTS, money } from '../data/products'
import { useToast } from '../state/toast'
import './pages.css'

const ENERGY = PRODUCTS.filter((p) => p.category === 'Plantas' || p.category === 'Energía solar')
const RENTABLE = PRODUCTS.filter((p) => p.rentPerDay)
const PERIODS = [
  { id: 'dia', label: 'Por días', factor: 1 },
  { id: 'semana', label: 'Por semanas', factor: 6 },
  { id: 'mes', label: 'Por meses', factor: 22 },
] as const
const INSTALL = 80
const DELIVERY = 35

function RentQuote() {
  const [id, setId] = useState(RENTABLE[2]?.id ?? RENTABLE[0].id)
  const [period, setPeriod] = useState<(typeof PERIODS)[number]['id']>('dia')
  const [units, setUnits] = useState(3)
  const [install, setInstall] = useState(false)
  const [phone, setPhone] = useState('')
  const [sent, setSent] = useState(false)
  const toast = useToast()
  const gen = RENTABLE.find((r) => r.id === id)!
  const per = PERIODS.find((p) => p.id === period)!
  const rent = gen.rentPerDay! * per.factor * Math.max(1, units)
  const total = rent + DELIVERY + (install ? INSTALL : 0)
  const unitLabel = period === 'dia' ? 'días' : period === 'semana' ? 'semanas' : 'meses'

  return (
    <div className="box" style={{ display: 'grid', gap: 18 }}>
      {sent ? (
        <div className="success">
          <span className="success__mark"><Icon name="check" size={28} /></span>
          <h3 className="pdp__h">Solicitud recibida</h3>
          <p className="muted">Te escribimos al {phone} para confirmar disponibilidad y fecha de entrega.</p>
          <button className="btn btn--line" onClick={() => setSent(false)}>Cotizar otra planta</button>
        </div>
      ) : (
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault()
            if (phone.replace(/\D/g, '').length < 10) {
              toast('Escribe un teléfono válido para contactarte')
              return
            }
            setSent(true)
          }}
        >
          <label className="field">
            <span className="field__label">Planta</span>
            <select className="input" value={id} onChange={(e) => setId(+e.target.value)}>
              {RENTABLE.map((r) => (
                <option key={r.id} value={r.id}>{r.name} ({money(r.rentPerDay!)} por día)</option>
              ))}
            </select>
          </label>
          <div className="field">
            <span className="field__label">Tiempo de alquiler</span>
            <div className="seg" role="group" aria-label="Unidad de tiempo">
              {PERIODS.map((p) => (
                <button type="button" key={p.id} className="seg__opt" aria-pressed={period === p.id} onClick={() => setPeriod(p.id)}>{p.label}</button>
              ))}
            </div>
          </div>
          <label className="field">
            <span className="field__label">Cantidad de {unitLabel}</span>
            <input className="input" type="number" min={1} max={60} value={units} onChange={(e) => setUnits(Math.max(1, +e.target.value || 1))} />
            <span className="field__hint">La semana se cobra como 6 días y el mes como 22.</span>
          </label>
          <label className="check">
            <input type="checkbox" checked={install} onChange={(e) => setInstall(e.target.checked)} />
            <span>Instalación y conexión por un técnico (+{money(INSTALL)})</span>
          </label>
          <div className="totals">
            <div><span>Alquiler</span><span>{money(rent)}</span></div>
            <div><span>Transporte ida y vuelta</span><span>{money(DELIVERY)}</span></div>
            {install ? <div><span>Instalación</span><span>{money(INSTALL)}</span></div> : null}
            <div className="totals__grand"><span>Estimado</span><span>{money(total)}</span></div>
          </div>
          <label className="field">
            <span className="field__label">Teléfono para confirmar</span>
            <input className="input" type="tel" autoComplete="tel" placeholder="0414 000 0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <button className="btn btn--block" type="submit">Solicitar alquiler</button>
          <p className="field__hint">Precios de ejemplo, sin IVA. Se requiere un depósito reembolsable.</p>
        </form>
      )}
    </div>
  )
}

export default function Energy() {
  return (
    <>
      <PageHead crumb="Energía" title="Luz cuando la necesitas." lead="Plantas Cummins, Genmaq, Toyama y Ducati para comprar o alquilar, e inversores solares Greenenergy con instalación." />
      <section className="sec wrap">
        <div className="two">
          <div style={{ display: 'grid', gap: 18 }}>
            <h2 className="sec__title">Alquila una planta por el tiempo que la necesites.</h2>
            <p className="sec__lead">Para eventos, obras, mudanzas o mientras llega tu equipo propio. Llevamos la planta, la conectamos y la retiramos.</p>
            <ul className="feature-list">
              <li><Icon name="truck" /> Transporte ida y vuelta incluido en Anzoátegui</li>
              <li><Icon name="wrench" /> Mantenimiento y combustible inicial incluidos</li>
              <li><Icon name="clock" /> Soporte técnico mientras dure el alquiler</li>
            </ul>
          </div>
          <RentQuote />
        </div>
      </section>
      <section className="sec wrap">
        <div className="sec__head">
          <h2 className="sec__title">Equipos a la venta.</h2>
        </div>
        <div className="pgrid">
          {ENERGY.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </>
  )
}
