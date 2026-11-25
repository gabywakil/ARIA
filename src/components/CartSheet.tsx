import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { money } from '../data/products'
import { SpringValue, VelocityTracker, project, rubberband } from '../lib/spring'
import { lineName, unitPrice, useCart, type Added } from '../state/cart'
import { useStore } from '../state/store'
import { Icon } from './Icon'
import { ProductShot } from './ProductCard'


const AUTO_CLOSE = 5000
const isSheet = () => matchMedia('(max-width: 860px)').matches

/**
 * Confirmación de "agregado al carrito".
 * Escritorio: panel que se materializa desde el ícono del carrito y vuelve a él.
 * Celular: hoja inferior que sigue al dedo, se lanza con impulso y rebota en el borde.
 * No bloquea la página (sin velo), como un panel paralelo.
 */
export function CartSheet() {
  const { count, subtotal, pending, added, clearAdded: onClose } = useCart()
  const { byId } = useStore()
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState<Added | null>(null)
  const timer = useRef(0)
  const hovering = useRef(false)
  const mode = useRef<'panel' | 'sheet'>('panel')


  // Resortes creados una sola vez. Panel: progreso 0→1. Hoja: desplazamiento en px.
  const [anim] = useState(() => {
    const paint = () => {
      const el = ref.current
      if (!el) return
      if (mode.current === 'panel') {
        const p = springs.p.value
        el.style.opacity = String(Math.max(0, Math.min(1, p)))
        el.style.transform = `scale(${0.9 + 0.1 * p})`
        el.style.filter = p < 0.999 ? `blur(${(1 - Math.min(1, p)) * 10}px)` : ''
      } else {
        el.style.opacity = '1'
        el.style.filter = ''
        el.style.transform = `translateY(${springs.y.value}px)`
      }
    }
    const springs = { p: new SpringValue(0, paint), y: new SpringValue(600, paint), paint }
    return springs
  })

  const close = useCallback(
    (velocity = 0) => {
      window.clearTimeout(timer.current)
      const done = () => {
        setShown(null)
        onClose()
      }
      if (mode.current === 'panel') anim.p.to(0, { response: 0.3, onRest: done })
      else anim.y.to((ref.current?.offsetHeight ?? 400) + 24, { velocity, damping: 1, response: 0.3, onRest: done })
    },
    [anim, onClose],
  )

  // Se cierra sola a los 5 s, salvo que la persona la esté tocando o señalando
  const arm = useCallback(() => {
    window.clearTimeout(timer.current)
    const check = () => {
      if (hovering.current) timer.current = window.setTimeout(check, AUTO_CLOSE)
      else close()
    }
    timer.current = window.setTimeout(check, AUTO_CLOSE)
  }, [close])

  // Llega un producto nuevo: abre (o se re-dirige si ya estaba abierta, sin saltos)
  if (added && added.n !== shown?.n) setShown(added)

  useLayoutEffect(() => {
    if (!shown) return
    mode.current = isSheet() ? 'sheet' : 'panel'
    const el = ref.current
    if (mode.current === 'sheet' && el && anim.y.value >= 600) anim.y.set(el.offsetHeight + 24)
    anim.paint()
    if (mode.current === 'panel') anim.p.to(1, { response: 0.35 })
    else anim.y.to(0, { damping: 0.86, response: 0.32 })
    arm()
  }, [shown, arm, anim])

  useEffect(() => {
    if (!shown) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shown, close])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  // ---- Arrastre 1:1 en la hoja (celular) ----
  const drag = useRef<{ startY: number; startVal: number; id: number; active: boolean } | null>(null)
  const vt = useRef(new VelocityTracker())

  const onPointerDown = (e: React.PointerEvent) => {
    if (mode.current !== 'sheet') return
    if ((e.target as HTMLElement).closest('a,button')) return
    anim.y.stop() // se puede agarrar en pleno movimiento: parte del valor actual
    drag.current = { startY: e.clientY, startVal: anim.y.value, id: e.pointerId, active: false }
    vt.current.reset()
    vt.current.add(e.clientY)
    hovering.current = true
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d || e.pointerId !== d.id) return
    const dy = e.clientY - d.startY
    if (!d.active) {
      if (Math.abs(dy) < 6) return // pequeño umbral antes de comprometerse
      d.active = true
      ref.current?.setPointerCapture(e.pointerId)
    }
    const raw = d.startVal + dy
    const h = ref.current?.offsetHeight ?? 400
    anim.y.set(raw < 0 ? -rubberband(-raw, h) : raw) // hacia arriba resiste
    vt.current.add(e.clientY)
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current
    drag.current = null
    hovering.current = false
    if (!d || !d.active) return
    ref.current?.releasePointerCapture(e.pointerId)
    const v = vt.current.velocity()
    const h = ref.current?.offsetHeight ?? 400
    // Decide con el punto proyectado, no con el punto donde soltó
    const landing = anim.y.value + project(v)
    if (landing > h * 0.5) close(v)
    else {
      anim.y.to(0, { velocity: v, damping: 0.8, response: 0.3 })
      arm()
    }
  }

  if (!shown) return null
  const p = byId.get(shown.id)
  if (!p) return null
  const u = unitPrice(p, shown.code)

  return (
    <div
      ref={ref}
      className="csheet"
      role="dialog"
      aria-modal="false"
      aria-labelledby="csheet-title"
      onPointerEnter={() => (hovering.current = true)}
      onPointerLeave={() => (hovering.current = false)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <span className="csheet__grip" aria-hidden="true" />
      <div className="csheet__head">
        <p id="csheet-title" className="csheet__title"><Icon name="check" size={18} /> Agregado al carrito</p>
        <button className="csheet__x" aria-label="Cerrar" onClick={() => close()}><Icon name="close" size={18} /></button>
      </div>
      <div className="csheet__item">
        <ProductShot product={p} />
        <div>
          <p className="csheet__name">{lineName(p, shown.code)}</p>
          <p className="muted num">{shown.qty} × {u !== null ? money(u) : 'precio a consultar'}</p>
        </div>
      </div>
      <div className="csheet__sum num">
        <span>{count === 1 ? '1 producto' : `${count} productos`} en tu carrito</span>
        <strong>{subtotal === 0 && pending > 0 ? "Por cotizar" : money(subtotal)}</strong>
      </div>
      <div className="csheet__actions">
        <button className="btn btn--line" onClick={() => close()}>Seguir comprando</button>
        <Link className="btn" to="/carrito" onClick={() => close()}>Ver carrito</Link>
      </div>
    </div>
  )
}

