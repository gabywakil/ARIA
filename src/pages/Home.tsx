import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { ProductCard, ProductShot } from '../components/ProductCard'
import { cut, type CutKey } from '../data/cutouts'
import { img, type ImgKey } from '../data/images'
import { PRODUCTS, money, productById, type Product } from '../data/products'
import { BRANDS, FAQ, SITE, STEPS, TESTIMONIALS } from '../data/site'
import { CountUp, LitText, Magnetic, Tilt, Words, glow, useScrollProgress } from '../components/fx'
import { useFluidRail } from '../hooks/useFluidRail'
import { SpringValue, reducedMotion } from '../lib/spring'
import './home.css'

/* =====================================================================
   HERO "ESTUDIO": tres productos reales en profundidad sobre el piso blanco.
   Se mueven en capas con el cursor (giro 3D) y se separan al hacer scroll.
   ===================================================================== */

const HERO_LAYERS = [
  { key: 'genmaq' as const, id: 13, cls: 'hl--back', depth: 0.35 },
  { key: 'tracker' as const, id: 8, cls: 'hl--mid', depth: 0.6 },
  { key: 'gsx' as const, id: 5, cls: 'hl--front', depth: 1 },
]

function HeroStudio() {
  const scene = useRef<HTMLDivElement>(null)
  // Resortes para el giro con el cursor: se siente físico y se puede interrumpir
  const [rot] = useState(() => {
    const paint = () => {
      const el = scene.current
      if (!el) return
      el.style.setProperty('--rx', `${o.x.value}`)
      el.style.setProperty('--ry', `${o.y.value}`)
    }
    const o = { x: new SpringValue(0, paint), y: new SpringValue(0, paint) }
    return o
  })

  useEffect(() => {
    const el = scene.current
    if (!el || reducedMotion()) return
    let raf = 0
    const update = () => {
      raf = 0
      el.style.setProperty('--sp', String(Math.min(1, scrollY / (innerHeight * 0.9))))
    }
    const on = () => (raf ||= requestAnimationFrame(update))
    addEventListener('scroll', on, { passive: true })
    return () => {
      removeEventListener('scroll', on)
      cancelAnimationFrame(raf)
      rot.x.stop()
      rot.y.stop()
    }
  }, [rot])

  return (
    <section
      className="hs"
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse' || reducedMotion()) return
        rot.x.to(e.clientX / innerWidth - 0.5, { damping: 1, response: 0.6 })
        rot.y.to(e.clientY / innerHeight - 0.5, { damping: 1, response: 0.6 })
      }}
      onPointerLeave={() => {
        rot.x.to(0, { damping: 0.8, response: 0.8 })
        rot.y.to(0, { damping: 0.8, response: 0.8 })
      }}
    >
      <div className="wrap hs__intro">
        <span className="tag hs__tag"><span className="hs__dot" /> Nuevos ingresos cada semana en Lechería</span>
        <h1 className="hs__title display">
          <Words text="Movilidad y energía," delay={80} />
          <span className="hs__line2"><Words text="elevadas." delay={380} /></span>
        </h1>
        <p className="hs__lead">Motos, vehículos y plantas eléctricas de marcas seleccionadas, con garantía real, factura en línea y un asesor que te atiende por tu nombre.</p>
        <div className="hs__cta">
          <Magnetic><Link to="/catalogo" className="btn btn--lg">Explorar catálogo</Link></Magnetic>
          <Magnetic><Link to="/contacto" className="btn btn--line btn--lg">Agendar una visita</Link></Magnetic>
        </div>
      </div>

      <div className="hs__scene" ref={scene} aria-label="Productos en exhibición">
        <span className="hs__word" aria-hidden="true">ARIA</span>
        <div className="hs__floor" aria-hidden="true" />
        {HERO_LAYERS.map((l) => {
          const p = productById.get(l.id)!
          return (
            <Link key={l.key} to={`/producto/${p.slug}`} className={`hl ${l.cls}`} style={{ '--z': l.depth } as React.CSSProperties} aria-label={p.name}>
              <span className="hl__shadow" aria-hidden="true" />
              <img src={cut[l.key]} alt={p.name} fetchPriority={l.cls === 'hl--front' ? 'high' : 'auto'} draggable={false} />
            </Link>
          )
        })}
        <div className="gl gl--a"><span className="gl__in"><Icon name="shield" size={18} /> Garantía hasta 2 años</span></div>
        <div className="gl gl--b"><span className="gl__in"><Icon name="doc" size={18} /> Factura en línea</span></div>
        <div className="gl gl--c"><span className="gl__in"><Icon name="truck" size={18} /> Entrega a todo el país</span></div>
      </div>
    </section>
  )
}

/* =====================================================================
   SALA DE EXHIBICIÓN: la pantalla se queda fija y, con el scroll,
   cada producto entra girando sobre el piso mientras su ficha se arma.
   ===================================================================== */

const SALA = [
  { id: 5, key: 'gsx' as const, cat: 'Motos', big: '199', unit: 'hp', label: 'de potencia' },
  { id: 7, key: 'z800' as const, cat: 'Motos', big: '806', unit: 'cc', label: 'cuatro cilindros' },
  { id: 9, key: 'corolla' as const, cat: 'Vehículos', big: '21', unit: 'km/L', label: 'híbrida' },
  { id: 8, key: 'tracker' as const, cat: 'Vehículos', big: '1.2', unit: 'turbo', label: 'automática' },
  { id: 13, key: 'genmaq' as const, cat: 'Plantas', big: '30', unit: 'kVA', label: 'insonorizada' },
  { id: 15, key: 'ducati' as const, cat: 'Plantas', big: '2,5', unit: 'kVA', label: 'arranque eléctrico' },
].map((s) => ({ ...s, p: productById.get(s.id)! }))

function Sala() {
  const [active, setActive] = useState(0)
  const items = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLDivElement>(null)

  const ref = useScrollProgress<HTMLElement>((prog) => {
    const n = SALA.length
    const x = prog * (n - 1) // posición continua entre productos
    const reduce = reducedMotion()
    items.current?.querySelectorAll<HTMLElement>('.sala__item').forEach((el, k) => {
      const d = x - k // <0: viene; >0: ya pasó
      // Cada producto queda quieto la mayor parte del tramo y el cambio ocurre en una ventana corta:
      // el que sale termina de girar antes de que entre el siguiente (nunca se ven dos encimados).
      const t = Math.max(0, Math.min(1, (Math.abs(d) - 0.22) / 0.28))
      const e = t * t * (3 - 2 * t) // suavizado
      const dir = Math.sign(d)
      el.style.opacity = String(1 - e)
      el.style.visibility = e >= 1 ? 'hidden' : 'visible'
      el.style.transform = reduce
        ? ''
        : `translateX(${-dir * e * 38}%) rotateY(${dir * e * 55}deg) scale(${1 - e * 0.12})`
    })
    bar.current?.style.setProperty('transform', `scaleX(${prog})`)
    const idx = Math.round(x)
    setActive((a) => (a === idx ? a : idx)) // solo re-renderiza al cambiar de producto
  }, 0, 1)

  const s = SALA[active]
  return (
    <section className="sala" ref={ref} style={{ '--n': SALA.length } as React.CSSProperties}>
      <div className="sala__pin">
        <div className="wrap sala__grid">
          <div className="sala__left">
            <span className="tag">La sala</span>
            <h2 className="sec__title">Recorre la sala sin salir de casa.</h2>
            <ol className="sala__list">
              {SALA.map((x, k) => (
                <li key={x.id} data-on={k === active ? '' : undefined}>
                  <span className="sala__cat">{x.cat}</span>
                  <span className="sala__nm">{x.p.name}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="sala__stage" ref={items}>
            <span className="sala__bg" aria-hidden="true" key={s.cat}>{s.cat}</span>
            <div className="sala__floor" aria-hidden="true" />
            {SALA.map((x) => (
              <div key={x.id} className="sala__item">
                <img src={cut[x.key]} alt={x.p.name} loading="lazy" draggable={false} />
              </div>
            ))}
          </div>
          <div className="sala__info" key={s.id} aria-live="polite">
            <p className="sala__big display num">{s.big}<small>{s.unit}</small></p>
            <p className="muted">{s.label}</p>
            <h3 className="sala__name">{s.p.name}</h3>
            <table className="spec sala__spec">
              <tbody>
                {Object.entries(s.p.specs).slice(0, 3).map(([k, v]) => (
                  <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="sala__buy">
              <span className="sala__price num">{money(s.p.price)}</span>
              <Link to={`/producto/${s.p.slug}`} className="btn">Ver ficha</Link>
            </div>
          </div>
        </div>
        <div className="wrap"><div className="sala__track"><div className="sala__bar" ref={bar} /></div></div>
      </div>
    </section>
  )
}

/* =====================================================================
   CATEGORÍAS: mosaico limpio, el producto gira levemente al pasar el mouse
   ===================================================================== */

const CAT_TILES: { slug: string; name: string; text: string; cut?: CutKey; photo?: ImgKey; cls: string }[] = [
  { slug: 'motos', name: 'Motos', text: 'Urbanas, naked y deportivas.', cut: 'z800', cls: 'ct--wide' },
  { slug: 'vehiculos', name: 'Vehículos', text: 'SUV y sedanes 0 km.', cut: 'k3', cls: 'ct--wide' },
  { slug: 'plantas', name: 'Plantas', text: 'Venta y alquiler.', cut: 'toyama', cls: '' },
  { slug: 'energia-solar', name: 'Energía solar', text: 'Inversores Greenenergy.', photo: 'solar', cls: '' },
  { slug: 'accesorios', name: 'Accesorios', text: 'Cascos y chaquetas.', photo: 'casco', cls: '' },
  { slug: 'ferreteria', name: 'Ferretería', text: 'Línea Maurer y más.', photo: 'tools', cls: '' },
]

function Categories() {
  return (
    <section className="sec wrap">
      <div className="sec__head sec__head--row" data-rv>
        <div style={{ display: 'grid', gap: 12 }}>
          <span className="tag">Categorías</span>
          <h2 className="sec__title">Todo lo que mueve tu día.</h2>
        </div>
        <Link to="/catalogo" className="btn btn--line btn--sm">Ver catálogo</Link>
      </div>
      <div className="ctg" data-rv>
        {CAT_TILES.map((c) => (
          <Link key={c.slug} to={`/catalogo/${c.slug}`} className={`ct ${c.cls} ${c.cut ? 'ct--cut' : 'ct--photo'}`} onPointerMove={glow}>
            <div className="ct__txt">
              <h3>{c.name}</h3>
              <p>{c.text}</p>
            </div>
            <span className="ct__go" aria-hidden="true"><Icon name="arrowRight" size={18} /></span>
            {c.cut ? <img className="ct__img" src={cut[c.cut]} alt="" loading="lazy" /> : <img className="ct__img" src={img[c.photo!]} alt="" loading="lazy" />}
          </Link>
        ))}
      </div>
    </section>
  )
}

/* =====================================================================
   HERRAMIENTAS: calculadora de planta y de cuotas en pestañas
   ===================================================================== */

function Tools() {
  const [tab, setTab] = useState<'planta' | 'cuotas'>('planta')
  return (
    <section className="sec wrap">
      <div className="tools" data-rv>
        <div className="tools__head">
          <div style={{ display: 'grid', gap: 12 }}>
            <span className="tag">Herramientas</span>
            <h2 className="sec__title">Decide con números, no con dudas.</h2>
          </div>
          <div className="seg tools__tabs" role="tablist" aria-label="Herramienta">
            <button role="tab" className="seg__opt" aria-selected={tab === 'planta'} aria-pressed={tab === 'planta'} onClick={() => setTab('planta')}>
              <Icon name="bolt" size={16} /> Calcular mi planta
            </button>
            <button role="tab" className="seg__opt" aria-selected={tab === 'cuotas'} aria-pressed={tab === 'cuotas'} onClick={() => setTab('cuotas')}>
              <Icon name="card" size={16} /> Simular cuotas
            </button>
          </div>
        </div>
        <div className="tools__body" key={tab} role="tabpanel">
          {tab === 'planta' ? <PowerPlanner /> : <FinanceHome />}
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
    <div className="planner">
        <div className="planner__q">
          <h3 className="tool__title">¿Qué planta necesitas?</h3>
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
            <ProductShot product={rec} />
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
    <div className="fin">
        <div className="fin__q">
          <h3 className="tool__title">Estrena hoy, paga en cuotas.</h3>
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
          <ProductShot product={p} className="fin__shot" key={p.id} />
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
      <HeroStudio />
      <Marquee />
      <Sala />
      <section className="sec wrap lit-wrap">
        <LitText text="Somos ARIA. Seleccionamos motos, vehículos, plantas eléctricas y energía solar para que muevas tu vida e ilumines tu negocio, con garantía real y una atención que te conoce por tu nombre." />
      </section>
      <Counters />
      <Categories />
      <Featured />
      <Bento />
      <Tools />
      <HowItWorks />
      <Voices />
      <AlliesCta />
      <Visit />
      <Faq />
      <Closing />
    </>
  )
}
