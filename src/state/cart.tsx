import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import { IVA, productById } from '../data/products'
import { tap } from '../lib/spring'

export type Line = { id: number; qty: number }
export type Invoice = {
  number: string
  date: string
  kind: 'Factura' | 'Cotización'
  customer: { name: string; doc: string; email: string; phone: string }
  method: string
  lines: { name: string; qty: number; price: number }[]
  subtotal: number
  tax: number
  total: number
}

type State = { lines: Line[]; invoices: Invoice[] }
type Action =
  | { type: 'add'; id: number; qty?: number }
  | { type: 'set'; id: number; qty: number }
  | { type: 'remove'; id: number }
  | { type: 'clear' }
  | { type: 'invoice'; invoice: Invoice }

const KEY = 'aria:cart:v1'

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const s = JSON.parse(raw) as State
      if (Array.isArray(s.lines) && Array.isArray(s.invoices)) return s
    }
  } catch {
    /* almacenamiento no disponible */
  }
  return { lines: [], invoices: [] }
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'add': {
      const found = s.lines.find((l) => l.id === a.id)
      const qty = a.qty ?? 1
      return { ...s, lines: found ? s.lines.map((l) => (l.id === a.id ? { ...l, qty: l.qty + qty } : l)) : [...s.lines, { id: a.id, qty }] }
    }
    case 'set':
      return { ...s, lines: a.qty < 1 ? s.lines.filter((l) => l.id !== a.id) : s.lines.map((l) => (l.id === a.id ? { ...l, qty: a.qty } : l)) }
    case 'remove':
      return { ...s, lines: s.lines.filter((l) => l.id !== a.id) }
    case 'clear':
      return { ...s, lines: [] }
    case 'invoice':
      return { lines: a.invoice.kind === 'Factura' ? [] : s.lines, invoices: [a.invoice, ...s.invoices].slice(0, 20) }
  }
}

export type Added = { id: number; qty: number; n: number }

type Ctx = {
  added: Added | null
  clearAdded: () => void
  lines: Line[]
  invoices: Invoice[]
  count: number
  subtotal: number
  tax: number
  total: number
  add: (id: number, qty?: number) => void
  setQty: (id: number, qty: number) => void
  remove: (id: number) => void
  saveInvoice: (i: Invoice) => void
}

const CartContext = createContext<Ctx | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* sin almacenamiento: el carrito vive solo en memoria */
    }
  }, [state])

  const [added, setAdded] = useState<Added | null>(null)
  const n = useRef(0)
  const add = useCallback((id: number, qty?: number) => {
    dispatch({ type: 'add', id, qty })
    n.current += 1
    tap() // háptica en el mismo instante en que cambia el carrito
    setAdded({ id, qty: qty ?? 1, n: n.current })
  }, [])
  const clearAdded = useCallback(() => setAdded(null), [])
  const setQty = useCallback((id: number, qty: number) => dispatch({ type: 'set', id, qty }), [])
  const remove = useCallback((id: number) => dispatch({ type: 'remove', id }), [])
  const saveInvoice = useCallback((invoice: Invoice) => dispatch({ type: 'invoice', invoice }), [])

  const value = useMemo<Ctx>(() => {
    let count = 0
    let subtotal = 0
    for (const l of state.lines) {
      const p = productById.get(l.id)
      if (!p) continue
      count += l.qty
      subtotal += p.price * l.qty
    }
    const tax = subtotal * IVA
    return { added, clearAdded, lines: state.lines, invoices: state.invoices, count, subtotal, tax, total: subtotal + tax, add, setQty, remove, saveInvoice }
  }, [state, added, clearAdded, add, setQty, remove, saveInvoice])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const c = useContext(CartContext)
  if (!c) throw new Error('useCart debe usarse dentro de CartProvider')
  return c
}
