import { Link } from 'react-router-dom'
import { CATEGORIES } from '../data/products'
import { SITE } from '../data/site'
import { Icon } from './Icon'
import { Logo } from './Logo'

const year = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="ftr">
      <div className="wrap ftr__grid">
        <div className="ftr__brand">
          <Logo size="lg" />
          <p>Motos, vehículos, energía y ferretería con garantía real, desde Lechería para todo el país.</p>
          <a className="ftr__ig" href={SITE.instagram} target="_blank" rel="noreferrer">
            <Icon name="instagram" size={18} /> @ariainventory
          </a>
        </div>
        <div>
          <h2 className="ftr__h">Catálogo</h2>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} to={`/catalogo/${c.slug}`}>{c.name}</Link>
          ))}
        </div>
        <div>
          <h2 className="ftr__h">ARIA</h2>
          <Link to="/nosotros">Quiénes somos</Link>
          <Link to="/servicios">Servicios</Link>
          <Link to="/energia">Alquiler de plantas</Link>
          <Link to="/aliados">Ser aliado</Link>
          <Link to="/noticias">Noticias</Link>
        </div>
        <div>
          <h2 className="ftr__h">Contacto</h2>
          <p>{SITE.city}</p>
          <a href={`tel:${SITE.phone.replace(/\s/g, '')}`}>{SITE.phone}</a>
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          <Link to="/contacto">Agendar una cita</Link>
        </div>
      </div>
      <div className="wrap ftr__legal">
        <span>© {year} ARIA Inventory & Mobility. Precios en dólares, IVA 16 % aparte.</span>
        <span>Diseño y desarrollo: GW Studios</span>
      </div>
    </footer>
  )
}
