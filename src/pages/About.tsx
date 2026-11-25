import { Link } from 'react-router-dom'
import showroom from '../assets/photos/showroom-sentra-2.jpg'
import { PageHead } from '../components/PageHead'
import { CATEGORIES } from '../data/products'
import { BRANDS } from '../data/site'
import { useStore } from '../state/store'
import './pages.css'

export default function About() {
  const { products } = useStore()
  return (
    <>
      <PageHead crumb="Nosotros" title="Somos ARIA Inventory & Mobility." lead="Una comercializadora de Lechería que reúne movilidad, energía y ferretería de marcas reconocidas, con precio claro, garantía y seguimiento después de la venta." />
      <section className="sec wrap">
        <img className="photo-band" src={showroom} alt="Nissan Sentra en la sala de exhibición de ARIA" />
        <div className="two" style={{ marginTop: 48 }}>
          <h2 className="sec__title">Todo lo que mueve tu día, en un solo lugar.</h2>
          <div style={{ display: 'grid', gap: 16 }}>
            <p className="sec__lead">Vendemos motos, cuatrimotos, vehículos, plantas eléctricas, energía solar y ferretería, para personas, talleres, obras, comercios e industria.</p>
            <p className="muted">Trabajamos con {BRANDS.length} marcas y más de {products.length} productos publicados, con atención directa por WhatsApp, en la tienda y desde esta página, donde puedes cotizar, facturar y pagar.</p>
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
        <div className="sec__head"><h2 className="sec__title">Lo que vendemos.</h2></div>
        <ul className="list-rows">
          {CATEGORIES.map((c) => (
            <li key={c.slug} style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr) auto' }}>
              <h3>{c.name}</h3>
              <p>{c.blurb}</p>
              <Link className="link" to={`/catalogo/${c.slug}`}>{products.filter((p) => p.category === c.name).length} productos</Link>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 48, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link className="btn" to="/contacto">Agendar una visita</Link>
          <Link className="btn btn--line" to="/aliados">Ser aliado</Link>
        </div>
      </section>
    </>
  )
}
