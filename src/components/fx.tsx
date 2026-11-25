// Efectos del inicio: aparición al hacer scroll, palabras que entran, texto que se ilumina,
// cifras que cuentan, botones magnéticos, barra de progreso y brillo que sigue al cursor.
// Todo respeta "reducir movimiento" y escribe estilos directo en el DOM (sin re-renders por cuadro).
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { SpringValue, reducedMotion } from '../lib/spring'

/* ---------- Aparición al hacer scroll: cualquier elemento con data-rv ---------- */
export function RevealOnScroll() {
  const { pathname } = useLocation()
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            ;(e.target as HTMLElement).dataset.in = ''
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    const scan = () => document.querySelectorAll<HTMLElement>('[data-rv]:not([data-in])').forEach((el) => io.observe(el))
    scan()
    // Las páginas se cargan bajo demanda: observa también lo que aparece después
    const mo = new MutationObserver(scan)
    mo.observe(document.getElementById('contenido') ?? document.body, { childList: true, subtree: true })
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [pathname])
  return null
}

/* ---------- Barra de progreso de lectura ---------- */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const h = document.documentElement.scrollHeight - innerHeight
      ref.current?.style.setProperty('transform', `scaleX(${h > 0 ? scrollY / h : 0})`)
    }
    const on = () => (raf ||= requestAnimationFrame(update))
    update()
    addEventListener('scroll', on, { passive: true })
    addEventListener('resize', on)
    return () => {
      removeEventListener('scroll', on)
      removeEventListener('resize', on)
      cancelAnimationFrame(raf)
    }
  }, [])
  return <div className="pbar" ref={ref} aria-hidden="true" />
}

/* ---------- Palabras que entran una a una con desenfoque ---------- */
export function Words({ text, delay = 0, step = 90 }: { text: string; delay?: number; step?: number }) {
  return (
    <>
      {text.split(' ').map((w, i) => (
        <span key={i} className="wi" style={{ '--d': `${delay + i * step}ms` } as CSSProperties}>
          {w}
          {' '}
        </span>
      ))}
    </>
  )
}

/* ---------- Texto que se ilumina palabra por palabra con el scroll ---------- */
export function LitText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const spans = Array.from(el.children) as HTMLElement[]
    if (reducedMotion()) {
      spans.forEach((s) => (s.dataset.lit = ''))
      return
    }
    let raf = 0
    let lastN = -1
    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const p = (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)
      const n = Math.round(Math.max(0, Math.min(1, p)) * spans.length)
      if (n === lastN) return
      lastN = n
      spans.forEach((s, i) => {
        if (i < n) s.dataset.lit = ''
        else delete s.dataset.lit
      })
    }
    const on = () => (raf ||= requestAnimationFrame(update))
    update()
    addEventListener('scroll', on, { passive: true })
    return () => {
      removeEventListener('scroll', on)
      cancelAnimationFrame(raf)
    }
  }, [])
  return (
    <p className="lit" ref={ref}>
      {text.split(' ').map((w, i) => (
        <span key={i}>{w} </span>
      ))}
    </p>
  )
}

/* ---------- Cifra que cuenta al aparecer ---------- */
export function CountUp({ to, suffix = '', prefix = '' }: { to: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const fmt = (n: number) => `${prefix}${Math.round(n).toLocaleString('es-VE')}${suffix}`
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reducedMotion()) {
      el.textContent = fmt(to)
      return
    }
    let raf = 0
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const dur = 1600
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / dur)
        el.textContent = fmt(to * (1 - Math.pow(1 - k, 4))) // desacelera al final
        if (k < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to])
  return <span ref={ref} className="num">{fmt(0)}</span>
}

/* ---------- Botón magnético: se acerca al cursor con un resorte ---------- */
export function Magnetic({ children, strength = 0.28 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [springs] = useState(() => {
    const paint = () => {
      ref.current?.style.setProperty('transform', `translate(${s.x.value}px, ${s.y.value}px)`)
    }
    const s = { x: new SpringValue(0, paint), y: new SpringValue(0, paint) }
    return s
  })
  useEffect(() => () => {
    springs.x.stop()
    springs.y.stop()
  }, [springs])
  return (
    <span
      ref={ref}
      className="mag"
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return
        const r = e.currentTarget.getBoundingClientRect()
        springs.x.to((e.clientX - (r.left + r.width / 2)) * strength, { damping: 0.7, response: 0.3 })
        springs.y.to((e.clientY - (r.top + r.height / 2)) * strength, { damping: 0.7, response: 0.3 })
      }}
      onPointerLeave={() => {
        springs.x.to(0, { damping: 0.6, response: 0.45 })
        springs.y.to(0, { damping: 0.6, response: 0.45 })
      }}
    >
      {children}
    </span>
  )
}

/* ---------- Brillo verde que sigue al cursor dentro de una tarjeta ---------- */
export const glow = (e: React.PointerEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`)
}

/* ---------- Inclinación 3D al pasar el mouse ---------- */
export function Tilt({ children, max = 6 }: { children: ReactNode; max?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [s] = useState(() => {
    const paint = () =>
      ref.current?.style.setProperty('transform', `perspective(900px) rotateX(${o.rx.value}deg) rotateY(${o.ry.value}deg)`)
    const o = { rx: new SpringValue(0, paint), ry: new SpringValue(0, paint) }
    return o
  })
  useEffect(() => () => {
    s.rx.stop()
    s.ry.stop()
  }, [s])
  return (
    <div
      ref={ref}
      className="tilt"
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return
        const r = e.currentTarget.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width - 0.5
        const py = (e.clientY - r.top) / r.height - 0.5
        s.ry.to(px * max * 2, { damping: 1, response: 0.3 })
        s.rx.to(-py * max * 2, { damping: 1, response: 0.3 })
      }}
      onPointerLeave={() => {
        s.rx.to(0, { damping: 0.75, response: 0.5 })
        s.ry.to(0, { damping: 0.75, response: 0.5 })
      }}
    >
      {children}
    </div>
  )
}

/* ---------- Progreso de un elemento dentro de la pantalla (0 → 1) ---------- */
export function useScrollProgress<T extends HTMLElement>(onProgress: (p: number, el: T) => void, start = 0.85, end = 0.3) {
  const ref = useRef<T>(null)
  const cb = useRef(onProgress)
  useEffect(() => {
    cb.current = onProgress
  })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const a = innerHeight * start
      const b = innerHeight * end - r.height
      cb.current(Math.max(0, Math.min(1, (a - r.top) / (a - b))), el)
    }
    const on = () => (raf ||= requestAnimationFrame(update))
    update()
    addEventListener('scroll', on, { passive: true })
    addEventListener('resize', on)
    return () => {
      removeEventListener('scroll', on)
      removeEventListener('resize', on)
      cancelAnimationFrame(raf)
    }
  }, [start, end])
  return ref
}
