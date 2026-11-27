const STEPS = ['Carrito', 'Datos', 'Entrega', 'Pago', 'Revisar', 'Listo'] as const

/** Pasos de la compra. `onPick` permite volver a un paso ya completado. */
export function Flow({ step, onPick }: { step: number; onPick?: (step: number) => void }) {
  return (
    <ol className="flow" aria-label="Pasos de la compra">
      {STEPS.map((s, i) => {
        const n = i + 1
        const done = n < step
        return (
          <li key={s} aria-current={n === step ? 'step' : undefined} data-done={done || undefined}>
            {done && onPick && n > 1 ? (
              <button type="button" className="flow__back" onClick={() => onPick(n)}>{s}</button>
            ) : (
              s
            )}
          </li>
        )
      })}
    </ol>
  )
}
