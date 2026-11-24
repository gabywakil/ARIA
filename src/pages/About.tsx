import { Link } from 'react-router-dom'
import { PageHead } from '../components/PageHead'
import { img } from '../data/images'
import { STATS } from '../data/site'
import './pages.css'

// Historia, equipo y fechas son de ejemplo: se reemplazan con la información real de ARIA.
const TIMELINE = [
  { y: '2014', t: 'Abrimos la primera tienda en Lechería con motos HJM y Aichi.' },
  { y: '2017', t: 'Somos distribuidores de motos Vento con póliza incluida.' },
  { y: '2019', t: 'Sumamos plantas eléctricas Cummins y el servicio de alquiler.' },
  { y: '2022', t: 'Llega la línea solar Greenenergy y la ferretería.' },
  { y: '2024', t: 'Vendemos vehículos nuevos de Chevrolet, Toyota y Kia.' },
  { y: '2026', t: 'Abrimos la tienda en línea con factura y pago desde el celular.' },
]
const TEAM = [
  { n: 'Andrea Rivas', r: 'Dirección general' },
  { n: 'Luis Pereira', r: 'Ventas de motos y vehículos' },
  { n: 'María González', r: 'Energía y alquileres' },
  { n: 'José Tovar', r: 'Servicio técnico' },
]

export default function About() {
  return (
    <>
      <PageHead crumb="Nosotros" title="Somos ARIA Inventory & Mobility." lead="Una comercializadora de Lechería que vende movilidad y energía como nos gustaría que nos vendieran a nosotros: con precio claro, garantía y seguimiento." />
      <section className="sec wrap">
        <img className="photo-band" src={img.z800} alt="Moto Kawasaki Z800 en exhibición" />
        <div className="two" style={{ marginTop: 48 }}>
          <h2 className="sec__title">Empezamos con cinco motos y una promesa.</h2>
          <div style={{ display: 'grid', gap: 16 }}>
            <p className="sec__lead">En 2014 abrimos un local pequeño en Lechería. La promesa era sencilla: decir el precio completo desde el principio y responder después de la venta.</p>
            <p className="muted">Hoy distribuimos doce marcas de motos, vehículos, plantas eléctricas, energía solar y ferretería, y atendemos a personas, talleres, obras y comercios de todo el oriente del país. (Texto de ejemplo.)</p>
          </div>
        </div>
      </section>
      <section className="sec wrap">
        <div className="trio">
          <div><h3>Misión</h3><p>Conectar a las personas y negocios con movilidad y energía confiables, con atención directa y garantía real.</p></div>
          <div><h3>Visión</h3><p>Ser la comercializadora de referencia del oriente venezolano para comprar con confianza.</p></div>
          <div><h3>Valores</h3><p>Transparencia en el precio, cumplimiento en la entrega, servicio después de la venta y respeto por el tiempo del cliente.</p></div>
        </div>
      </section>
      <section className="sec wrap">
        <div className="two">
          <h2 className="sec__title">Nuestra trayectoria.</h2>
          <ol className="tl">
            {TIMELINE.map((t) => (
              <li key={t.y}><strong className="num">{t.y}</strong><span className="muted">{t.t}</span></li>
            ))}
          </ol>
        </div>
      </section>
      <section className="sec wrap">
        <div className="trio" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {STATS.map((s) => (
            <div key={s.label}><p className="stats__v display num" style={{ fontSize: 'var(--fs-3xl)' }}>{s.value}</p><p>{s.label}</p></div>
          ))}
        </div>
      </section>
      <section className="sec wrap">
        <div className="sec__head"><h2 className="sec__title">El equipo que te atiende.</h2></div>
        <ul className="team">
          {TEAM.map((t) => (
            <li key={t.n}>
              <div className="team__ph" aria-hidden="true">{t.n.split(' ').map((w) => w[0]).join('')}</div>
              <strong>{t.n}</strong>
              <span className="muted">{t.r}</span>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 48 }}><Link className="btn" to="/contacto">Agendar una visita</Link></div>
      </section>
    </>
  )
}
