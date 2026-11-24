// Resortes al estilo Apple (WWDC "Designing Fluid Interfaces"), traducidos a la web.
// damping: 1 = sin rebote (crítico); <1 = rebota. response: rapidez en segundos (no es duración).

export type SpringOpts = { damping?: number; response?: number }

export const reducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** Proyección de impulso de Apple: a dónde llegaría algo lanzado a v px/s. */
export function project(velocity: number, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate)
}

/** Resistencia progresiva al pasar un límite (rubber-band). */
export function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot))
}

/**
 * Un valor animado por resorte. Siempre parte del valor actual en pantalla
 * y conserva la velocidad al cambiar de destino, así se puede interrumpir.
 */
export class SpringValue {
  value: number
  velocity = 0
  target: number
  private raf = 0
  private last = 0
  private opts: Required<SpringOpts> = { damping: 1, response: 0.4 }
  private onUpdate: (v: number) => void
  private onRest?: () => void

  constructor(initial: number, onUpdate: (v: number) => void) {
    this.value = initial
    this.target = initial
    this.onUpdate = onUpdate
  }

  /** Fija el valor sin animar (seguimiento 1:1 durante un arrastre). */
  set(v: number) {
    this.stop()
    this.value = v
    this.target = v
    this.velocity = 0
    this.onUpdate(v)
  }

  to(target: number, opts: SpringOpts & { velocity?: number; onRest?: () => void } = {}) {
    this.target = target
    this.opts = { damping: opts.damping ?? 1, response: opts.response ?? 0.4 }
    if (opts.velocity !== undefined) this.velocity = opts.velocity
    this.onRest = opts.onRest
    if (reducedMotion()) {
      this.set(target)
      opts.onRest?.()
      return
    }
    if (!this.raf) {
      this.last = performance.now()
      this.raf = requestAnimationFrame(this.tick)
    }
  }

  stop() {
    cancelAnimationFrame(this.raf)
    this.raf = 0
  }

  private tick = (now: number) => {
    // Pasos pequeños para que el resorte sea estable aunque se pierda un cuadro
    let dt = Math.min(0.064, (now - this.last) / 1000)
    this.last = now
    const k = (2 * Math.PI / this.opts.response) ** 2
    const c = (4 * Math.PI * this.opts.damping) / this.opts.response
    while (dt > 0) {
      const h = Math.min(dt, 1 / 240)
      const f = -k * (this.value - this.target) - c * this.velocity
      this.velocity += f * h
      this.value += this.velocity * h
      dt -= h
    }
    if (Math.abs(this.velocity) < 0.5 && Math.abs(this.value - this.target) < 0.5) {
      this.value = this.target
      this.velocity = 0
      this.onUpdate(this.value)
      this.raf = 0
      this.onRest?.()
      return
    }
    this.onUpdate(this.value)
    this.raf = requestAnimationFrame(this.tick)
  }
}

/** Historial corto de posiciones para calcular la velocidad al soltar. */
export class VelocityTracker {
  private pts: [number, number][] = []
  add(pos: number, t = performance.now()) {
    this.pts.push([pos, t])
    if (this.pts.length > 6) this.pts.shift()
  }
  reset() {
    this.pts = []
  }
  /** px/s */
  velocity() {
    if (this.pts.length < 2) return 0
    const [p0, t0] = this.pts[0]
    const [p1, t1] = this.pts[this.pts.length - 1]
    if (performance.now() - t1 > 80) return 0 // se detuvo antes de soltar
    return t1 > t0 ? ((p1 - p0) / (t1 - t0)) * 1000 : 0
  }
}

/** Retroalimentación háptica breve, solo en momentos que importan. */
export function tap(ms = 8) {
  try {
    navigator.vibrate?.(ms)
  } catch {
    /* sin vibración */
  }
}
