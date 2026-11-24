import { useCallback, useEffect, useRef } from 'react'
import { SpringValue, VelocityTracker, project, rubberband } from '../lib/spring'

/**
 * Riel horizontal con física de Apple para el mouse:
 * arrastre 1:1, impulso proyectado, ajuste al producto más cercano con resorte
 * y resistencia elástica en los extremos. El táctil usa el scroll nativo del sistema.
 */
export function useFluidRail<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const scroll = useRef<SpringValue | null>(null)
  const band = useRef<SpringValue | null>(null)

  const snapPoints = useCallback(() => {
    const el = ref.current
    if (!el) return [0]
    const pad = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0
    const max = el.scrollWidth - el.clientWidth
    return Array.from(el.children as HTMLCollectionOf<HTMLElement>).map((c) => Math.min(max, Math.max(0, c.offsetLeft - pad)))
  }, [])

  const nearest = useCallback(
    (x: number) => snapPoints().reduce((best, p) => (Math.abs(p - x) < Math.abs(best - x) ? p : best), 0),
    [snapPoints],
  )

  useEffect(() => {
    const el = ref.current
    if (!el) return
    scroll.current = new SpringValue(el.scrollLeft, (v) => (el.scrollLeft = v))
    band.current = new SpringValue(0, (v) => (el.style.transform = v ? `translateX(${v}px)` : ''))
    let drag: { x: number; s: number; id: number; active: boolean } | null = null
    const vt = new VelocityTracker()
    let moved = false

    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      scroll.current!.stop() // se agarra en pleno movimiento desde el valor actual
      band.current!.stop()
      drag = { x: e.clientX, s: el.scrollLeft - (band.current!.value || 0), id: e.pointerId, active: false }
      vt.reset()
      vt.add(-e.clientX)
      moved = false
    }
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return
      const dx = e.clientX - drag.x
      if (!drag.active) {
        if (Math.abs(dx) < 10) return // histéresis antes de comprometerse
        drag.active = true
        moved = true
        el.setPointerCapture(e.pointerId)
        el.dataset.dragging = ''
      }
      const want = drag.s - dx
      const max = el.scrollWidth - el.clientWidth
      if (want < 0) {
        el.scrollLeft = 0
        band.current!.set(rubberband(-want, el.clientWidth))
      } else if (want > max) {
        el.scrollLeft = max
        band.current!.set(-rubberband(want - max, el.clientWidth))
      } else {
        el.scrollLeft = want
        band.current!.set(0)
      }
      scroll.current!.value = el.scrollLeft
      vt.add(-e.clientX)
    }
    const up = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return
      const wasActive = drag.active
      drag = null
      delete el.dataset.dragging
      if (!wasActive) return
      el.releasePointerCapture(e.pointerId)
      const v = vt.velocity()
      band.current!.to(0, { velocity: 0, damping: 1, response: 0.35 })
      const target = nearest(el.scrollLeft + project(v))
      scroll.current!.value = el.scrollLeft
      el.dataset.animating = ''
      scroll.current!.to(target, { velocity: v, damping: 1, response: 0.45, onRest: () => delete el.dataset.animating })
    }
    // Si hubo arrastre, el clic de soltar no abre el producto
    const click = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault()
        e.stopPropagation()
        moved = false
      }
    }
    const wheel = () => {
      scroll.current!.stop()
      delete el.dataset.animating
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('click', click, true)
    el.addEventListener('wheel', wheel, { passive: true })
    return () => {
      scroll.current?.stop()
      band.current?.stop()
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      el.removeEventListener('click', click, true)
      el.removeEventListener('wheel', wheel)
    }
  }, [nearest])

  /** Botones anterior/siguiente: resorte que parte de donde esté el riel. */
  const step = useCallback(
    (dir: 1 | -1) => {
      const el = ref.current
      const s = scroll.current
      if (!el || !s) return
      const pts = snapPoints()
      const from = s.value !== el.scrollLeft && el.dataset.animating !== undefined ? s.target : el.scrollLeft
      const perPage = Math.max(1, Math.floor(el.clientWidth / ((el.children[0] as HTMLElement)?.offsetWidth || 300)))
      const i = pts.findIndex((p) => p >= from - 2)
      const next = pts[Math.min(pts.length - 1, Math.max(0, (i < 0 ? pts.length - 1 : i) + dir * perPage))]
      s.value = el.scrollLeft
      el.dataset.animating = ''
      s.to(next, { damping: 1, response: 0.5, onRest: () => delete el.dataset.animating })
    },
    [snapPoints],
  )

  return { ref, step }
}
