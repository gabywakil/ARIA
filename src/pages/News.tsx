import { Link } from 'react-router-dom'
import { PageHead } from '../components/PageHead'
import { NEWS } from '../data/site'
import './home.css'
import './pages.css'

export default function News() {
  return (
    <>
      <PageHead crumb="Noticias" title="Guías y novedades." lead="Consejos para elegir, cuidar y sacarle provecho a tu moto, tu vehículo o tu planta." />
      <section className="sec wrap">
        <ul className="newsl">
          {NEWS.map((n) => (
            <li key={n.slug}>
              <Link to={`/noticias/${n.slug}`} className="newsl__row">
                <span className="newsl__tag">{n.tag}</span>
                <span style={{ display: 'grid', gap: 6 }}>
                  <span className="newsl__title">{n.title}</span>
                  <span className="muted" style={{ fontSize: 'var(--fs-sm)' }}>{n.excerpt}</span>
                </span>
                <span className="newsl__date muted">{n.date}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
