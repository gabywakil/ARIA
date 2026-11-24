import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

const ToastContext = createContext<(msg: string) => void>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  // El texto se conserva mientras el aviso se desvanece, para que no "salte"
  const [msg, setMsg] = useState('')
  const [open, setOpen] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  const show = useCallback((m: string) => {
    setMsg(m)
    setOpen(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setOpen(false), 2800)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast" role="status" aria-live="polite" data-open={open ? '' : undefined}>
        {msg}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
