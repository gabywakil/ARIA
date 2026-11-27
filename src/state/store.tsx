// Almacén compartido entre la web y el panel admin.
// Hoy guarda los cambios en este navegador (localStorage); al conectar un backend,
// solo hay que reemplazar load/save por llamadas a la API.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { BASE_PRODUCTS, type Product } from '../data/products'
import { SITE as SITE_BASE } from '../data/site'

export type SiteContent = typeof SITE_BASE & { heroTitle: string; heroLead: string; announcement: string }
/** Estados de un pedido, en el orden en que avanza */
export const ORDER_FLOW = ['Recibido', 'Pago confirmado', 'Preparando', 'Listo para entregar', 'Entregado'] as const
export type OrderStatus = (typeof ORDER_FLOW)[number] | 'Cancelado'
export const ORDER_STATUSES: OrderStatus[] = [...ORDER_FLOW, 'Cancelado']
const LEGACY: Record<string, OrderStatus> = { Pendiente: 'Recibido', Pagado: 'Pago confirmado' }
export const normStatus = (s?: string): OrderStatus => (s ? LEGACY[s] ?? (s as OrderStatus) : 'Recibido')

/** Solicitud de una empresa, flota u obra (página Empresas) */
export type Lead = {
  id: string
  date: string
  company: string
  rif: string
  contact: string
  email: string
  phone: string
  need: string
  volume: string
  message: string
  status: 'Nueva' | 'Contactada' | 'Cerrada'
}
export type AllyRequest = {
  id: string
  date: string
  company: string
  rif: string
  type: string
  contact: string
  email: string
  phone: string
  city: string
  interests: string[]
  message: string
  status: 'Nueva' | 'Aprobada' | 'Rechazada'
}

type Data = {
  edited: Record<number, Partial<Product>>
  added: Product[]
  deleted: number[]
  content: Partial<SiteContent>
  orderStatus: Record<string, OrderStatus>
  /** Fecha de cada cambio de estado, para la línea de tiempo del seguimiento */
  statusLog: Record<string, { s: OrderStatus; at: string }[]>
  allies: AllyRequest[]
  leads: Lead[]
  /** Notas internas del admin sobre cada cliente (clave: cédula o RIF) */
  customerNotes: Record<string, string>
}

const KEY = 'aria:store:v1'
const EMPTY: Data = { edited: {}, added: [], deleted: [], content: {}, orderStatus: {}, statusLog: {}, allies: [], leads: [], customerNotes: {} }

function load(): Data {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...EMPTY, ...(JSON.parse(raw) as Data) }
  } catch {
    /* sin almacenamiento */
  }
  return EMPTY
}

const DEFAULT_CONTENT = {
  heroTitle: 'Movilidad y energía, elevadas.',
  heroLead: 'Motos, vehículos, plantas eléctricas, energía solar y ferretería de marcas seleccionadas, con garantía real, factura en línea y un asesor que te atiende por tu nombre.',
  announcement: 'Nuevos ingresos cada semana en Lechería',
}

type Ctx = {
  /** Productos visibles en la web */
  products: Product[]
  /** Todos, incluidos los ocultos (para el admin) */
  allProducts: Product[]
  byId: Map<number, Product>
  bySlug: Map<string, Product>
  site: SiteContent
  data: Data
  saveProduct: (p: Product) => void
  deleteProduct: (id: number) => void
  restoreProduct: (id: number) => void
  setContent: (c: Partial<SiteContent>) => void
  setOrderStatus: (number: string, s: OrderStatus) => void
  /** Estado actual de un pedido (los pedidos nuevos empiezan en Recibido) */
  statusOf: (number: string) => OrderStatus
  addAlly: (a: Omit<AllyRequest, 'id' | 'date' | 'status'>) => void
  addLead: (l: Omit<Lead, 'id' | 'date' | 'status'>) => void
  setLeadStatus: (id: string, s: Lead['status']) => void
  setCustomerNote: (doc: string, note: string) => void
  setAllyStatus: (id: string, s: AllyRequest['status']) => void
  resetAll: () => void
}

const StoreContext = createContext<Ctx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data))
    } catch {
      /* lleno o bloqueado: los cambios viven en memoria */
    }
  }, [data])

  // Cambios hechos en otra pestaña (por ejemplo, el admin abierto al lado) se reflejan al instante
  useEffect(() => {
    const on = (e: StorageEvent) => e.key === KEY && setData(load())
    addEventListener('storage', on)
    return () => removeEventListener('storage', on)
  }, [])

  const saveProduct = useCallback((p: Product) => {
    setData((d) => {
      const isBase = BASE_PRODUCTS.some((b) => b.id === p.id)
      if (isBase) return { ...d, edited: { ...d.edited, [p.id]: p } }
      const exists = d.added.some((a) => a.id === p.id)
      return { ...d, added: exists ? d.added.map((a) => (a.id === p.id ? p : a)) : [p, ...d.added] }
    })
  }, [])
  const deleteProduct = useCallback((id: number) => setData((d) => ({ ...d, deleted: [...new Set([...d.deleted, id])] })), [])
  const restoreProduct = useCallback((id: number) => setData((d) => ({ ...d, deleted: d.deleted.filter((x) => x !== id) })), [])
  const setContent = useCallback((c: Partial<SiteContent>) => setData((d) => ({ ...d, content: { ...d.content, ...c } })), [])
  const setOrderStatus = useCallback(
    (n: string, s: OrderStatus) =>
      setData((d) => ({
        ...d,
        orderStatus: { ...d.orderStatus, [n]: s },
        statusLog: { ...d.statusLog, [n]: [...(d.statusLog[n] ?? []), { s, at: new Date().toISOString() }] },
      })),
    [],
  )
  const today = () => new Date().toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
  const addLead = useCallback(
    (l: Omit<Lead, 'id' | 'date' | 'status'>) =>
      setData((d) => ({ ...d, leads: [{ ...l, id: `EM-${Date.now().toString().slice(-6)}`, date: today(), status: 'Nueva' }, ...d.leads] })),
    [],
  )
  const setLeadStatus = useCallback((id: string, s: Lead['status']) => setData((d) => ({ ...d, leads: d.leads.map((l) => (l.id === id ? { ...l, status: s } : l)) })), [])
  const setCustomerNote = useCallback((doc: string, note: string) => setData((d) => ({ ...d, customerNotes: { ...d.customerNotes, [doc]: note } })), [])
  const addAlly = useCallback(
    (a: Omit<AllyRequest, 'id' | 'date' | 'status'>) =>
      setData((d) => ({
        ...d,
        allies: [{ ...a, id: `AL-${Date.now().toString().slice(-6)}`, date: new Date().toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' }), status: 'Nueva' }, ...d.allies],
      })),
    [],
  )
  const setAllyStatus = useCallback((id: string, s: AllyRequest['status']) => setData((d) => ({ ...d, allies: d.allies.map((a) => (a.id === id ? { ...a, status: s } : a)) })), [])
  const resetAll = useCallback(() => setData(EMPTY), [])

  const value = useMemo<Ctx>(() => {
    const deleted = new Set(data.deleted)
    const merged = [...data.added, ...BASE_PRODUCTS.map((p) => (data.edited[p.id] ? { ...p, ...data.edited[p.id] } : p))].filter((p) => !deleted.has(p.id))
    const visible = merged.filter((p) => !p.hidden)
    return {
      products: visible,
      allProducts: merged,
      byId: new Map(merged.map((p) => [p.id, p])),
      bySlug: new Map(visible.map((p) => [p.slug, p])),
      site: { ...SITE_BASE, ...DEFAULT_CONTENT, ...data.content },
      data,
      saveProduct,
      deleteProduct,
      restoreProduct,
      setContent,
      setOrderStatus,
      statusOf: (n: string) => normStatus(data.orderStatus[n]),
      addAlly,
      setAllyStatus,
      addLead,
      setLeadStatus,
      setCustomerNote,
      resetAll,
    }
  }, [data, saveProduct, deleteProduct, restoreProduct, setContent, setOrderStatus, addAlly, setAllyStatus, addLead, setLeadStatus, setCustomerNote, resetAll])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const c = useContext(StoreContext)
  if (!c) throw new Error('useStore debe usarse dentro de StoreProvider')
  return c
}
