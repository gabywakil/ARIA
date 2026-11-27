import { Link, useParams } from 'react-router-dom'
import { PageHead } from '../components/PageHead'
import { LEGAL } from '../data/legal'
import NotFound from './NotFound'
import './pages.css'

export default function Legal() {
  const { doc } = useParams()
  const d = LEGAL.find((x) => x.slug === doc)
  if (!d) return <NotFound />
  return (
    <>
      <PageHead crumb={d.title} title={d.title} lead={d.lead} />
      <section className="wrap legal">
        <nav className="legal__nav" aria-label="Documentos legales">
          {LEGAL.map((x) => (
            <Link key={x.slug} to={`/legal/${x.slug}`} aria-current={x.slug === d.slug ? 'page' : undefined}>{x.title}</Link>
          ))}
        </nav>
        <article className="legal__body">
          {d.sections.map((s) => (
            <section key={s.h}>
              <h2>{s.h}</h2>
              {s.p.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
            </section>
          ))}
          <p className="muted">Última actualización: noviembre de 2026.</p>
        </article>
      </section>
    </>
  )
}
