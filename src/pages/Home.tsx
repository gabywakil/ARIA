import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon, type IconName } from '../components/Icon'
import { ProductCard } from '../components/ProductCard'
import { img } from '../data/images'
import { CATEGORIES, PRODUCTS, money, productById, productImage, type Product } from '../data/products'
import { BRANDS, FAQ, NEWS, SITE, STEPS, TESTIMONIALS } from '../data/site'
import { CountUp, LitText, Magnetic, Tilt, Words, glow, useScrollProgress } from '../components/fx'
import { useFluidRail } from '../hooks/useFluidRail'
import { project, reducedMotion } from '../lib/spring'
import './home.css'

/* ---------------- Hero (como el prototipo, con física) ---------------- */

const SLIDES = [
  { id: 5, fit: 'cover' },
  { id: 9, fit: 'contain' },
  { id: 13, fit: 'cover' },
  { id: 4, fit: 'contain' },
  { id: 8, fit: 'contain' },
].map((s) => ({ ...s, p: productById.get(s.id)! }))
const AUTOPLAY = 5200

function Hero() {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const stage = useRef<HTMLDivElement>(null)
  const pills = useRef<HTMLDivElement>(null)
  const slide = SLIDES[i]

  // Avanza solo, salvo que la persona esté encima o la pestaña esté oculta
  useEffect(() => {
    if (paused || reducedMotion()) return
    const t = window.setTimeout(() => setI((n) => (n + 1) % SLIDES.length), AUTOPLAY)
    return () => window.clearTimeout(t)
  }, [i, paused])

  // Profundidad al hacer scroll: el escenario se aleja y las píldoras flotan a distinta velocidad
  useEffect(() => {
    if (reducedMotion()) return
    let raf = 0
    const update = () => {
      raf = 0
      const y = Math.min(scrollY, innerHeight)
      const st = stage.current
      if (st) st.style.transform = `translateY(${y * 0.08}px) scale(${1 - y / innerHeight * 0.05})`
      pills.current?.querySelectorAll<HTMLElement>('[data-sp]').forEach((el) => {
        el.style.translate = `0 ${y * Number(el.dataset.sp)}px`
      })
    }
    const on = () => (raf ||= requestAnimationFrame(update))
    addEventListener('scroll', on, { passive: true })
    return () => {
      removeEventListener('scroll', on)
      cancelAnimationFrame(raf)
    }
  }, [])

  // Deslizar con el dedo: decide con el impulso proyectado, no con la distancia
  const drag = useRef<{ x: number; t: number } | null>(null)
  const go = (d: number) => setI((n) => (n + d + SLIDES.length) % SLIDES.length)

  return (
    <section className="hh">
      <div className="wrap hh__intro">
        <span className="tag" data-rv>ARIA Inventory &amp; Mobility</span>
        <h1 className="hw display">
          <Words text="Movilidad y energía, elevadas." delay={120} />
        </h1>
        <p className="hp">
          Motos, vehículos, plantas eléctricas y energía solar de marcas seleccionadas. Con garantía real y atención directa en Lechería.
        </p>
        <div className="hb">
          <Magnetic><Link to="/catalogo" className="btn btn--lg">Explorar catálogo</Link></Magnetic>
          <Magnetic><Link to="/aliados" className="btn btn--line btn--lg">Ser aliado</Link></Magnetic>
        </div>
      </div>
      <div className="wrap" ref={pills}>
        <div
          className="hstage"
          ref={stage}
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
          onPointerDown={(e) => (drag.current = { x: e.clientX, t: performance.now() })}
          onPointerUp={(e) => {
            const d = drag.current
            drag.current = null
            if (!d) return
            const dx = e.clientX - d.x
            const v = (dx / Math.max(1, performance.now() - d.t)) * 1000
            const landing = dx + project(v)
            if (Math.abs(dx) > 12 && Math.abs(landing) > 80) go(landing < 0 ? 1 : -1)
          }}
        >
          {SLIDES.map((s, n) => (
            <Link
              key={s.id}
              to={`/producto/${s.p.slug}`}
              className={`hstage__sl hstage__sl--${s.fit}`}
              data-on={n === i ? '' : undefined}
              aria-hidden={n !== i}
              tabIndex={n === i ? 0 : -1}
              draggable={false}
            >
              <img src={productImage(s.p)} alt={s.p.name} draggable={false} fetchPriority={n === 0 ? 'high' : 'low'} />
            </Link>
          ))}
          <div className="gl gl--1" data-sp="-0.06"><span className="gl__in"><Icon name="shield" size={18} /> Garantía hasta 2 años</span></div>
          <div className="gl gl--2" data-sp="0.05"><span className="gl__in"><Icon name="truck" size={18} /> Entrega coordinada</span></div>
          <div className="gl gl--3" data-sp="-0.035"><span className="gl__in"><Icon name="doc" size={18} /> Factura en línea</span></div>
          <div className="cap">
            <div className="cap__txt" key={slide.id}>
              <b>{slide.p.name}</b>
              <small>{slide.p.highlight}, desde {money(slide.p.price)}</small>
            </div>
            <div className="dots" role="tablist" aria-label="Productos en exhibición">
              {SLIDES.map((s, n) => (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={n === i}
                  aria-label={s.p.name}
                  className="dot"
                  data-on={n === i ? '' : undefined}
                  data-paused={paused ? '' : undefined}
                  style={{ '--dur': `${AUTOPLAY}ms` } as React.CSSProperties}
                  onClick={() => setI(n)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Cinta de marcas ---------------- */

function Marquee() {
  return (
    <section className="mq" aria-label="Marcas que distribuimos">
      <div className="mq__track">
        {[0, 1].map((k) => (
          <ul key={k} aria-hidden={k === 1}>
            {BRANDS.map((b) => <li key={b}>{b}</li>)}
          </ul>
        ))}
      </div>
    </section>
  )
}

/* ---------------- Cifras ---------------- */

const COUNTERS = [
  { to: 12, s: '+', l: 'años en el mercado' },
  { to: 3500, s: '+', l: 'clientes atendidos' },
  { to: 12, s: '', l: 'marcas aliadas' },
  { to: 24, s: ' h', l: 'para responder una cotización' },
]

function Counters() {
  return (
    <section className="wrap cnts">
      {COUNTERS.map((c) => (
        <div key={c.l} data-rv>
          <b className="display"><CountUp to={c.to} suffix={c.s} /></b>
          <span className="muted">{c.l}</span>
        </div>
      ))}
    </section>
  )
}

/* ---------------- Elige tu camino (tarjetas apiladas) ---------------- */

const STACK: { name: string; slug: string; title: string; text: string; points: string[]; image: Product['image']; fit: 'cover' | 'contain' }[] = [
  { name: 'Motos', slug: 'motos', title: 'Motos para cada camino.', text: 'Urbanas, naked y deportivas de Vento, HJM, Aichi, Suzuki, Yamaha y Kawasaki.', points: ['Póliza incluida en Vento', 'Financiación desde 30 % de inicial', 'Revisión en nuestro taller'], image: 'gsx', fit: 'cover' },
  { name: 'Vehículos', slug: 'vehiculos', title: 'Tu próximo carro, sin sorpresas.', text: 'SUV y sedanes nuevos de Chevrolet, Toyota, Kia y Changan, con garantía de fábrica.', points: ['Precio final por escrito', 'Hasta 3 años de garantía', 'Entrega con papeles al día'], image: 'corolla', fit: 'contain' },
  { name: 'Plantas', slug: 'plantas', title: 'Que el corte no te detenga.', text: 'Plantas de 2,5 a 30 kVA de Cummins, Genmaq, Toyama y Ducati. Para comprar o alquilar.', points: ['Instalación con técnico', 'Alquiler por día, semana o mes', 'Mantenimiento programado'], image: 'genmaq', fit: 'cover' },
  { name: 'Energía solar', slug: 'energia-solar', title: 'Energía propia, factura más baja.', text: 'Inversores híbridos Greenenergy de 3.000 a 12.500 VA con baterías de litio.', points: ['Estudio de consumo sin costo', 'Instalación certificada', 'Monitoreo desde el celular'], image: 'solar', fit: 'cover' },
  { name: 'Ferretería', slug: 'ferreteria', title: 'Herramientas que aguantan la obra.', text: 'Herramientas manuales, de obra y la línea Maurer, con precio por volumen para aliados.', points: ['Stock permanente', 'Precio especial por volumen', 'Despacho a obra'], image: 'maurer', fit: 'cover' },
]

function Stack() {
  const ref = useRef<HTMLDivElement>(null)
  // Cada tarjeta se encoge un poco cuando la siguiente la tapa: sensación de profundidad
  useEffect(() => {
    if (reducedMotion()) return
    const cards = Array.from(ref.current?.children ?? []) as HTMLElement[]
    let raf = 0
    const update = () => {
      raf = 0
      cards.forEach((c, n) => {
        const next = cards[n + 1]
        if (!next) return
        const top = parseFloat(getComputedStyle(c).top) || 0
        const d = next.getBoundingClientRect().top - top
        const k = Math.max(0, Math.min(1, 1 - d / c.offsetHeight))
        c.style.transform = `scale(${1 - k * 0.05})`
        c.style.filter = k > 0.02 ? `brightness(${1 - k * 0.08})` : ''
      })
    }
    const on = () => (raf ||= requestAnimationFrame(update))
    addEventListener('scroll', on, { passive: true })
    return () => {
      removeEventListener('scroll', on)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section className="sec wrap">
      <div className="center-head" data-rv>
        <span className="tag">Todo en un solo lugar</span>
        <h2 className="sec__title">Elige tu camino.</h2>
      </div>
      <div className="stack" ref={ref}>
        {STACK.map((c, n) => (
          <article key={c.slug} className="scard" style={{ '--i': n } as React.CSSProperties}>
            <div className="scard__txt">
              <span className="tag">{c.name}</span>
              <h3 className="sec__title">{c.title}</h3>
              <p className="muted">{c.text}</p>
              <ul className="feature-list">
                {c.points.map((x) => <li key={x}><Icon name="check" size={18} /> {x}</li>)}
              </ul>
              <Link className="btn" to={`/catalogo/${c.slug}`}>Explorar {c.name.toLowerCase()}</Link>
            </div>
            <div className={`scard__media scard__media--${c.fit}`}>
              <img src={img[c.image]} alt="" loading="lazy" />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ---------------- Buscador por presupuesto ---------------- */

const FIND_CATS = ['Todos', 'Motos', 'Vehículos', 'Plantas', 'Energía solar', 'Accesorios', 'Ferretería'] as const

function Finder() {
  const [cat, setCat] = useState<(typeof FIND_CATS)[number]>('Todos')
  const [budget, setBudget] = useState(8000)
  const res = PRODUCTS.filter((p) => (cat === 'Todos' || p.category === cat) && p.price <= budget).toSorted((a, b) => b.price - a.price)
  return (
    <section className="sec wrap">
      <div className="center-head" data-rv>
        <span className="tag">Buscador</span>
        <h2 className="sec__title">Encuentra el tuyo en segundos.</h2>
      </div>
      <div className="finder" data-rv>
        <div className="seg" role="group" aria-label="Categoría">
          {FIND_CATS.map((c) => (
            <button key={c} className="seg__opt" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <label className="field finder__range">
          <span className="finance__row"><span className="field__label">Presupuesto máximo</span><strong className="num finder__val">{money(budget)}</strong></span>
          <input type="range" min={100} max={35000} step={100} value={budget} onChange={(e) => setBudget(+e.target.value)} />
        </label>
        <p className="muted" aria-live="polite">{res.length === 1 ? '1 resultado' : `${res.length} resultados`}</p>
        {res.length ? (
          <div className="pgrid">
            {res.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <p className="muted">Sube el presupuesto para ver opciones.</p>
        )}
        {res.length > 4 ? <Link className="link" to={cat === 'Todos' ? '/catalogo' : `/catalogo/${CATEGORIES.find((c) => c.name === cat)?.slug}`}>Ver los {res.length} resultados</Link> : null}
      </div>
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
          <span className="tag">Lo más buscado</span>
          <h2 className="sec__title">Desliza y descubre.</h2>
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
            <Tilt><ProductCard product={p} /></Tilt>
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
      <div className="planner" data-rv>
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

/* ---------------- Por qué ARIA (bento con brillo) ---------------- */

function Bento() {
  return (
    <section className="sec wrap">
      <div className="center-head" data-rv>
        <span className="tag">Por qué ARIA</span>
        <h2 className="sec__title">Todo lo que importa, resuelto.</h2>
      </div>
      <div className="bt" data-rv>
        <div className="bti bti--im" onPointerMove={glow}>
          <img src={img.mt03} alt="" loading="lazy" />
          <div><h3>Garantía real</h3><p>Hasta 2 años de respaldo en vehículos y equipos, escrita en tu factura.</p></div>
        </div>
        <div className="bti" onPointerMove={glow}><span className="ib"><Icon name="shield" size={24} /></span><h3>Póliza incluida</h3><p>Todas las motos Vento salen aseguradas.</p></div>
        <div className="bti bti--gr" onPointerMove={glow}><b className="display">24 h</b><p>Para responder tu cotización</p></div>
        <div className="bti" onPointerMove={glow}><span className="ib"><Icon name="truck" size={24} /></span><h3>Entrega coordinada</h3><p>A todo el país, con seguimiento.</p></div>
        <div className="bti" onPointerMove={glow}><span className="ib"><Icon name="card" size={24} /></span><h3>Paga como quieras</h3><p>Zelle, pago móvil, transferencia o efectivo.</p></div>
        <div className="bti bti--wd" onPointerMove={glow}><span className="ib"><Icon name="wrench" size={24} /></span><h3>Servicio técnico propio</h3><p>Mantenimiento, diagnóstico y repuestos originales para tu moto, tu vehículo o tu planta.</p></div>
        <div className="bti bti--wd" onPointerMove={glow}><span className="ib"><Icon name="users" size={24} /></span><h3>Un asesor que te conoce</h3><p>Te atiende la misma persona por WhatsApp, por teléfono y en la tienda.</p></div>
      </div>
    </section>
  )
}

/* ---------------- Cómo funciona (línea que se llena) ---------------- */

function HowItWorks() {
  const fill = useRef<HTMLDivElement>(null)
  const ref = useScrollProgress<HTMLElement>((p, el) => {
    fill.current?.style.setProperty('transform', `scaleX(${p})`)
    el.querySelectorAll<HTMLElement>('.st').forEach((s, n) => {
      if (p >= n / STEPS.length + 0.02) s.dataset.on = ''
      else delete s.dataset.on
    })
  }, 0.8, 0.45)
  return (
    <section className="sec wrap how" ref={ref}>
      <span className="tag" data-rv>Cómo funciona</span>
      <h2 className="sec__title" data-rv>Comprar en ARIA, en cinco pasos.</h2>
      <div className="trk" aria-hidden="true"><div className="fil" ref={fill} /></div>
      <ol className="steps5">
        {STEPS.map((s, n) => (
          <li key={s.title} className="st">
            <i className="num">{n + 1}</i>
            <b>{s.title}</b>
            <p className="muted">{s.text}</p>
          </li>
        ))}
      </ol>
      <Magnetic><Link className="btn btn--lg" to="/catalogo">Empieza ahora</Link></Magnetic>
    </section>
  )
}

/* ---------------- Testimonios que rotan ---------------- */

function Voices() {
  const [n, setN] = useState(0)
  const [hold, setHold] = useState(false)
  useEffect(() => {
    if (hold || reducedMotion()) return
    const t = window.setTimeout(() => setN((x) => (x + 1) % TESTIMONIALS.length), 6500)
    return () => window.clearTimeout(t)
  }, [n, hold])
  const t = TESTIMONIALS[n]
  return (
    <section className="sec wrap tq" onPointerEnter={() => setHold(true)} onPointerLeave={() => setHold(false)}>
      <span className="tag" data-rv>Clientes</span>
      <figure className="tq__fig" key={n} aria-live="polite">
        <blockquote>“{t.quote}”</blockquote>
        <figcaption><b>{t.name}</b><span className="muted">{t.role}</span></figcaption>
      </figure>
      <div className="dots dots--c" role="tablist" aria-label="Testimonios">
        {TESTIMONIALS.map((x, k) => (
          <button key={x.name} role="tab" aria-selected={k === n} aria-label={x.name} className="dot dot--static" data-on={k === n ? '' : undefined} onClick={() => setN(k)} />
        ))}
      </div>
    </section>
  )
}

/* ---------------- Aliados (tarjeta verde) ---------------- */

function AlliesCta() {
  return (
    <section className="sec wrap">
      <div className="alc" data-rv onPointerMove={glow}>
        <div className="alc__txt">
          <h2 className="sec__title">¿Tienes un negocio o un taller?</h2>
          <p>Únete como aliado: precios por volumen, crédito para empresas y un asesor dedicado.</p>
          <Magnetic><Link className="btn btn--white btn--lg" to="/aliados">Postúlate aquí</Link></Magnetic>
        </div>
        <div className="alg">
          <div><Icon name="tag" size={22} /> Precios por volumen</div>
          <div><Icon name="truck" size={22} /> Despacho prioritario</div>
          <div><Icon name="doc" size={22} /> Cotización en 24 h</div>
          <div><Icon name="users" size={22} /> Asesor dedicado</div>
        </div>
      </div>
    </section>
  )
}


/* ---------------- Noticias + visita + FAQ ---------------- */

function NewsList() {
  return (
    <section className="sec wrap">
      <div className="sec__head sec__head--row" data-rv>
        <h2 className="sec__title">Guías y novedades.</h2>
        <Link to="/noticias" className="btn btn--line btn--sm">Ver todas</Link>
      </div>
      <ul className="newsl" data-rv>
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
      <div className="visit" data-rv>
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
    <section className="sec wrap faqsec" data-rv>
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
      <div className="spot" data-rv>
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
      <div className="fin" data-rv>
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
      <div className="prot" data-rv>
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
      <div className="sec__head sec__head--row" data-rv>
        <div style={{ display: 'grid', gap: 12 }}>
          <h2 className="sec__title">Lo nuevo, primero en Instagram.</h2>
          <p className="sec__lead">Llegadas, ofertas de la semana y entregas a clientes en @ariainventory.</p>
        </div>
        <a className="btn btn--line btn--sm" href={SITE.instagram} target="_blank" rel="noreferrer"><Icon name="instagram" size={18} /> Seguir</a>
      </div>
      <ul className="gram" data-rv>
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
      <Marquee />
      <section className="sec wrap lit-wrap">
        <LitText text="Somos ARIA. Seleccionamos motos, vehículos, plantas eléctricas y energía solar para que muevas tu vida e ilumines tu negocio, con garantía real y una atención que te conoce por tu nombre." />
      </section>
      <Counters />
      <Stack />
      <Finder />
      <Featured />
      <Spotlight />
      <Bento />
      <PowerPlanner />
      <FinanceHome />
      <HowItWorks />
      <Voices />
      <Protected />
      <AlliesCta />
      <Gram />
      <NewsList />
      <Visit />
      <Faq />
      <Closing />
    </>
  )
}
