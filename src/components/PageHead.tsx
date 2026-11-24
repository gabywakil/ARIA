import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function PageHead({ title, lead, crumb, children }: { title: string; lead?: string; crumb: string; children?: ReactNode }) {
  return (
    <section className="phead wrap">
      <nav className="phead__crumb" aria-label="Ruta">
        <Link to="/">Inicio</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{crumb}</span>
      </nav>
      <h1 className="phead__title">{title}</h1>
      {lead ? <p className="phead__lead">{lead}</p> : null}
      {children}
    </section>
  )
}
