import { Icon } from './Icon'
import { ORDER_FLOW, useStore } from '../state/store'
import type { Invoice } from '../state/cart'

const HINT: Record<string, string> = {
  Recibido: 'Tenemos tu pedido. Un asesor te escribe para confirmarlo.',
  'Pago confirmado': 'Verificamos tu pago.',
  Preparando: 'Estamos alistando tus productos.',
  'Listo para entregar': 'Listo para retirar o en camino a tu dirección.',
  Entregado: 'Pedido entregado. ¡Gracias por comprar en ARIA!',
}

const fmt = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('es-VE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''

/** Línea de tiempo del estado de un pedido */
export function Timeline({ inv }: { inv: Invoice }) {
  const { statusOf, data } = useStore()
  const now = statusOf(inv.number)
  const log = data.statusLog[inv.number] ?? []
  const when = (s: string) => (s === 'Recibido' ? inv.createdAt : [...log].reverse().find((l) => l.s === s)?.at)

  if (now === 'Cancelado') {
    return (
      <ol className="tl tl--off">
        <li data-now><span className="tl__dot" /><div><strong>Pedido cancelado</strong><small>Si tienes dudas, escríbenos por WhatsApp.</small></div></li>
      </ol>
    )
  }
  const idx = ORDER_FLOW.indexOf(now as (typeof ORDER_FLOW)[number])
  const steps = ORDER_FLOW.map((s) => (s === 'Listo para entregar' && inv.delivery?.mode === 'Retiro en tienda' ? 'Listo para retirar' : s === 'Listo para entregar' ? 'En camino' : s))
  return (
    <ol className="tl" aria-label="Estado del pedido">
      {ORDER_FLOW.map((s, i) => (
        <li key={s} data-done={i < idx || (i === idx && i === ORDER_FLOW.length - 1) || undefined} data-now={i === idx || undefined}>
          <span className="tl__dot">{i < idx || (i === idx && i === ORDER_FLOW.length - 1) ? <Icon name="check" size={14} /> : null}</span>
          <div>
            <strong>{steps[i]}</strong>
            <small>{i <= idx ? [fmt(when(s)), i === idx ? HINT[s] : ''].filter(Boolean).join(' · ') : 'Pendiente'}</small>
          </div>
        </li>
      ))}
    </ol>
  )
}
