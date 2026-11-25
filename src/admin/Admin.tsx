// Panel de administración de ARIA.
// Todo lo que se guarda aquí se refleja de inmediato en la web (mismo almacén).
// Hoy vive en este navegador; para varios administradores hace falta conectar un backend.
import { useDeferredValue, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { Icon, type IconName } from '../components/Icon'
import { Logo } from '../components/Logo'
import { CATEGORIES, fromPrice, imageSrc, money, priceLabel, type Category, type Product, type Variant } from '../data/products'
import { useCart, type Invoice } from '../state/cart'
import { useStore, type AllyRequest, type OrderStatus } from '../state/store'
import './admin.css'

const SESSION = 'aria:admin:session'
const DEMO = { email: 'admin@aria.com', pass: 'aria2026' }

/* ------------------------------------------------------------------ acceso */

function Login({ onOk }: { onOk: () => void }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  return (
    <div className="adm-login">
      <div className="adm-login__side">
        <Logo size="lg" />
        <h1 className="display">Panel de ARIA</h1>
        <p>Carga productos, actualiza precios y revisa pedidos, cotizaciones y aliados. Los cambios se ven al instante en la web.</p>
      </div>
      <form
        className="adm-login__form"
        onSubmit={(e) => {
          e.preventDefault()
          if (email.trim().toLowerCase() === DEMO.email && pass === DEMO.pass) {
            try { sessionStorage.setItem(SESSION, '1') } catch { /* sin almacenamiento */ }
            onOk()
          } else setErr('Correo o contraseña incorrectos.')
        }}
      >
        <h2>Iniciar sesión</h2>
        <label className="field"><span className="field__label">Correo</span><input className="input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label className="field"><span className="field__label">Contraseña</span><input className="input" type="password" autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} /></label>
        {err ? <p className="field__error" role="alert">{err}</p> : null}
        <button className="btn btn--block" type="submit">Entrar</button>
        <p className="field__hint">Acceso de demostración: {DEMO.email} / {DEMO.pass}. En producción se reemplaza por usuarios reales.</p>
        <Link className="link" to="/">Volver a la web</Link>
      </form>
    </div>
  )
}

/* ------------------------------------------------------------------ marco */

const NAV: { to: string; label: string; icon: IconName }[] = [
  { to: '/admin', label: 'Resumen', icon: 'tag' },
  { to: '/admin/productos', label: 'Productos', icon: 'cart' },
  { to: '/admin/pedidos', label: 'Pedidos', icon: 'doc' },
  { to: '/admin/aliados', label: 'Aliados', icon: 'users' },
  { to: '/admin/contenido', label: 'Contenido', icon: 'wrench' },
]

export default function Admin() {
  const [ok, setOk] = useState(() => {
    try { return sessionStorage.getItem(SESSION) === '1' } catch { return false }
  })
  const nav = useNavigate()
  if (!ok) return <Login onOk={() => setOk(true)} />
  return (
    <div className="adm">
      <aside className="adm__side">
        <Link to="/admin" className="adm__logo"><Logo /></Link>
        <nav className="adm__nav" aria-label="Panel">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/admin'} className="adm__link">
              <Icon name={n.icon} size={19} /> <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="adm__foot">
          <Link className="adm__link" to="/" target="_blank"><Icon name="arrowRight" size={19} /> <span>Ver la web</span></Link>
          <button className="adm__link" onClick={() => { try { sessionStorage.removeItem(SESSION) } catch { /* nada */ } setOk(false); nav('/admin') }}>
            <Icon name="close" size={19} /> <span>Salir</span>
          </button>
        </div>
      </aside>
      <main className="adm__main">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="productos" element={<Products />} />
          <Route path="pedidos" element={<Orders />} />
          <Route path="aliados" element={<Allies />} />
          <Route path="contenido" element={<Content />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function Head({ title, lead, children }: { title: string; lead?: string; children?: React.ReactNode }) {
  return (
    <header className="adm-head">
      <div>
        <h1 className="display">{title}</h1>
        {lead ? <p className="muted">{lead}</p> : null}
      </div>
      {children ? <div className="adm-head__act">{children}</div> : null}
    </header>
  )
}

/* ------------------------------------------------------------------ resumen */

function Dashboard() {
  const { allProducts, data } = useStore()
  const { invoices } = useCart()
  const facturas = invoices.filter((i) => i.kind === 'Factura')
  const cotiz = invoices.filter((i) => i.kind === 'Cotización')
  const ventas = facturas.filter((f) => data.orderStatus[f.number] !== 'Cancelado').reduce((s, f) => s + f.total, 0)
  const byCat = CATEGORIES.map((c) => ({ c: c.name, n: allProducts.filter((p) => p.category === c.name).length }))
  const max = Math.max(...byCat.map((x) => x.n), 1)
  const pendientesAliados = data.allies.filter((a) => a.status === 'Nueva').length
  const sinPrecio = allProducts.filter((p) => fromPrice(p) === null).length

  return (
    <>
      <Head title="Resumen" lead="Lo más importante de la tienda, de un vistazo." />
      <div className="kpis">
        <Kpi label="Ventas facturadas" value={money(ventas)} hint={`${facturas.length} facturas`} strong />
        <Kpi label="Cotizaciones" value={String(cotiz.length)} hint="Solicitadas desde la web" />
        <Kpi label="Productos" value={allProducts.length.toLocaleString('es-VE')} hint={`${allProducts.filter((p) => p.hidden).length} ocultos`} />
        <Kpi label="Aliados por revisar" value={String(pendientesAliados)} hint={`${data.allies.length} solicitudes en total`} />
      </div>
      <div className="adm-grid">
        <section className="card">
          <h2 className="card__t">Productos por categoría</h2>
          <ul className="bars">
            {byCat.map((x) => (
              <li key={x.c}>
                <span className="bars__l">{x.c}</span>
                <span className="bars__track"><span className="bars__fill" style={{ width: `${(x.n / max) * 100}%` }} /></span>
                <span className="bars__v num">{x.n}</span>
              </li>
            ))}
          </ul>
          {sinPrecio ? <p className="field__hint" style={{ marginTop: 14 }}>{sinPrecio} productos se muestran con “Precio a consultar”. Agrega precio desde Productos cuando lo tengas.</p> : null}
        </section>
        <section className="card">
          <div className="card__row"><h2 className="card__t">Últimos documentos</h2><Link className="link" to="/admin/pedidos">Ver todos</Link></div>
          {invoices.length ? (
            <ul className="mini">
              {invoices.slice(0, 6).map((i) => (
                <li key={i.number}>
                  <span><strong>{i.number}</strong><small className="muted">{i.customer.name}</small></span>
                  <span className="num">{money(i.total)}</span>
                  <StatusPill s={i.kind === 'Factura' ? data.orderStatus[i.number] ?? 'Pendiente' : 'Cotización'} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Aún no hay pedidos. Cuando alguien genere una factura o una cotización en la web, aparecerá aquí.</p>
          )}
        </section>
      </div>
    </>
  )
}

function Kpi({ label, value, hint, strong }: { label: string; value: string; hint: string; strong?: boolean }) {
  return (
    <div className={`kpi${strong ? ' kpi--strong' : ''}`}>
      <span className="kpi__l">{label}</span>
      <b className="kpi__v num">{value}</b>
      <span className="kpi__h">{hint}</span>
    </div>
  )
}

function StatusPill({ s }: { s: string }) {
  const cls = s === 'Pagado' || s === 'Entregado' || s === 'Aprobada' ? 'pill--ok' : s === 'Cancelado' || s === 'Rechazada' ? 'pill--off' : 'pill--wait'
  return <span className={`pill ${cls}`}>{s}</span>
}

/* ------------------------------------------------------------------ productos */

const EMPTY_PRODUCT = (): Product => ({
  id: Date.now(),
  slug: '',
  category: 'Motos',
  brand: '',
  name: '',
  price: null,
  image: '',
  condition: 'Nuevo',
  highlight: '',
  description: '',
  specs: {},
  stock: 1,
})

const slugify = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

function Products() {
  const { allProducts, saveProduct, deleteProduct, restoreProduct } = useStore()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<'Todas' | Category>('Todas')
  const [editing, setEditing] = useState<Product | null>(null)
  const [undo, setUndo] = useState<Product | null>(null)
  const [limit, setLimit] = useState(40)
  const dq = useDeferredValue(norm(q))
  const list = useMemo(
    () => allProducts.filter((p) => (cat === 'Todas' || p.category === cat) && (!dq || norm(`${p.name} ${p.brand} ${p.sub ?? ''} ${p.variants?.map((v) => v.code).join(' ') ?? ''}`).includes(dq))),
    [allProducts, cat, dq],
  )
  const undoTimer = useRef(0)

  return (
    <>
      <Head title="Productos" lead={`${allProducts.length.toLocaleString('es-VE')} productos. Lo que cargues aquí aparece de inmediato en la web.`}>
        <button className="btn" onClick={() => setEditing(EMPTY_PRODUCT())}><Icon name="plus" size={18} /> Nuevo producto</button>
      </Head>
      <div className="adm-tools">
        <label className="cat__search">
          <span className="vh">Buscar</span>
          <Icon name="search" size={18} />
          <input className="input" type="search" placeholder="Buscar por nombre, marca o código" value={q} onChange={(e) => { setQ(e.target.value); setLimit(40) }} />
        </label>
        <div className="seg adm-tools__seg" role="group" aria-label="Categoría">
          {(['Todas', ...CATEGORIES.map((c) => c.name)] as const).map((c) => (
            <button key={c} className="seg__opt seg__opt--sm" aria-pressed={cat === c} onClick={() => { setCat(c); setLimit(40) }}>{c}</button>
          ))}
        </div>
      </div>
      <div className="card card--flush">
        <div className="scrollx">
          <table className="ptable">
            <thead>
              <tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Inventario</th><th>Visible</th><th><span className="vh">Acciones</span></th></tr>
            </thead>
            <tbody>
              {list.slice(0, limit).map((p) => (
                <tr key={p.id} className={p.hidden ? 'is-hidden' : ''}>
                  <td>
                    <button className="ptable__p" onClick={() => setEditing(p)}>
                      <span className="ptable__img">{imageSrc(p.image) ? <img src={imageSrc(p.image)} alt="" loading="lazy" /> : null}</span>
                      <span><strong>{p.name}</strong><small className="muted">{p.brand}{p.sub ? `, ${p.sub}` : ''}</small></span>
                    </button>
                  </td>
                  <td>{p.category}</td>
                  <td className="num">{priceLabel(p)}</td>
                  <td className="num">{p.stock ?? '—'}</td>
                  <td>
                    <label className="switch">
                      <input type="checkbox" checked={!p.hidden} onChange={(e) => saveProduct({ ...p, hidden: !e.target.checked })} aria-label={`Mostrar ${p.name} en la web`} />
                      <span />
                    </label>
                  </td>
                  <td className="ptable__act">
                    <button className="iconbtn" aria-label={`Editar ${p.name}`} onClick={() => setEditing(p)}><Icon name="wrench" size={17} /></button>
                    <button
                      className="iconbtn"
                      aria-label={`Eliminar ${p.name}`}
                      onClick={() => {
                        deleteProduct(p.id)
                        setUndo(p)
                        window.clearTimeout(undoTimer.current)
                        undoTimer.current = window.setTimeout(() => setUndo(null), 6000)
                      }}
                    >
                      <Icon name="close" size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {list.length > limit ? (
          <div className="card__more"><button className="btn btn--line btn--sm" onClick={() => setLimit((l) => l + 80)}>Ver más ({list.length - limit})</button></div>
        ) : null}
        {!list.length ? <p className="muted" style={{ padding: 24 }}>Ningún producto coincide con la búsqueda.</p> : null}
      </div>

      {undo ? (
        <div className="undo" role="status">
          <span>Eliminaste {undo.name}.</span>
          <button className="btn btn--sm btn--white" onClick={() => { restoreProduct(undo.id); setUndo(null) }}>Deshacer</button>
        </div>
      ) : null}

      {editing ? (
        <Editor
          product={editing}
          onClose={() => setEditing(null)}
          onSave={(p) => {
            saveProduct({ ...p, slug: p.slug || `${slugify(p.brand)}-${slugify(p.name)}-${String(p.id).slice(-4)}` })
            setEditing(null)
          }}
        />
      ) : null}
    </>
  )
}

/** Reduce la foto en el navegador antes de guardarla (máx. 900 px, WebP) */
function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onerror = () => reject(r.error)
    r.onload = () => {
      const img = new Image()
      img.onload = () => {
        const s = Math.min(1, 900 / Math.max(img.width, img.height))
        const c = document.createElement('canvas')
        c.width = Math.round(img.width * s)
        c.height = Math.round(img.height * s)
        c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
        resolve(c.toDataURL('image/webp', 0.86))
      }
      img.onerror = () => reject(new Error('imagen'))
      img.src = r.result as string
    }
    r.readAsDataURL(file)
  })
}

function Editor({ product, onClose, onSave }: { product: Product; onClose: () => void; onSave: (p: Product) => void }) {
  const [p, setP] = useState<Product>(product)
  const [specs, setSpecs] = useState(() => Object.entries(product.specs).map(([k, v]) => ({ k, v })))
  const [variants, setVariants] = useState<Variant[]>(product.variants ?? [])
  const [tried, setTried] = useState(false)
  const [imgErr, setImgErr] = useState('')
  const isNew = !product.name
  const errs = { name: p.name.trim() ? '' : 'Escribe el nombre.', brand: p.brand.trim() ? '' : 'Escribe la marca.' }
  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((x) => ({ ...x, [k]: v }))

  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="ed-t" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <button className="sheet__scrim" aria-label="Cerrar" onClick={onClose} />
      <form
        className="sheet__panel"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          setTried(true)
          if (errs.name || errs.brand) return
          onSave({
            ...p,
            specs: Object.fromEntries(specs.filter((s) => s.k.trim()).map((s) => [s.k.trim(), s.v.trim()])),
            variants: variants.filter((v) => v.code.trim()).length ? variants.filter((v) => v.code.trim()) : undefined,
          })
        }}
      >
        <header className="sheet__head">
          <h2 id="ed-t">{isNew ? 'Nuevo producto' : 'Editar producto'}</h2>
          <button type="button" className="iconbtn" aria-label="Cerrar" onClick={onClose}><Icon name="close" size={18} /></button>
        </header>
        <div className="sheet__body">
          <div className="ed-img">
            <div className="ed-img__prev">{imageSrc(p.image) ? <img src={imageSrc(p.image)} alt="" /> : <Icon name="upload" size={28} />}</div>
            <div className="ed-img__act">
              <label className="btn btn--line btn--sm">
                <Icon name="upload" size={16} /> {p.image ? 'Cambiar foto' : 'Subir foto'}
                <input
                  type="file"
                  accept="image/*"
                  className="vh"
                  onChange={async (e) => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    try {
                      set('image', await readImage(f))
                      setImgErr('')
                    } catch {
                      setImgErr('No pudimos leer la imagen. Prueba con JPG o PNG.')
                    }
                  }}
                />
              </label>
              <p className="field__hint">Mejor con fondo blanco o sin fondo. Se reduce sola a 900 px.</p>
              {imgErr ? <p className="field__error">{imgErr}</p> : null}
            </div>
          </div>
          <div className="form__row">
            <label className="field"><span className="field__label">Nombre</span><input className="input" value={p.name} onChange={(e) => set('name', e.target.value)} aria-invalid={tried && !!errs.name} />{tried && errs.name ? <span className="field__error">{errs.name}</span> : null}</label>
            <label className="field"><span className="field__label">Marca</span><input className="input" value={p.brand} onChange={(e) => set('brand', e.target.value)} aria-invalid={tried && !!errs.brand} />{tried && errs.brand ? <span className="field__error">{errs.brand}</span> : null}</label>
          </div>
          <div className="form__row">
            <label className="field">
              <span className="field__label">Categoría</span>
              <select className="input" value={p.category} onChange={(e) => set('category', e.target.value as Category)}>
                {CATEGORIES.map((c) => <option key={c.slug}>{c.name}</option>)}
              </select>
            </label>
            <label className="field"><span className="field__label">Subcategoría (opcional)</span><input className="input" value={p.sub ?? ''} onChange={(e) => set('sub', e.target.value || undefined)} placeholder="Ej.: Scooters eléctricos" /></label>
          </div>
          <div className="form__row">
            <label className="field">
              <span className="field__label">Precio en US$</span>
              <input className="input" type="number" min={0} step="0.01" inputMode="decimal" value={p.price ?? ''} onChange={(e) => set('price', e.target.value === '' ? null : Number(e.target.value))} placeholder="Vacío = a consultar" />
            </label>
            <label className="field"><span className="field__label">Inventario</span><input className="input" type="number" min={0} value={p.stock ?? ''} onChange={(e) => set('stock', e.target.value === '' ? undefined : Number(e.target.value))} /></label>
          </div>
          <div className="form__row">
            <label className="field">
              <span className="field__label">Estado</span>
              <select className="input" value={p.condition} onChange={(e) => set('condition', e.target.value as Product['condition'])}><option>Nuevo</option><option>Usado</option></select>
            </label>
            <label className="field"><span className="field__label">Alquiler por día US$ (plantas)</span><input className="input" type="number" min={0} value={p.rentPerDay ?? ''} onChange={(e) => set('rentPerDay', e.target.value === '' ? null : Number(e.target.value))} /></label>
          </div>
          <label className="field"><span className="field__label">Frase destacada</span><input className="input" value={p.highlight} onChange={(e) => set('highlight', e.target.value)} placeholder="Ej.: 300 cc, 25 HP" /></label>
          <label className="field"><span className="field__label">Descripción</span><textarea className="input" value={p.description} onChange={(e) => set('description', e.target.value)} /></label>

          <fieldset className="ed-list">
            <legend className="field__label">Ficha técnica</legend>
            {specs.map((s, i) => (
              <div className="ed-list__row" key={i}>
                <input className="input" placeholder="Dato (ej.: Cilindraje)" value={s.k} onChange={(e) => setSpecs((x) => x.map((y, j) => (j === i ? { ...y, k: e.target.value } : y)))} aria-label="Dato" />
                <input className="input" placeholder="Valor (ej.: 300 cc)" value={s.v} onChange={(e) => setSpecs((x) => x.map((y, j) => (j === i ? { ...y, v: e.target.value } : y)))} aria-label="Valor" />
                <button type="button" className="iconbtn" aria-label="Quitar dato" onClick={() => setSpecs((x) => x.filter((_, j) => j !== i))}><Icon name="minus" size={16} /></button>
              </div>
            ))}
            <button type="button" className="btn btn--line btn--sm" onClick={() => setSpecs((x) => [...x, { k: '', v: '' }])}><Icon name="plus" size={16} /> Agregar dato</button>
          </fieldset>

          <fieldset className="ed-list">
            <legend className="field__label">Medidas o versiones (opcional)</legend>
            {variants.map((v, i) => (
              <div className="ed-list__row ed-list__row--3" key={i}>
                <input className="input" placeholder="Código" value={v.code} onChange={(e) => setVariants((x) => x.map((y, j) => (j === i ? { ...y, code: e.target.value } : y)))} aria-label="Código" />
                <input className="input" placeholder="Medida" value={v.size} onChange={(e) => setVariants((x) => x.map((y, j) => (j === i ? { ...y, size: e.target.value } : y)))} aria-label="Medida" />
                <input className="input" type="number" min={0} step="0.01" placeholder="US$" value={v.price ?? ''} onChange={(e) => setVariants((x) => x.map((y, j) => (j === i ? { ...y, price: e.target.value === '' ? null : Number(e.target.value) } : y)))} aria-label="Precio" />
                <button type="button" className="iconbtn" aria-label="Quitar medida" onClick={() => setVariants((x) => x.filter((_, j) => j !== i))}><Icon name="minus" size={16} /></button>
              </div>
            ))}
            <button type="button" className="btn btn--line btn--sm" onClick={() => setVariants((x) => [...x, { code: '', size: '', price: null }])}><Icon name="plus" size={16} /> Agregar medida</button>
          </fieldset>

          <div className="ed-checks">
            <label className="check"><input type="checkbox" checked={!p.hidden} onChange={(e) => set('hidden', !e.target.checked)} /> <span>Visible en la web</span></label>
            <label className="check"><input type="checkbox" checked={!!p.featured} onChange={(e) => set('featured', e.target.checked)} /> <span>Destacado (sale primero en el catálogo)</span></label>
          </div>
        </div>
        <footer className="sheet__foot">
          <button type="button" className="btn btn--line" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn">{isNew ? 'Publicar producto' : 'Guardar cambios'}</button>
        </footer>
      </form>
    </div>
  )
}

/* ------------------------------------------------------------------ pedidos */

const STATUSES: OrderStatus[] = ['Pendiente', 'Pagado', 'Entregado', 'Cancelado']

function Orders() {
  const { invoices } = useCart()
  const { data, setOrderStatus } = useStore()
  const [tab, setTab] = useState<'Todos' | Invoice['kind']>('Todos')
  const [open, setOpen] = useState<Invoice | null>(null)
  const list = invoices.filter((i) => tab === 'Todos' || i.kind === tab)
  return (
    <>
      <Head title="Pedidos y cotizaciones" lead="Facturas y cotizaciones generadas desde la web." />
      <div className="seg" role="group" aria-label="Tipo" style={{ marginBottom: 18 }}>
        {(['Todos', 'Factura', 'Cotización'] as const).map((t) => (
          <button key={t} className="seg__opt seg__opt--sm" aria-pressed={tab === t} onClick={() => setTab(t)}>{t === 'Todos' ? 'Todos' : t === 'Factura' ? 'Facturas' : 'Cotizaciones'}</button>
        ))}
      </div>
      <div className="card card--flush">
        {list.length ? (
          <div className="scrollx">
            <table className="ptable">
              <thead><tr><th>Documento</th><th>Cliente</th><th>Fecha</th><th>Pago</th><th>Total</th><th>Estado</th></tr></thead>
              <tbody>
                {list.map((i) => (
                  <tr key={i.number}>
                    <td><button className="linkbtn" onClick={() => setOpen(i)}>{i.number}</button><small className="muted" style={{ display: 'block' }}>{i.kind}</small></td>
                    <td><strong>{i.customer.name}</strong><small className="muted" style={{ display: 'block' }}>{i.customer.phone}</small></td>
                    <td>{i.date}</td>
                    <td>{i.kind === 'Factura' ? i.method : '—'}</td>
                    <td className="num">{money(i.total)}{i.pending ? <small className="muted" style={{ display: 'block' }}>+ {i.pending} por cotizar</small> : null}</td>
                    <td>
                      {i.kind === 'Factura' ? (
                        <select className="input input--sm" aria-label={`Estado de ${i.number}`} value={data.orderStatus[i.number] ?? 'Pendiente'} onChange={(e) => setOrderStatus(i.number, e.target.value as OrderStatus)}>
                          {STATUSES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      ) : (
                        <a className="btn btn--line btn--sm" href={`https://wa.me/${i.customer.phone.replace(/\D/g, '').replace(/^0/, '58')}?text=${encodeURIComponent(`Hola ${i.customer.name}, te escribimos de ARIA por tu cotización ${i.number}.`)}`} target="_blank" rel="noreferrer">Responder</a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted" style={{ padding: 24 }}>Todavía no hay documentos. Prueba haciendo una compra o una cotización desde la web.</p>
        )}
      </div>
      {open ? (
        <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="od-t">
          <button className="sheet__scrim" aria-label="Cerrar" onClick={() => setOpen(null)} />
          <div className="sheet__panel">
            <header className="sheet__head"><h2 id="od-t">{open.kind} {open.number}</h2><button className="iconbtn" aria-label="Cerrar" onClick={() => setOpen(null)}><Icon name="close" size={18} /></button></header>
            <div className="sheet__body">
              <p><strong>{open.customer.name}</strong><br />{open.customer.doc}<br />{open.customer.email}<br />{open.customer.phone}</p>
              <table className="spec">
                <tbody>
                  {open.lines.map((l) => <tr key={l.name}><th scope="row">{l.qty} × {l.name}</th><td className="num">{l.price !== null ? money(l.price * l.qty) : 'Por cotizar'}</td></tr>)}
                </tbody>
              </table>
              <div className="totals">
                <div><span>Subtotal</span><span>{money(open.subtotal)}</span></div>
                <div><span>IVA 16 %</span><span>{money(open.tax)}</span></div>
                <div className="totals__grand"><span>Total</span><span>{money(open.total)}</span></div>
              </div>
              <Link className="btn btn--line" to={`/recibo/${open.number}`} target="_blank">Abrir el documento</Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

/* ------------------------------------------------------------------ aliados */

function Allies() {
  const { data, setAllyStatus } = useStore()
  return (
    <>
      <Head title="Aliados" lead="Solicitudes que llegan desde “Postúlate como aliado”." />
      {data.allies.length ? (
        <div className="allies-list">
          {data.allies.map((a: AllyRequest) => (
            <article className="card ally" key={a.id}>
              <div className="ally__top">
                <div>
                  <h2 className="card__t">{a.company}</h2>
                  <p className="muted">{a.type}, {a.city || 'sin ciudad'}. RIF {a.rif}</p>
                </div>
                <StatusPill s={a.status} />
              </div>
              <p><strong>{a.contact}</strong>, {a.email}, {a.phone}</p>
              <p className="muted">Le interesa: {a.interests.join(', ')}</p>
              {a.message ? <p className="ally__msg">“{a.message}”</p> : null}
              <div className="ally__act">
                <button className="btn btn--sm" disabled={a.status === 'Aprobada'} onClick={() => setAllyStatus(a.id, 'Aprobada')}>Aprobar</button>
                <button className="btn btn--line btn--sm" disabled={a.status === 'Rechazada'} onClick={() => setAllyStatus(a.id, 'Rechazada')}>Rechazar</button>
                <a className="btn btn--line btn--sm" href={`https://wa.me/${a.phone.replace(/\D/g, '').replace(/^0/, '58')}`} target="_blank" rel="noreferrer"><Icon name="chat" size={16} /> Escribir</a>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="card"><p className="muted">Aún no hay solicitudes. Llegan aquí cuando alguien llena el formulario de aliados en la web.</p></div>
      )}
    </>
  )
}

/* ------------------------------------------------------------------ contenido */

function Content() {
  const { site, setContent, resetAll } = useStore()
  const [f, setF] = useState(site)
  const [saved, setSaved] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const field = (k: keyof typeof f, label: string, area = false) => (
    <label className="field">
      <span className="field__label">{label}</span>
      {area ? (
        <textarea className="input" value={String(f[k])} onChange={(e) => { setF({ ...f, [k]: e.target.value }); setSaved(false) }} />
      ) : (
        <input className="input" value={String(f[k])} onChange={(e) => { setF({ ...f, [k]: e.target.value }); setSaved(false) }} />
      )}
    </label>
  )
  return (
    <>
      <Head title="Contenido" lead="Textos y datos de contacto que se muestran en la web." />
      <div className="adm-grid">
        <form className="card form" onSubmit={(e) => { e.preventDefault(); setContent(f); setSaved(true) }}>
          <h2 className="card__t">Portada</h2>
          {field('announcement', 'Aviso pequeño sobre el título')}
          {field('heroTitle', 'Título principal')}
          {field('heroLead', 'Texto bajo el título', true)}
          <h2 className="card__t" style={{ marginTop: 8 }}>Contacto</h2>
          <div className="form__row">{field('phone', 'Teléfono')}{field('whatsapp', 'WhatsApp (solo números, con 58)')}</div>
          <div className="form__row">{field('email', 'Correo')}{field('instagram', 'Instagram (enlace)')}</div>
          {field('address', 'Dirección')}
          {field('hours', 'Horario')}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn" type="submit">Guardar y publicar</button>
            {saved ? <span className="field__hint" role="status"><Icon name="check" size={16} /> Publicado en la web.</span> : null}
          </div>
        </form>
        <section className="card">
          <h2 className="card__t">Vista previa de la portada</h2>
          <div className="preview">
            <span className="tag">{f.announcement}</span>
            <p className="preview__t display">{f.heroTitle}</p>
            <p className="muted">{f.heroLead}</p>
          </div>
          <hr className="rule" style={{ margin: '24px 0' }} />
          <h2 className="card__t">Restablecer</h2>
          <p className="muted" style={{ margin: '6px 0 14px' }}>Borra los productos cargados, las ediciones, los estados de pedidos, las solicitudes de aliados y los textos, y vuelve al catálogo original.</p>
          {confirm ? (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn--danger btn--sm" onClick={() => { resetAll(); setConfirm(false); setF(site) }}>Sí, borrar todo</button>
              <button className="btn btn--line btn--sm" onClick={() => setConfirm(false)}>Cancelar</button>
            </div>
          ) : (
            <button className="btn btn--line btn--sm" onClick={() => setConfirm(true)}>Restablecer todo</button>
          )}
        </section>
      </div>
    </>
  )
}
