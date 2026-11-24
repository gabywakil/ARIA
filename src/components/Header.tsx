import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { img } from '../data/images'
import { NAV } from '../data/site'
import { useCart } from '../state/cart'
import { Icon } from './Icon'

export function Header() {
  const { count } = useCart()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()

  // Cierra el menú al navegar
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
  }, [open])

  return (
    <header className="hdr" data-scrolled={scrolled ? '' : undefined} data-open={open ? '' : undefined}>
      <div className="hdr__in">
        <Link to="/" className="hdr__logo" aria-label="ARIA, ir al inicio">
          <img src={img.logo} alt="ARIA Inventory & Mobility" width={150} height={34} />
        </Link>
        <nav className="hdr__nav" aria-label="Principal">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className="hdr__link">
              {n.label}
            </NavLink>
          ))}
        </nav>
        <Link to="/carrito" className="hdr__cart" aria-label={`Carrito, ${count} productos`}>
          <Icon name="cart" />
          <span className="hdr__count" data-empty={count === 0 ? '' : undefined}>{count}</span>
        </Link>
        <button className="hdr__menu" aria-expanded={open} aria-controls="menu-movil" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setOpen((o) => !o)}>
          <Icon name={open ? 'close' : 'menu'} size={22} />
        </button>
      </div>
      <nav id="menu-movil" className="hdr__sheet" aria-label="Menú" hidden={!open}>
        <NavLink to="/" end className="hdr__sheetlink">Inicio</NavLink>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} className="hdr__sheetlink">
            {n.label}
          </NavLink>
        ))}
        <NavLink to="/noticias" className="hdr__sheetlink">Noticias</NavLink>
      </nav>
    </header>
  )
}
