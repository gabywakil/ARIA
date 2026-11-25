import logo from '../assets/img/logo.png'

// Logo original de ARIA, con el fondo blanco eliminado (PNG transparente a 2x).
export function Logo({ size = 'md', className = '' }: { size?: 'md' | 'lg'; className?: string }) {
  return <img className={`logo logo--${size} ${className}`} src={logo} alt="ARIA Inventory & Mobility" width={339} height={80} />
}
