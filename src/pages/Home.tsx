import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import showroom from '../assets/photos/showroom-sentra.jpg'
import trunk from '../assets/photos/sentra-maleta.jpg'
import { CountUp, LitText, Magnetic, Tilt, Words, glow, useScrollProgress } from '../components/fx'
import { Icon, type IconName } from '../components/Icon'
import { ProductCard, ProductShot } from '../components/ProductCard'
import { CATEGORIES, imageSrc, money } from '../data/products'
// Cantidad de referencias del catálogo completo de ferretería (se fija al armar el catálogo)
import refsInfo from '../data/refs-count.json'
import { BRANDS, FAQ, STEPS } from '../data/site'
import { useFluidRail } from '../hooks/useFluidRail'
import { SpringValue, reducedMotion } from '../lib/spring'
import { useStore } from '../state/store'
import './home.css'

/* =====================================================================
   HERO "ESTUDIO": tres productos reales de ARIA en profundidad sobre el piso blanco.
   Giran con el cursor (resortes) y se separan al hacer scroll.
   ===================================================================== */

const HERO_LAYERS = [
  { image: 'cummins', slug: 'cummins-generador-residencial-con-transferencia-automatica', cls: 'hl--back', depth: 0.35 },
  { image: 'terralord', slug: 'zx-auto-terralord', cls: 'hl--mid', depth: 0.6 },
  { image: 'loncin-250nk', slug: 'loncin-250nk-2026', cls: 'hl--front', depth: 1 },
]

function HeroStudio() {
  const { site } = useStore()
  const scene = useRef<HTMLDivElement>(null)
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

  // La última palabra del título va en la segunda línea, con el degradado
  const words = site.heroTitle.trim().split(' ')
  const last = words.pop() ?? ''
  const first = words.join(' ')

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
        <span className="tag hs__tag"><span className="hs__dot" /> {site.announcement}</span>
        <h1 className="hs__title display">
          <Words text={first} delay={80} />
          <span className="hs__line2"><Words text={last} delay={380} /></span>
        </h1>
        <p className="hs__lead">{site.heroLead}</p>
        <div className="hs__cta">
          <Magnetic><Link to="/catalogo" className="btn btn--lg">Comprar ahora</Link></Magnetic>
          <Magnetic><Link to="/como-comprar" className="btn btn--line btn--lg">Cómo comprar</Link></Magnetic>
        </div>
      </div>

      <div className="hs__scene" ref={scene} aria-label="Productos en exhibición">
        <span className="hs__word" aria-hidden="true">ARIA</span>
        <div className="hs__floor" aria-hidden="true" />
        {HERO_LAYERS.map((l) => (
          <Link key={l.image} to={`/producto/${l.slug}`} className={`hl ${l.cls}`} style={{ '--z': l.depth } as React.CSSProperties}>
            <span className="hl__shadow" aria-hidden="true" />
            <img src={imageSrc(l.image)} alt="" fetchPriority={l.cls === 'hl--front' ? 'high' : 'auto'} draggable={false} />
          </Link>
        ))}
        <div className="gl gl--a"><span className="gl__in"><Icon name="shield" size={18} /> Garantía de fábrica</span></div>
        <div className="gl gl--b"><span className="gl__in"><Icon name="doc" size={18} /> Factura en línea</span></div>
        <div className="gl gl--c"><span className="gl__in"><Icon name="truck" size={18} /> Entrega a todo el país</span></div>
      </div>
    </section>
  )
}

/* =====================================================================
   LA SALA: la pantalla queda fija y, con el scroll, cada producto sale girando
   y entra el siguiente mientras su cifra clave y su ficha se arman al lado.
   ===================================================================== */

const SALA_DEF = [
  { slug: 'vento-dakar-300', big: '25', unit: 'HP', label: 'doble propósito, 300 cc' },
  { slug: 'forza-evo-450', big: '152', unit: 'km/h', label: 'velocidad máxima, inyección' },
  { slug: 'loncin-xwolf-1000', big: '2', unit: 'puestos', label: 'la cuatrimoto más potente de Loncin' },
  { slug: 'hisun-utv-hs1000-crew', big: '5', unit: 'puestos', label: 'UTV de cabina doble' },
  { slug: 'zx-auto-grandlion', big: '4x4', unit: '', label: 'automática, doble cabina' },
  { slug: 'hyundai-gd-power-generador-100-kva', big: '100', unit: 'kVA', label: 'insonorizada, diésel' },
  { slug: 'greenenergy-inversor-de-almacenamiento-vs', big: '12.500', unit: 'VA', label: 'inversor híbrido' },
]

function Sala() {
  const { bySlug } = useStore()
  const sala = useMemo(() => SALA_DEF.flatMap((s) => (bySlug.get(s.slug) ? [{ ...s, p: bySlug.get(s.slug)! }] : [])), [bySlug])
  const [active, setActive] = useState(0)
  const items = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLDivElement>(null)

  const ref = useScrollProgress<HTMLElement>((prog) => {
    const n = sala.length
    const x = prog * (n - 1)
    const reduce = reducedMotion()
    items.current?.querySelectorAll<HTMLElement>('.sala__item').forEach((el, k) => {
      const d = x - k
      // Cada producto queda quieto la mayor parte del tramo; el cambio ocurre en una ventana corta
      const t = Math.max(0, Math.min(1, (Math.abs(d) - 0.22) / 0.28))
      const e = t * t * (3 - 2 * t)
      const dir = Math.sign(d)
      el.style.opacity = String(1 - e)
      el.style.visibility = e >= 1 ? 'hidden' : 'visible'
      el.style.transform = reduce ? '' : `translateX(${-dir * e * 38}%) rotateY(${dir * e * 55}deg) scale(${1 - e * 0.12})`
    })
    bar.current?.style.setProperty('transform', `scaleX(${prog})`)
    const idx = Math.round(x)
    setActive((a) => (a === idx ? a : idx))
  }, 0, 1)

  if (!sala.length) return null
  const s = sala[Math.min(active, sala.length - 1)]
  return (
    <section className="sala" ref={ref} style={{ '--n': sala.length } as React.CSSProperties}>
      <div className="sala__pin">
        <div className="wrap sala__grid">
          <div className="sala__left">
            <span className="tag">La sala</span>
            <h2 className="sec__title">Recorre la sala sin salir de casa.</h2>
            <ol className="sala__list">
              {sala.map((x, k) => (
                <li key={x.slug} data-on={k === active ? '' : undefined}>
                  <span className="sala__cat">{x.p.brand}</span>
                  <span className="sala__nm">{x.p.name}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="sala__stage" ref={items}>
            <span className="sala__bg" aria-hidden="true" key={s.p.category}>{s.p.category.split(' ')[0]}</span>
            <div className="sala__floor" aria-hidden="true" />
            {sala.map((x) => (
              <div key={x.slug} className="sala__item">
                <img src={imageSrc(x.p.image)} alt={x.p.name} loading="lazy" draggable={false} />
              </div>
            ))}
          </div>
          <div className="sala__info" key={s.slug} aria-live="polite">
            <p className="sala__big display num">{s.big}{s.unit ? <small>{s.unit}</small> : null}</p>
            <p className="muted">{s.label}</p>
            <h3 className="sala__name">{s.p.brand} {s.p.name}</h3>
            <table className="spec sala__spec">
              <tbody>
                {Object.entries(s.p.specs).slice(0, 3).map(([k, v]) => (
                  <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="sala__buy">
              <span className="sala__price num">{s.p.price ? money(s.p.price) : 'Cotízala'}</span>
              <Link to={`/producto/${s.p.slug}`} className="btn">Ver ficha</Link>
            </div>
          </div>
        </div>
        <div className="wrap"><div className="sala__track"><div className="sala__bar" ref={bar} /></div></div>
      </div>
    </section>
  )
}

/* ---------------- Cinta de marcas ---------------- */

function Marquee() {
  return (
    <section className="mq" aria-label="Marcas que vendemos">
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

/* ---------------- Cifras (salen del catálogo real) ---------------- */

function Counters({ refs }: { refs: number }) {
  const { products } = useStore()
  const vehicles = products.filter((p) => ['Motos', 'Cuatrimotos y UTV', 'Vehículos'].includes(p.category)).length
  const brands = new Set(products.map((p) => p.brand)).size
  const COUNTERS = [
    { to: brands, s: '', l: 'marcas en un solo lugar' },
    { to: vehicles, s: '', l: 'modelos de motos, cuatrimotos y vehículos' },
    { to: refs, s: '+', l: 'referencias de ferretería con precio' },
    { to: 24, s: ' h', l: 'para responder una cotización' },
  ]
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

/* ---------------- Categorías ---------------- */

const CAT_IMG: Record<string, { image: string; cls: string }> = {
  motos: { image: 'vento-nitrox', cls: 'ct--wide' },
  cuatrimotos: { image: 'loncin-xwolf700', cls: 'ct--wide' },
  vehiculos: { image: 'corolla-par', cls: 'ct--wide' },
  plantas: { image: 'gd-75', cls: '' },
  'energia-solar': { image: 'panel550', cls: '' },
  ferreteria: { image: 'construy-cunete-importado', cls: 'ct--wide' },
}

function Categories() {
  const { products } = useStore()
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
        {CATEGORIES.map((c) => {
          const v = CAT_IMG[c.slug]
          const n = products.filter((p) => p.category === c.name).length
          return (
            <Link key={c.slug} to={`/catalogo/${c.slug}`} className={`ct ct--cut ${v?.cls ?? ''}`} onPointerMove={glow}>
              <div className="ct__txt">
                <h3>{c.name}</h3>
                <p>{n} productos</p>
                <span className="ct__buy">{c.slug === 'plantas' || c.slug === 'vehiculos' ? 'Cotizar' : 'Comprar'} →</span>
              </div>
              <span className="ct__go" aria-hidden="true"><Icon name="arrowRight" size={18} /></span>
              {v ? <img className="ct__img" src={imageSrc(v.image)} alt="" loading="lazy" /> : null}
            </Link>
          )
        })}
      </div>
    </section>
  )
}

/* Fotos que ya salen arriba en el inicio: las secciones de abajo no las repiten. */
const USED_ABOVE = new Set<string>([
  ...HERO_LAYERS.map((l) => l.image),
  ...Object.values(CAT_IMG).map((c) => c.image),
])

/* ---------------- Destacados (riel con física) ---------------- */

function Featured() {
  const { products, bySlug } = useStore()
  const list = useMemo(() => {
    const used = new Set(USED_ABOVE)
    SALA_DEF.forEach((s) => { const p = bySlug.get(s.slug); if (p) used.add(p.image) })
    const pool = products.filter((p) => p.image && p.category !== 'Ferretería' && !used.has(p.image))
    return [...pool.filter((p) => p.featured), ...pool.filter((p) => !p.featured)].slice(0, 10)
  }, [products, bySlug])
  const { ref: rail, step } = useFluidRail<HTMLDivElement>()
  return (
    <section className="sec">
      <div className="wrap sec__head sec__head--row" data-rv>
        <div style={{ display: 'grid', gap: 12 }}>
          <span className="tag">Destacados</span>
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
        {list.map((p) => (
          <div className="rail__item" key={p.id}>
            <Tilt><ProductCard product={p} /></Tilt>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ---------------- Ferretería: tres marcas ---------------- */

function Hardware({ refs }: { refs: number }) {
  const { products } = useStore()
  const pick = (brand: string, n: number) => {
    // una por sección, para que las tres fotos sean distintas entre sí
    const seen = new Set<string | undefined>()
    return products.filter((p) => {
      if (p.brand !== brand || !p.image || USED_ABOVE.has(p.image) || seen.has(p.sub + p.name.split(' ')[0])) return false
      seen.add(p.sub + p.name.split(' ')[0])
      return true
    }).filter((p, i, arr) => arr.findIndex((q) => q.sub === p.sub) === i || brand === 'ConstruY').slice(0, n)
  }
  const cols = [
    { brand: 'Tolsen', text: 'Herramientas manuales, eléctricas, inalámbricas, de medición, jardín y más.', items: pick('Tolsen', 3) },
    { brand: 'Nexon', text: 'Mallas, alambre, pintura, cerrajería, electrodos y electricidad.', items: pick('Nexon', 3) },
    { brand: 'ConstruY', text: 'Pintura de caucho y esmalte Clase A, en cuñete y galón.', items: pick('ConstruY', 3) },
  ]
  return (
    <section className="sec wrap">
      <div className="sec__head sec__head--row" data-rv>
        <div style={{ display: 'grid', gap: 12 }}>
          <span className="tag">Ferretería</span>
          <h2 className="sec__title">La obra completa, con precio a la vista.</h2>
          <p className="sec__lead">{refs.toLocaleString('es-VE')} referencias de Tolsen, Nexon y ConstruY. Busca por nombre o por código del catálogo.</p>
        </div>
        <Link to="/ferreteria/referencias" className="btn btn--sm">Buscar referencia</Link>
      </div>
      <div className="hw" data-rv>
        {cols.map((c) => (
          <div className="hw__col" key={c.brand}>
            <div className="hw__head">
              <h3>{c.brand}</h3>
              <p className="muted">{c.text}</p>
            </div>
            <ul className="hw__list">
              {c.items.map((p) => (
                <li key={p.id}>
                  <Link to={`/producto/${p.slug}`}>
                    <ProductShot product={p} />
                    <span><strong>{p.name}</strong><small className="muted">{p.price ? money(p.price) : p.highlight}</small></span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link className="link" to="/catalogo/ferreteria">Ver todo {c.brand}</Link>
          </div>
        ))}
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
          <img src={showroom} alt="Nissan Sentra en la sala de exhibición" loading="lazy" />
          <div><h3>Ven a verlo en persona</h3><p>Vehículos en exhibición, listos para prueba y entrega con papeles al día.</p></div>
        </div>
        <div className="bti" onPointerMove={glow}><span className="ib"><Icon name="shield" size={24} /></span><h3>Póliza incluida</h3><p>Todas las motos Vento salen aseguradas.</p></div>
        <div className="bti bti--gr" onPointerMove={glow}><b className="display">3 años</b><p>De garantía en pickups ZX Auto, o 100.000 km</p></div>
        <div className="bti" onPointerMove={glow}><span className="ib"><Icon name="truck" size={24} /></span><h3>Entrega coordinada</h3><p>A todo el país, con seguimiento.</p></div>
        <div className="bti" onPointerMove={glow}><span className="ib"><Icon name="card" size={24} /></span><h3>Paga como quieras</h3><p>Zelle, pago móvil, transferencia o efectivo.</p></div>
        <div className="bti bti--wd" onPointerMove={glow}><span className="ib"><Icon name="bolt" size={24} /></span><h3>Energía sin cortes</h3><p>Plantas Hyundai GD Power de 25 a 1000 kVA, Cummins residenciales y energía solar Greenenergy con instalación.</p></div>
        <div className="bti bti--wd" onPointerMove={glow}><span className="ib"><Icon name="users" size={24} /></span><h3>Un asesor que te conoce</h3><p>Te atiende la misma persona por WhatsApp, por teléfono y en la tienda.</p></div>
      </div>
    </section>
  )
}

/* ---------------- Herramientas: planta y cuotas ---------------- */

const LOADS = [
  { id: 'casa', label: 'Casa: luces, nevera y TV', w: 1500 },
  { id: 'bomba', label: 'Bomba de agua', w: 1100 },
  { id: 'aire1', label: 'Un aire acondicionado', w: 1800 },
  { id: 'aire3', label: 'Tres o más aires', w: 6000 },
  { id: 'local', label: 'Local comercial', w: 12000 },
  { id: 'edificio', label: 'Edificio o conjunto', w: 40000 },
  { id: 'industria', label: 'Industria o galpón', w: 70000 },
]
const GENS: { max: number; slug: string }[] = [
  { max: 11000, slug: 'cummins-generador-residencial-con-transferencia-automatica' },
  { max: 20000, slug: 'hyundai-gd-power-generador-25-kva-monofasico' },
  { max: 26000, slug: 'hyundai-gd-power-generador-33-kva-trifasico' },
  { max: 40000, slug: 'hyundai-gd-power-generador-50-kva' },
  { max: 60000, slug: 'hyundai-gd-power-generador-75-kva' },
  { max: 80000, slug: 'hyundai-gd-power-generador-100-kva' },
  { max: Infinity, slug: 'hyundai-gd-power-generador-1000-kva' },
]

function PowerPlanner() {
  const { bySlug } = useStore()
  const [on, setOn] = useState<Set<string>>(() => new Set(['casa', 'bomba', 'aire1']))
  const watts = LOADS.reduce((s, l) => (on.has(l.id) ? s + l.w : s), 0)
  const need = watts * 1.25
  const rec = GENS.map((g) => (need <= g.max ? bySlug.get(g.slug) : undefined)).find(Boolean)
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
        <p className="sec__lead">Marca lo que quieres mantener encendido durante un corte y te decimos qué equipo te sirve.</p>
        <div className="planner__loads" role="group" aria-label="Equipos a conectar">
          {LOADS.map((l) => (
            <button key={l.id} className="seg__opt" aria-pressed={on.has(l.id)} onClick={() => toggle(l.id)}>{l.label}</button>
          ))}
        </div>
      </div>
      <div className="planner__a" aria-live="polite">
        <p className="planner__watts num"><span>{(watts / 1000).toLocaleString('es-VE', { maximumFractionDigits: 1 })}</span> kW</p>
        <p className="muted">Consumo estimado, más 25 % de margen para el arranque.</p>
        <hr className="rule" />
        {rec ? (
          <>
            <div className="planner__rec">
              <div>
                <p className="muted">Te recomendamos</p>
                <h3 className="planner__name">{rec.brand} {rec.name}</h3>
                <p className="muted">{rec.highlight}</p>
              </div>
            </div>
            <div className="planner__actions">
              <Link to={`/producto/${rec.slug}`} className="btn">Ver la planta</Link>
              <Link to="/energia" className="btn btn--line">Cotizar con instalación</Link>
            </div>
          </>
        ) : (
          <p className="muted">Marca al menos un equipo.</p>
        )}
        <p className="planner__note">Valores orientativos. Un técnico confirma la carga antes de instalar.</p>
      </div>
    </div>
  )
}

const TERMS = [6, 12, 24, 36]

function FinanceHome() {
  const { products } = useStore()
  const options = useMemo(() => products.filter((p) => ['Motos', 'Cuatrimotos y UTV', 'Vehículos'].includes(p.category)), [products])
  const [id, setId] = useState(() => options.find((p) => p.slug === 'zx-auto-terralord')?.id ?? options[0]?.id)
  const p = options.find((x) => x.id === id) ?? options[0]
  const [value, setValue] = useState(p?.price ?? 15000)
  const [down, setDown] = useState(30)
  const [months, setMonths] = useState(12)
  if (!p) return null
  const fee = (value * (1 - down / 100)) / months
  return (
    <div className="fin">
      <div className="fin__q">
        <h3 className="tool__title">Estrena hoy, paga en cuotas.</h3>
        <p className="sec__lead">Elige tu moto o vehículo, indica su valor, mueve la inicial y el plazo, y mira tu cuota al instante.</p>
        <label className="field">
          <span className="field__label">Quiero financiar</span>
          <select className="input" value={p.id} onChange={(e) => { const n = options.find((x) => x.id === +e.target.value); setId(+e.target.value); if (n?.price) setValue(n.price) }}>
            {options.map((f) => <option key={f.id} value={f.id}>{f.brand} {f.name}</option>)}
          </select>
        </label>
        <label className="field">
          <span className="finance__row"><span className="field__label">Valor del vehículo</span><strong className="num">{money(value)}</strong></span>
          <input type="range" min={1000} max={60000} step={500} value={value} onChange={(e) => setValue(+e.target.value)} />
          <span className="field__hint">{p.price ? 'Precio publicado.' : 'Ajústalo con el precio que te dio tu asesor.'}</span>
        </label>
        <label className="field">
          <span className="finance__row"><span className="field__label">Inicial</span><strong className="num">{down} % ({money((value * down) / 100)})</strong></span>
          <input type="range" min={20} max={70} step={5} value={down} onChange={(e) => setDown(+e.target.value)} />
        </label>
        <div className="field">
          <span className="field__label">Plazo</span>
          <div className="seg" role="group" aria-label="Plazo en meses">
            {TERMS.map((t) => <button key={t} className="seg__opt" aria-pressed={months === t} onClick={() => setMonths(t)}>{t} meses</button>)}
          </div>
        </div>
      </div>
      <div className="fin__a" aria-live="polite">
        <p className="muted">Tu cuota mensual</p>
        <p className="fin__fee num display">{money(fee)}</p>
        <p className="muted">durante {months} meses, después de una inicial de {money((value * down) / 100)}.</p>
        <div className="planner__actions">
          <Link to={`/producto/${p.slug}`} className="btn">Ver {p.brand}</Link>
          <Link to="/contacto" className="btn btn--line">Solicitar crédito</Link>
        </div>
        <p className="planner__note">Simulación sin intereses, sujeta a aprobación.</p>
      </div>
    </div>
  )
}

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
            <button role="tab" className="seg__opt" aria-selected={tab === 'planta'} aria-pressed={tab === 'planta'} onClick={() => setTab('planta')}><Icon name="bolt" size={16} /> Calcular mi planta</button>
            <button role="tab" className="seg__opt" aria-selected={tab === 'cuotas'} aria-pressed={tab === 'cuotas'} onClick={() => setTab('cuotas')}><Icon name="card" size={16} /> Simular cuotas</button>
          </div>
        </div>
        <div className="tools__body" key={tab} role="tabpanel">{tab === 'planta' ? <PowerPlanner /> : <FinanceHome />}</div>
      </div>
    </section>
  )
}

/* ---------------- Cómo funciona ---------------- */

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
      <div className="how__cta">
        <Magnetic><Link className="btn btn--lg" to="/catalogo">Empezar a comprar</Link></Magnetic>
        <Link className="btn btn--line btn--lg" to="/seguimiento">Seguir mi pedido</Link>
      </div>
    </section>
  )
}

/* ---------------- Promesas de compra (debajo de las cifras) ---------------- */

const PROMISES: { icon: IconName; t: string; d: string }[] = [
  { icon: 'truck', t: 'Envíos a todo el país', d: 'Retiro gratis en Lechería, entrega local o encomienda nacional.' },
  { icon: 'card', t: 'Pago sin riesgos', d: 'No cobramos en la web. Instrucciones verificadas y pedido reservado 48 h.' },
  { icon: 'shield', t: 'Garantía de fábrica', d: 'En todo el catálogo, con factura a tu nombre.' },
  { icon: 'chat', t: 'Un asesor real', d: 'Por WhatsApp, antes, durante y después de tu compra.' },
]

function Promises() {
  return (
    <section className="wrap prm" aria-label="Por qué comprar en ARIA">
      {PROMISES.map((p) => (
        <div key={p.t} data-rv>
          <Icon name={p.icon} size={22} />
          <strong>{p.t}</strong>
          <span className="muted">{p.d}</span>
        </div>
      ))}
    </section>
  )
}

/* ---------------- Comparación: comprar en ARIA o por tu cuenta ---------------- */

const CMP = [
  { k: 'Precio', a: 'Publicado en la web o cotizado por escrito en 24 horas.', b: 'Cambia en cada conversación.' },
  { k: 'Pago', a: 'Instrucciones verificadas y tu pedido reservado mientras confirmamos.', b: 'Transfieres a alguien que no conoces.' },
  { k: 'Factura y garantía', a: 'Factura a tu nombre y garantía de fábrica.', b: 'Sin factura, no hay a quién reclamar.' },
  { k: 'Seguimiento', a: 'Número de pedido y estado en línea en cada paso.', b: 'Preguntar y esperar respuesta.' },
  { k: 'Entrega', a: 'Retiro, entrega local o envío nacional coordinado.', b: 'Te toca resolver el traslado.' },
]

function Compare() {
  return (
    <section className="sec wrap">
      <div className="center-head" data-rv>
        <span className="tag">Por qué ARIA</span>
        <h2 className="sec__title">La diferencia entre comprar y arriesgar.</h2>
      </div>
      <div className="cmp" data-rv role="table" aria-label="Comprar en ARIA comparado con comprar por tu cuenta">
        <div className="cmp__row cmp__row--head" role="row">
          <span role="columnheader" />
          <span role="columnheader" className="cmp__aria">Comprar en ARIA</span>
          <span role="columnheader">Comprar por tu cuenta</span>
        </div>
        {CMP.map((r) => (
          <div key={r.k} className="cmp__row" role="row">
            <span role="rowheader" className="cmp__k">{r.k}</span>
            <span role="cell" className="cmp__aria"><Icon name="check" size={18} />{r.a}</span>
            <span role="cell" className="muted"><Icon name="minus" size={18} />{r.b}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ---------------- Marcas ---------------- */

function BrandWall() {
  const { products } = useStore()
  const counts = useMemo(() => {
    const m = new Map<string, number>()
    for (const p of products) m.set(p.brand, (m.get(p.brand) ?? 0) + 1)
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }, [products])
  return (
    <section className="sec wrap">
      <div className="center-head" data-rv>
        <span className="tag">Marcas</span>
        <h2 className="sec__title">Las marcas que vendemos.</h2>
      </div>
      <ul className="bw" data-rv>
        {counts.map(([b, n]) => (
          <li key={b}>
            <Link to={`/catalogo?marca=${encodeURIComponent(b)}`} onPointerMove={glow}>
              <strong>{b}</strong>
              <span className="muted">{n} {n === 1 ? 'producto' : 'productos'}</span>
            </Link>
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
      <div className="alc" data-rv onPointerMove={glow}>
        <div className="alc__txt">
          <h2 className="sec__title">¿Compras para una empresa, una flota o una obra?</h2>
          <p>Te armamos una sola propuesta con precio por volumen, una factura y un asesor dedicado. Si compras seguido, postúlate como aliado.</p>
          <div className="alc__btns">
            <Magnetic><Link className="btn btn--white btn--lg" to="/empresas">Pedir propuesta</Link></Magnetic>
            <Link className="btn btn--ghost-white btn--lg" to="/aliados">Ser aliado</Link>
          </div>
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

/* ---------------- Visita y preguntas ---------------- */

function Visit() {
  const { site } = useStore()
  return (
    <section className="sec wrap">
      <div className="visit" data-rv>
        <div className="visit__text">
          <h2 className="sec__title">Ven a verlo en persona.</h2>
          <p className="sec__lead">Agenda una cita y te tenemos el producto listo para que lo pruebes.</p>
          <ul className="visit__info">
            <li><Icon name="pin" /> {site.city}</li>
            <li><Icon name="clock" /> {site.hours}</li>
            <li><Icon name="phone" /> {site.phone}</li>
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
          <div className="hs__cta" style={{ justifyContent: 'flex-start', opacity: 1, animation: 'none', marginTop: 0 }}>
            <Link to="/contacto" className="btn">Agendar cita</Link>
            <a className="btn btn--line" href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer"><Icon name="chat" size={18} /> WhatsApp</a>
          </div>
        </div>
        <img className="visit__photo" src={trunk} alt="Nissan Sentra blanco en la sala de exhibición de ARIA" loading="lazy" />
      </div>
    </section>
  )
}

function Faq() {
  return (
    <section className="sec wrap faqsec" data-rv>
      <h2 className="sec__title">Preguntas frecuentes.</h2>
      <div>
        {FAQ.filter((_, i) => [0, 1, 3, 5, 8, 11].includes(i)).map((f) => (
          <details key={f.q} className="faq">
            <summary>{f.q}<Icon name="plus" /></summary>
            <p>{f.a}</p>
          </details>
        ))}
        <Link className="link" to="/preguntas" style={{ marginTop: 20 }}>Ver todas las preguntas</Link>
      </div>
    </section>
  )
}

function Closing() {
  return (
    <section className="closing wrap">
      <h2 className="closing__title display" data-rv>Tu próxima moto ya está en Lechería.</h2>
      <div className="closing__row">
        <p className="sec__lead">Ven a verla, pruébala y llévatela con factura y garantía. O pídela desde aquí y te la llevamos.</p>
        <div className="hs__cta" style={{ opacity: 1, animation: 'none' }}>
          <Link to="/catalogo/motos" className="btn">Ver motos</Link>
          <Link to="/contacto" className="btn btn--line">Agendar visita</Link>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Página ---------------- */

export default function Home() {
  const refs = (refsInfo as { count: number }).count
  return (
    <>
      <HeroStudio />
      <Marquee />
      <Sala />
      <section className="sec wrap lit-wrap">
        <LitText text="Somos ARIA. Reunimos motos, cuatrimotos, vehículos, plantas eléctricas, energía solar y ferretería de marcas reconocidas para que muevas tu vida e ilumines tu negocio, con garantía real y una atención que te conoce por tu nombre." />
      </section>
      <Counters refs={refs} />
      <Promises />
      <Categories />
      <Featured />
      <Hardware refs={refs} />
      <Bento />
      <Tools />
      <HowItWorks />
      <Compare />
      <BrandWall />
      <AlliesCta />
      <Visit />
      <Faq />
      <Closing />
    </>
  )
}

