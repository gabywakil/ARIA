import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="wrap empty" style={{ minHeight: '60vh', alignContent: 'center' }}>
      <h1 className="phead__title">Esta página no existe.</h1>
      <p className="muted">Puede que el producto ya no esté disponible o que el enlace tenga un error.</p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link className="btn" to="/catalogo">Ir al catálogo</Link>
        <Link className="btn btn--line" to="/">Volver al inicio</Link>
      </div>
    </section>
  )
}
