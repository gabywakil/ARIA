import { Link, useParams } from 'react-router-dom'
import { NEWS } from '../data/site'
import NotFound from './NotFound'
import './pages.css'

export default function Article() {
  const { slug } = useParams()
  const n = NEWS.find((x) => x.slug === slug)
  if (!n) return <NotFound />
  return (
    <article className="wrap article">
      <nav className="phead__crumb" aria-label="Ruta" style={{ paddingTop: 16 }}>
        <Link to="/">Inicio</Link><span aria-hidden="true">/</span><Link to="/noticias">Noticias</Link>
      </nav>
      <p className="muted">{n.tag}, {n.date}</p>
      <h1 className="phead__title">{n.title}</h1>
      <p className="sec__lead">{n.excerpt}</p>
      <hr className="rule" />
      {n.body.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
        <Link className="btn" to="/catalogo">Ver el catálogo</Link>
        <Link className="btn btn--line" to="/noticias">Más guías</Link>
      </div>
    </article>
  )
}
