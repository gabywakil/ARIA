export function Flow({ step }: { step: 1 | 2 | 3 }) {
  const steps = ['Carrito', 'Datos y pago', 'Recibo']
  return (
    <ol className="flow" aria-label="Pasos de la compra">
      {steps.map((s, i) => (
        <li key={s} aria-current={i + 1 === step ? 'step' : undefined}>{s}</li>
      ))}
    </ol>
  )
}
