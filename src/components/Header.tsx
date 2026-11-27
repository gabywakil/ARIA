import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { NAV, NAV_MORE } from '../data/site'
import { useCart } from '../state/cart'
import { Icon } from './Icon'
import { Logo } from './Logo'
import { Search } from './Search'

export function Header() {
  const { count } = useCart()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState(false)
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
    <>
    <header className="hdr" data-scrolled={scrolled ? '' : undefined} data-open={open ? '' : undefined}>
      <div className="hdr__in">
        <Link to="/" className="hdr__logo" aria-label="ARIA, ir al inicio">
          <Logo />
        </Link>
        <nav className="hdr__nav" aria-label="Principal">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className="hdr__link">
              {n.label}
            </NavLink>
          ))}
        </nav>
        <button className="hdr__cart hdr__search" aria-label="Buscar productos" onClick={() => setSearch(true)}>
          <Icon name="search" />
        </button>
        <Link to="/carrito" className="hdr__cart" aria-label={`Carrito, ${count} productos`}>
          <Icon name="cart" />
          <span key={count} className="hdr__count" data-empty={count === 0 ? '' : undefined}>{count}</span>
        </Link>
        <button className="hdr__menu" aria-expanded={open} aria-controls="menu-movil" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setOpen((o) => !o)}>
          <Icon name={open ? 'close' : 'menu'} size={22} />
        </button>
      </div>
    </header>
    {/* Fuera del encabezado: su desenfoque crearía un contexto que encoge el menú */}
      <nav id="menu-movil" className="hdr__sheet" aria-label="Menú" inert={!open} data-open={open ? '' : undefined}>
        <NavLink to="/" end className="hdr__sheetlink">Inicio</NavLink>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} className="hdr__sheetlink">
            {n.label}
          </NavLink>
        ))}
        <div className="hdr__more">
          {NAV_MORE.map((n) => (
            <NavLink key={n.to} to={n.to}>{n.label}</NavLink>
          ))}
        </div>
      </nav>
      <Search open={search} onClose={() => setSearch(false)} />
    </>
  )
}
