// Logotipo de ARIA en vector: símbolo + palabra + descriptor.
// Se dibuja con la tipografía de la marca, sin imagen ni fondo blanco, y se ve nítido a cualquier tamaño.
export function Logo({ size = 'md', className = '' }: { size?: 'md' | 'lg'; className?: string }) {
  return (
    <span className={`logo logo--${size} ${className}`} role="img" aria-label="ARIA Inventory & Mobility">
      <svg className="logo__mark" viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="currentColor" />
        {/* La A de ARIA como un camino que sube hacia el horizonte */}
        <path d="M11 31 20 9l9 22" fill="none" stroke="#fff" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.6 24.2h11.8" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" opacity=".55" />
      </svg>
      <span className="logo__word" aria-hidden="true">ARIA</span>
      <span className="logo__rule" aria-hidden="true" />
      <span className="logo__sub" aria-hidden="true">
        <span>Inventory</span>
        <span>&amp; Mobility</span>
      </span>
    </span>
  )
}
