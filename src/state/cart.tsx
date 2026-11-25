import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import { IVA, type Product } from '../data/products'
import { tap } from '../lib/spring'
import { useStore } from './store'

/** Una línea del carrito: producto + variante opcional (código del catálogo) */
export type Line = { key: string; id: number; code?: string; qty: number }
export type Invoice = {
  number: string
  date: string
  kind: 'Factura' | 'Cotización'
  customer: { name: string; doc: string; email: string; phone: string }
  method: string
  lines: { name: string; qty: number; price: number | null }[]
  subtotal: number
  tax: number
  total: number
  /** Productos sin precio publicado que se cotizan aparte */
  pending: number
}
export type Added = { id: number; qty: number; n: number; code?: string }

type State = { lines: Line[]; invoices: Invoice[] }
type Action =
  | { type: 'add'; id: number; code?: string; qty?: number }
  | { type: 'set'; key: string; qty: number }
  | { type: 'remove'; key: string }
  | { type: 'invoice'; invoice: Invoice }

const KEY = 'aria:cart:v2'
const keyOf = (id: number, code?: string) => (code ? `${id}:${code}` : String(id))

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const s = JSON.parse(raw) as State
      if (Array.isArray(s.lines) && Array.isArray(s.invoices)) return s
    }
  } catch {
    /* sin almacenamiento */
  }
  return { lines: [], invoices: [] }
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'add': {
      const key = keyOf(a.id, a.code)
      const qty = a.qty ?? 1
      const found = s.lines.find((l) => l.key === key)
      return { ...s, lines: found ? s.lines.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l)) : [...s.lines, { key, id: a.id, code: a.code, qty }] }
    }
    case 'set':
      return { ...s, lines: a.qty < 1 ? s.lines.filter((l) => l.key !== a.key) : s.lines.map((l) => (l.key === a.key ? { ...l, qty: a.qty } : l)) }
    case 'remove':
      return { ...s, lines: s.lines.filter((l) => l.key !== a.key) }
    case 'invoice':
      return { lines: a.invoice.kind === 'Factura' ? [] : s.lines, invoices: [a.invoice, ...s.invoices].slice(0, 50) }
  }
}

/** Precio unitario de una línea: el de la variante o el del producto. null = a consultar */
export function unitPrice(p: Product, code?: string): number | null {
  if (code) {
    const v = p.variants?.find((x) => x.code === code)
    if (v) return v.price && v.price > 0 ? v.price : null
  }
  return p.price && p.price > 0 ? p.price : null
}

export function lineName(p: Product, code?: string) {
  const v = code ? p.variants?.find((x) => x.code === code) : undefined
  return v ? `${p.name} (${[v.code, v.size].filter(Boolean).join(', ')})` : p.name
}

type Ctx = {
  added: Added | null
  clearAdded: () => void
  lines: Line[]
  invoices: Invoice[]
  count: number
  subtotal: number
  tax: number
  total: number
  /** Líneas sin precio: obligan a cotizar */
  pending: number
  add: (id: number, qty?: number, code?: string) => void
  setQty: (key: string, qty: number) => void
  remove: (key: string) => void
  saveInvoice: (i: Invoice) => void
}

const CartContext = createContext<Ctx | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  const { byId } = useStore()

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* sin almacenamiento */
    }
  }, [state])

  // Las facturas también se ven en el panel admin, aunque esté abierto en otra pestaña
  useEffect(() => {
    const on = (e: StorageEvent) => {
      if (e.key === KEY) location.reload()
    }
    addEventListener('storage', on)
    return () => removeEventListener('storage', on)
  }, [])

  const [added, setAdded] = useState<Added | null>(null)
  const n = useRef(0)
  const add = useCallback((id: number, qty?: number, code?: string) => {
    dispatch({ type: 'add', id, code, qty })
    n.current += 1
    tap()
    setAdded({ id, qty: qty ?? 1, n: n.current, code })
  }, [])
  const clearAdded = useCallback(() => setAdded(null), [])
  const setQty = useCallback((key: string, qty: number) => dispatch({ type: 'set', key, qty }), [])
  const remove = useCallback((key: string) => dispatch({ type: 'remove', key }), [])
  const saveInvoice = useCallback((invoice: Invoice) => dispatch({ type: 'invoice', invoice }), [])

  const value = useMemo<Ctx>(() => {
    let count = 0
    let subtotal = 0
    let pending = 0
    const lines = state.lines.filter((l) => byId.has(l.id))
    for (const l of lines) {
      const p = byId.get(l.id)!
      count += l.qty
      const u = unitPrice(p, l.code)
      if (u === null) pending += 1
      else subtotal += u * l.qty
    }
    const tax = subtotal * IVA
    return { added, clearAdded, lines, invoices: state.invoices, count, subtotal, tax, total: subtotal + tax, pending, add, setQty, remove, saveInvoice }
  }, [state, byId, added, clearAdded, add, setQty, remove, saveInvoice])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const c = useContext(CartContext)
  if (!c) throw new Error('useCart debe usarse dentro de CartProvider')
  return c
}
