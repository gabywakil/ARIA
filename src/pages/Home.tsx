import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon, type IconName } from '../components/Icon'
import { ProductCard } from '../components/ProductCard'
import { img } from '../data/images'
import { CATEGORIES, PRODUCTS, money, productById, productImage, type Product } from '../data/products'
import { BRANDS, FAQ, NEWS, SERVICES, SITE, STATS, STEPS, TESTIMONIALS } from '../data/site'
import { useCart } from '../state/cart'
import { useFluidRail } from '../hooks/useFluidRail'
import { SpringValue } from '../lib/spring'
import './home.css'

/* ---------------- Hero: sala de exhibición ---------------- */

const SHOWROOM: { label: string; id: number }[] = [
  { label: 'Motos', id: 5 },
  { label: 'Vehículos', id: 9 },
  { label: 'Plantas', id: 15 },
  { label: 'Cuatrimotos', id: 4 },
  { label: 'Ferretería', id: 21 },
]

function Hero() {
  const [active, setActive] = useState(0)
  const product = productById.get(SHOWROOM[active].id)!
  const { add } = useCart()
  const specs = Object.entries(product.specs).slice(0, 3)

  return (
    <section className="hero">
      <div className="wrap">
        <h1 className="hero__title display">
          <span className="hero__line" style={{ '--i': 0 } as React.CSSProperties}>Lo que mueve</span>
          <span className="hero__line" style={{ '--i': 1 } as React.CSSProperties}>a Lechería.</span>
        </h1>
        <div className="hero__intro">
          <p className="hero__lead">
            Motos, vehículos, plantas eléctricas, energía solar y ferretería de marcas seleccionadas. Con garantía real, precio claro y atención directa.
          </p>
          <div className="hero__cta">
            <Link to="/catalogo" className="btn">Ver el catálogo</Link>
            <Link to="/contacto" className="btn btn--line">Agendar una visita</Link>
          </div>
        </div>

        <div className="stage" aria-label="Sala de exhibición">
          <div className="stage__tabs seg" role="group" aria-label="Elige qué ver en exhibición">
            {SHOWROOM.map((s, i) => (
              <button key={s.label} className="seg__opt" aria-pressed={i === active} onClick={() => setActive(i)}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="stage__body">
            <Link to={`/producto/${product.slug}`} className={`stage__media stage__media--${product.look}`} key={product.id}>
              <img src={productImage(product)} alt={product.name} fetchPriority="high" />
            </Link>
            <div className="stage__card" key={`c${product.id}`}>
              <p className="stage__brand pcard__meta">{product.brand}<span className="pcard__used">{product.condition}</span></p>
              <h2 className="stage__name">{product.name}</h2>
              <table className="spec stage__spec">
                <tbody>
                  {specs.map(([k, v]) => (
                    <tr key={k}>
                      <th scope="row">{k}</th>
                      <td>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="stage__price num">{money(product.price)}</p>
              <div className="stage__actions">
                <Link to={`/producto/${product.slug}`} className="btn btn--line">Ver ficha</Link>
                <button
                  className="btn"
                  onClick={() => add(product.id)}
                >
                  <Icon name="cart" size={18} /> Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Índice de categorías ---------------- */

const COUNT = new Map<string, number>()
for (const p of PRODUCTS) COUNT.set(p.category, (COUNT.get(p.category) ?? 0) + 1)

function CategoryIndex() {
  const listRef = useRef<HTMLUListElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  // Dos resortes independientes (X e Y): la foto sigue al cursor con inercia física
  const springs = useRef<{ x: SpringValue; y: SpringValue } | null>(null)
  const fresh = useRef(true)

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const x = new SpringValue(0, (v) => el.style.setProperty('--mx', `${v}px`))
    const y = new SpringValue(0, (v) => el.style.setProperty('--my', `${v}px`))
    springs.current = { x, y }
    return () => {
      x.stop()
      y.stop()
    }
  }, [])

  const onMove = (e: React.PointerEvent) => {
    const el = listRef.current
    const s = springs.current
    if (!el || !s || e.pointerType !== 'mouse') return
    const r = el.getBoundingClientRect()
    const tx = e.clientX - r.left
    const ty = e.clientY - r.top
    if (fresh.current) {
      // Primera vez: aparece donde está el cursor, sin viajar desde la esquina
      s.x.set(tx)
      s.y.set(ty)
      fresh.current = false
    } else {
      s.x.to(tx, { damping: 1, response: 0.38 })
      s.y.to(ty, { damping: 1, response: 0.38 })
    }
  }
  const onLeave = () => {
    setHover(null)
    fresh.current = true
  }

  return (
    <section className="sec wrap">
      <div className="sec__head">
        <h2 className="sec__title">Todo lo que vendemos, en un solo lugar.</h2>
        <p className="sec__lead">Seis líneas de producto con el mismo respaldo: garantía, factura en línea y un asesor que te conoce.</p>
      </div>
      <ul className="cindex" ref={listRef} onPointerMove={onMove} onPointerLeave={onLeave}>
        {CATEGORIES.map((c, i) => (
          <li key={c.slug}>
            <Link to={`/catalogo/${c.slug}`} className="cindex__row" onPointerEnter={() => setHover(i)} onFocus={() => setHover(i)}>
              <span className="cindex__thumb" aria-hidden="true">
                <img src={img[c.image]} alt="" loading="lazy" />
              </span>
              <span className="cindex__name display">{c.name}</span>
              <span className="cindex__blurb">{c.blurb}</span>
              <span className="cindex__count num">{COUNT.get(c.name) === 1 ? '1 producto' : `${COUNT.get(c.name) ?? 0} productos`}</span>
              <span className="cindex__go" aria-hidden="true"><Icon name="arrowRight" /></span>
            </Link>
          </li>
        ))}
        <li className="cindex__float" aria-hidden="true" data-on={hover !== null ? '' : undefined}>
          {CATEGORIES.map((c, i) => (
            <img key={c.slug} src={img[c.image]} alt="" data-on={i === hover ? '' : undefined} className={c.look === 'cutout' ? 'is-cutout' : ''} />
          ))}
        </li>
      </ul>
    </section>
  )
}

/* ---------------- Destacados (riel) ---------------- */

const FEATURED = [5, 9, 13, 4, 8, 6, 12, 16].map((id) => productById.get(id)!)

function Featured() {
  const { ref: rail, step } = useFluidRail<HTMLDivElement>()
  return (
    <section className="sec">
      <div className="wrap sec__head sec__head--row">
        <div>
          <h2 className="sec__title">Lo más buscado esta semana.</h2>
        </div>
        <div className="rail__ctrl">
          <button className="iconbtn" aria-label="Anteriores" onClick={() => step(-1)}><Icon name="arrowLeft" /></button>
          <button className="iconbtn" aria-label="Siguientes" onClick={() => step(1)}><Icon name="arrowRight" /></button>
          <Link to="/catalogo" className="btn btn--line btn--sm">Ver todo</Link>
        </div>
      </div>
      <div
        className="rail"
        ref={rail}
        tabIndex={0}
        aria-label="Productos destacados"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); step(1) }
          if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1) }
        }}
      >
        {FEATURED.map((p) => (
          <div className="rail__item" key={p.id}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  )
}

/* ---------------- ¿Qué planta necesitas? ---------------- */

const LOADS = [
  { id: 'luces', label: 'Luces y ventiladores', w: 400 },
  { id: 'nevera', label: 'Nevera', w: 700 },
  { id: 'tv', label: 'TV, internet y cargadores', w: 300 },
  { id: 'pc', label: 'Computadoras o punto de venta', w: 600 },
  { id: 'bomba', label: 'Bomba de agua', w: 1100 },
  { id: 'aire1', label: 'Un aire acondicionado', w: 1800 },
  { id: 'aire3', label: 'Tres o más aires', w: 6000 },
  { id: 'local', label: 'Local comercial completo', w: 14000 },
]

function pickGenerator(watts: number): Product {
  if (watts <= 2000) return productById.get(15)! // Ducati 2,5 kVA
  if (watts <= 2600) return productById.get(14)! // Toyama 3 kVA
  if (watts <= 11000) return productById.get(12)! // Cummins 13 kW
  return productById.get(13)! // Genmaq 30 kVA
}

function PowerPlanner() {
  const [on, setOn] = useState<Set<string>>(() => new Set(['luces', 'nevera', 'tv']))
  const watts = LOADS.reduce((s, l) => (on.has(l.id) ? s + l.w : s), 0)
  const rec = pickGenerator(watts * 1.25) // 25 % de margen para el arranque
  const toggle = (id: string) =>
    setOn((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <section className="sec wrap">
      <div className="planner">
        <div className="planner__q">
          <h2 className="sec__title">¿Qué planta necesitas?</h2>
          <p className="sec__lead">Marca lo que quieres mantener encendido durante un corte y te decimos qué equipo te sirve, para comprar o alquilar.</p>
          <div className="planner__loads" role="group" aria-label="Equipos a conectar">
            {LOADS.map((l) => (
              <button key={l.id} className="seg__opt" aria-pressed={on.has(l.id)} onClick={() => toggle(l.id)}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <div className="planner__a" aria-live="polite">
          <p className="planner__watts num">
            <span>{(watts / 1000).toLocaleString('es-VE', { maximumFractionDigits: 1 })}</span> kW
          </p>
          <p className="muted">Consumo estimado, más 25 % de margen para el arranque.</p>
          <hr className="rule" />
          <div className="planner__rec">
            <div className={`shot shot--${rec.look}`}>
              <img src={productImage(rec)} alt={rec.name} loading="lazy" />
            </div>
            <div>
              <p className="muted">Te recomendamos</p>
              <h3 className="planner__name">{rec.name}</h3>
              <p className="num"><strong>{money(rec.price)}</strong> para comprar{rec.rentPerDay ? <> o <strong>{money(rec.rentPerDay)}</strong> por día en alquiler</> : null}</p>
            </div>
          </div>
          <div className="planner__actions">
            <Link to={`/producto/${rec.slug}`} className="btn">Ver la planta</Link>
            <Link to="/energia" className="btn btn--line">Cotizar alquiler</Link>
          </div>
          <p className="planner__note">Valores orientativos. Un técnico confirma la carga antes de instalar.</p>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Cómo comprar ---------------- */

function Steps() {
  return (
    <section className="sec wrap">
      <div className="sec__head">
        <h2 className="sec__title">Comprar en ARIA toma cinco pasos.</h2>
        <p className="sec__lead">Todo se puede hacer desde el celular. Si prefieres, un asesor lo hace contigo.</p>
      </div>
      <ol className="steps">
        {STEPS.map((s, i) => (
          <li key={s.title} className="steps__item">
            <span className="steps__n num">{i + 1}</span>
            <h3 className="steps__t">{s.title}</h3>
            <p className="muted">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

/* ---------------- Servicios ---------------- */

function ServicesStrip() {
  return (
    <section className="sec wrap">
      <div className="sec__head sec__head--row">
        <h2 className="sec__title">Te acompañamos después de la venta.</h2>
        <Link to="/servicios" className="btn btn--line btn--sm">Todos los servicios</Link>
      </div>
      <ul className="svc">
        {SERVICES.map((s) => (
          <li key={s.title} className="svc__item">
            <Icon name={s.icon as IconName} size={28} />
            <h3 className="svc__t">{s.title}</h3>
            <p className="muted">{s.text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ---------------- Aliados ---------------- */

function AlliesCta() {
  return (
    <section className="sec wrap">
      <div className="allies">
        <div className="allies__text">
          <h2 className="sec__title">¿Tienes un taller, una obra o una flota?</h2>
          <p className="sec__lead">Hazte aliado de ARIA: precio por volumen, crédito, despacho prioritario y un asesor dedicado.</p>
          <ul className="allies__list feature-list">
            {['Precio especial por volumen', 'Crédito a 30 días para empresas', 'Cotizaciones en menos de 24 horas', 'Despacho prioritario a todo el país'].map((t) => (
              <li key={t}><Icon name="check" /> {t}</li>
            ))}
          </ul>
          <Link to="/aliados" className="btn">Postúlate como aliado</Link>
        </div>
        <img className="allies__img" src={img.maurer} alt="Herramientas Maurer en exhibición" loading="lazy" />
      </div>
    </section>
  )
}

/* ---------------- Testimonios ---------------- */

function Voices() {
  return (
    <section className="sec wrap">
      <h2 className="sec__title voices__title">Lo que dicen quienes ya compraron.</h2>
      <div className="voices">
        {TESTIMONIALS.map((t) => (
          <figure key={t.name} className="voices__item">
            <blockquote>“{t.quote}”</blockquote>
            <figcaption>
              <strong>{t.name}</strong>
              <span className="muted">{t.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

/* ---------------- Noticias + visita + FAQ ---------------- */

function NewsList() {
  return (
    <section className="sec wrap">
      <div className="sec__head sec__head--row">
        <h2 className="sec__title">Guías y novedades.</h2>
        <Link to="/noticias" className="btn btn--line btn--sm">Ver todas</Link>
      </div>
      <ul className="newsl">
        {NEWS.map((n) => (
          <li key={n.slug}>
            <Link to={`/noticias/${n.slug}`} className="newsl__row">
              <span className="newsl__tag">{n.tag}</span>
              <span className="newsl__title">{n.title}</span>
              <span className="newsl__date muted">{n.date}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Visit() {
  return (
    <section className="sec wrap">
      <div className="visit">
        <div className="visit__text">
          <h2 className="sec__title">Ven a verlo en persona.</h2>
          <p className="sec__lead">Agenda una cita y te tenemos el producto listo para que lo pruebes.</p>
          <ul className="visit__info">
            <li><Icon name="pin" /> {SITE.city}</li>
            <li><Icon name="clock" /> {SITE.hours}</li>
            <li><Icon name="phone" /> {SITE.phone}</li>
          </ul>
          <table className="spec visit__cov">
            <caption className="vh">Tiempos de entrega</caption>
            <tbody>
              <tr><th scope="row">Lechería, Barcelona y Puerto La Cruz</th><td>El mismo día</td></tr>
              <tr><th scope="row">Resto de Anzoátegui</th><td>24 horas</td></tr>
              <tr><th scope="row">Caracas y el centro del país</th><td>48 horas</td></tr>
              <tr><th scope="row">Resto de Venezuela</th><td>3 a 5 días</td></tr>
            </tbody>
          </table>
          <div className="hero__cta">
            <Link to="/contacto" className="btn">Agendar cita</Link>
            <a className="btn btn--line" href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noreferrer">
              <Icon name="chat" size={18} /> WhatsApp
            </a>
          </div>
        </div>
        <MapArt />
      </div>
    </section>
  )
}

function MapArt() {
  return (
    <svg className="visit__map" viewBox="0 0 560 420" role="img" aria-label="Mapa ilustrativo de Lechería">
      <rect width="560" height="420" rx="24" fill="#fff" />
      <path d="M0 300c90-30 160 10 250-10s170-70 310-40v170H0z" fill="#f2f3f4" />
      <g fill="none" stroke="#e4e5e7" strokeWidth="14" strokeLinecap="round">
        <path d="M-10 120 570 70" />
        <path d="M150-10 200 430" />
        <path d="M390-10 350 300" />
        <path d="M0 220 560 190" />
      </g>
      <g fill="none" stroke="#c9cbcf" strokeWidth="1">
        <path d="M-10 120 570 70" />
        <path d="M150-10 200 430" />
      </g>
      <text x="40" y="370" fill="#5e6166" fontSize="14" fontFamily="inherit">Mar Caribe</text>
      <circle cx="280" cy="150" r="34" fill="#1d1d1f" opacity=".08" />
      <circle cx="280" cy="150" r="12" fill="#1d1d1f" stroke="#fff" strokeWidth="4" />
      <text x="304" y="140" fill="#1d1d1f" fontSize="16" fontWeight="600" fontFamily="inherit">ARIA</text>
    </svg>
  )
}

function Faq() {
  return (
    <section className="sec wrap faqsec">
      <h2 className="sec__title">Preguntas frecuentes.</h2>
      <div>
        {FAQ.map((f) => (
          <details key={f.q} className="faq">
            <summary>
              {f.q}
              <Icon name="plus" />
            </summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

/* ---------------- Producto destacado (editorial) ---------------- */

const SPOT = productById.get(7)!
const SPOT_FIGS = [
  { v: '806', u: 'cc', l: 'Cuatro cilindros en línea' },
  { v: '111', u: 'hp', l: 'Potencia máxima' },
  { v: '14.500', u: 'km', l: 'Un solo dueño, con historial' },
  { v: '6', u: 'meses', l: 'De garantía ARIA' },
]

function Spotlight() {
  return (
    <section className="sec wrap">
      <div className="spot">
        <Link to={`/producto/${SPOT.slug}`} className="spot__media" aria-label={`Ver ${SPOT.name}`}>
          <img src={productImage(SPOT)} alt={SPOT.name} loading="lazy" />
        </Link>
        <div className="spot__card">
          <p className="muted">Llegó esta semana</p>
          <h2 className="spot__title display">{SPOT.name}</h2>
          <p className="spot__text">Naked de media cilindrada, revisada pieza por pieza en nuestro taller: frenos, cadena, cauchos y electrónica. Lista para salir el mismo día.</p>
          <div className="spot__buy">
            <span className="spot__price num">{money(SPOT.price)}</span>
            <Link to={`/producto/${SPOT.slug}`} className="btn">Ver la ficha</Link>
          </div>
        </div>
      </div>
      <dl className="spot__figs">
        {SPOT_FIGS.map((f) => (
          <div key={f.l}>
            <dt className="muted">{f.l}</dt>
            <dd className="num"><span className="display">{f.v}</span> {f.u}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/* ---------------- Financiación ---------------- */

const FINANCEABLE = PRODUCTS.filter((p) => p.price >= 1000 && (p.category === 'Motos' || p.category === 'Vehículos'))
const TERMS = [6, 12, 24, 36]

function FinanceHome() {
  const [id, setId] = useState(FINANCEABLE[0].id)
  const [down, setDown] = useState(30)
  const [months, setMonths] = useState(12)
  const p = productById.get(id)!
  const fee = (p.price * (1 - down / 100)) / months

  return (
    <section className="sec wrap">
      <div className="fin">
        <div className="fin__q">
          <h2 className="sec__title">Estrena hoy, paga en cuotas.</h2>
          <p className="sec__lead">Elige tu moto o vehículo, mueve la inicial y el plazo, y mira tu cuota al instante. Sin papeleo para simular.</p>
          <label className="field">
            <span className="field__label">Quiero financiar</span>
            <select className="input" value={id} onChange={(e) => setId(+e.target.value)}>
              {FINANCEABLE.map((f) => (
                <option key={f.id} value={f.id}>{f.name} ({money(f.price)})</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="finance__row"><span className="field__label">Inicial</span><strong className="num">{down} % ({money((p.price * down) / 100)})</strong></span>
            <input type="range" min={20} max={70} step={5} value={down} onChange={(e) => setDown(+e.target.value)} />
          </label>
          <div className="field">
            <span className="field__label">Plazo</span>
            <div className="seg" role="group" aria-label="Plazo en meses">
              {TERMS.map((t) => (
                <button key={t} className="seg__opt" aria-pressed={months === t} onClick={() => setMonths(t)}>{t} meses</button>
              ))}
            </div>
          </div>
        </div>
        <div className="fin__a" aria-live="polite">
          <div className={`shot shot--${p.look} fin__shot`}>
            <img src={productImage(p)} alt={p.name} loading="lazy" key={p.id} />
          </div>
          <p className="muted">Tu cuota mensual</p>
          <p className="fin__fee num display">{money(fee)}</p>
          <p className="muted">durante {months} meses, después de una inicial de {money((p.price * down) / 100)}.</p>
          <div className="planner__actions">
            <Link to={`/producto/${p.slug}`} className="btn">Ver {p.brand}</Link>
            <Link to="/contacto" className="btn btn--line">Solicitar crédito</Link>
          </div>
          <p className="planner__note">Simulación sin intereses, sujeta a aprobación.</p>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Compra protegida ---------------- */

const PROTECT: { icon: IconName; t: string; d: string }[] = [
  { icon: 'tag', t: 'Precio final por escrito', d: 'La cotización incluye IVA, póliza y entrega. Lo que ves es lo que pagas.' },
  { icon: 'card', t: 'Pago confirmado antes de despachar', d: 'Verificamos tu pago y te avisamos por WhatsApp con el número de factura.' },
  { icon: 'shield', t: 'Garantía en tu factura', d: 'El plazo de garantía queda impreso en el documento, con nuestro RIF.' },
  { icon: 'wrench', t: 'Primera revisión sin costo', d: 'Tu moto o planta vuelve al taller a los 1.000 km o al primer mes, por nuestra cuenta.' },
]

function Protected() {
  return (
    <section className="sec wrap">
      <div className="prot">
        <div className="prot__head">
          <h2 className="sec__title">Compra protegida, de principio a fin.</h2>
          <p className="sec__lead">Comprar una moto o una planta es una decisión grande. Por eso cada compra en ARIA tiene cuatro respaldos.</p>
          <Link to="/servicios" className="link">Cómo trabajamos</Link>
        </div>
        <ul className="prot__list">
          {PROTECT.map((x) => (
            <li key={x.t}>
              <span className="prot__ic"><Icon name={x.icon} size={24} /></span>
              <h3>{x.t}</h3>
              <p className="muted">{x.d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------------- Instagram ---------------- */

const GRAM = ['vento', 'spike', 'casco', 'jacket', 'solar', 'gen'] as const

function Gram() {
  return (
    <section className="sec wrap">
      <div className="sec__head sec__head--row">
        <div style={{ display: 'grid', gap: 12 }}>
          <h2 className="sec__title">Lo nuevo, primero en Instagram.</h2>
          <p className="sec__lead">Llegadas, ofertas de la semana y entregas a clientes en @ariainventory.</p>
        </div>
        <a className="btn btn--line btn--sm" href={SITE.instagram} target="_blank" rel="noreferrer"><Icon name="instagram" size={18} /> Seguir</a>
      </div>
      <ul className="gram">
        {GRAM.map((k) => (
          <li key={k}>
            <a href={SITE.instagram} target="_blank" rel="noreferrer" aria-label="Ver publicación en Instagram">
              <img src={img[k]} alt="" loading="lazy" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ---------------- Cierre ---------------- */

function Closing() {
  return (
    <section className="closing wrap">
      <h2 className="closing__title display">Tu próxima moto ya está en Lechería.</h2>
      <div className="closing__row">
        <p className="sec__lead">Ven a verla, pruébala y llévatela con factura y garantía. O pídela desde aquí y te la llevamos.</p>
        <div className="hero__cta">
          <Link to="/catalogo/motos" className="btn">Ver motos</Link>
          <Link to="/contacto" className="btn btn--line">Agendar visita</Link>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Página ---------------- */

export default function Home() {
  return (
    <>
      <Hero />
      <section className="brands wrap" aria-label="Marcas que distribuimos">
        <p className="brands__label muted">Distribuimos</p>
        <ul className="brands__list">
          {BRANDS.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>
      <section className="stats wrap" aria-label="ARIA en cifras">
        {STATS.map((s) => (
          <div key={s.label} className="stats__item">
            <p className="stats__v display num">{s.value}</p>
            <p className="muted">{s.label}</p>
          </div>
        ))}
      </section>
      <CategoryIndex />
      <Featured />
      <Spotlight />
      <PowerPlanner />
      <FinanceHome />
      <Protected />
      <Steps />
      <ServicesStrip />
      <AlliesCta />
      <Voices />
      <Gram />
      <NewsList />
      <Visit />
      <Faq />
      <Closing />
    </>
  )
}
