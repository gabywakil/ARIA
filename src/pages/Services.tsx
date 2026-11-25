import { Link } from 'react-router-dom'
import { Icon, type IconName } from '../components/Icon'
import { PageHead } from '../components/PageHead'
import interior from '../assets/photos/sentra-interior.jpg'
import { SERVICES } from '../data/site'
import './pages.css'

const DETAIL: Record<string, string> = {
  Financiación: 'Inicial desde 30 % y plazos de 6 a 36 meses en motos y vehículos. La aprobación toma uno o dos días hábiles con tu cédula, constancia de ingresos y referencias.',
  'Póliza y garantía': 'Las motos Vento salen con póliza de Seguros Caracas. Todos los productos tienen garantía de fábrica y nosotros hacemos el trámite por ti.',
  'Entrega coordinada': 'Entregamos en Lechería, Barcelona y Puerto La Cruz el mismo día o el siguiente. Al resto del país despachamos por transporte con seguimiento.',
  'Servicio técnico': 'Taller propio para motos y plantas eléctricas: mantenimiento preventivo, diagnóstico y repuestos originales de las marcas que vendemos.',
  'Alquiler de plantas': 'Plantas Hyundai GD Power de 25 a 1000 kVA por días, semanas o meses, con transporte, instalación y soporte durante el alquiler.',
  Asesoría: 'Te ayudamos a escoger la moto, el vehículo o la planta según tu uso y presupuesto, por WhatsApp, por teléfono o en la tienda.',
}

export default function Services() {
  return (
    <>
      <PageHead crumb="Servicios" title="Antes, durante y después de tu compra." lead="Vender es solo el comienzo. Esto es lo que ARIA hace por ti." />
      <section className="sec wrap">
        <ul className="list-rows">
          {SERVICES.map((s) => (
            <li key={s.title}>
              <Icon name={s.icon as IconName} size={30} />
              <h3>{s.title}</h3>
              <p>{DETAIL[s.title]}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="sec wrap">
        <img className="photo-band" src={interior} alt="Interior de un Nissan Sentra en la sala de ARIA" loading="lazy" />
        <div className="two" style={{ marginTop: 40 }}>
          <h2 className="sec__title">¿No sabes qué necesitas?</h2>
          <div style={{ display: 'grid', gap: 18, justifyItems: 'start' }}>
            <p className="sec__lead">Cuéntanos qué buscas y un asesor te responde en menos de 24 horas con opciones y precios.</p>
            <Link className="btn" to="/contacto">Hablar con un asesor</Link>
          </div>
        </div>
      </section>
    </>
  )
}
