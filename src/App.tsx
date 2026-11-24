import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { CartSheet } from './components/CartSheet'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { ScrollToTop } from './components/ScrollToTop'
import { CartProvider } from './state/cart'
import { ToastProvider } from './state/toast'
import Home from './pages/Home'

// El inicio va en el paquete principal; el resto se carga al visitarlo.
const Catalog = lazy(() => import('./pages/Catalog'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const Energy = lazy(() => import('./pages/Energy'))
const Services = lazy(() => import('./pages/Services'))
const About = lazy(() => import('./pages/About'))
const Allies = lazy(() => import('./pages/Allies'))
const News = lazy(() => import('./pages/News'))
const Article = lazy(() => import('./pages/Article'))
const Contact = lazy(() => import('./pages/Contact'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Receipt = lazy(() => import('./pages/Receipt'))
const NotFound = lazy(() => import('./pages/NotFound'))

export function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <ScrollToTop />
        <a className="skip" href="#contenido">Saltar al contenido</a>
        <Header />
        <main id="contenido">
          <Suspense fallback={<div className="loading" aria-busy="true" />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalogo" element={<Catalog />} />
              <Route path="/catalogo/:cat" element={<Catalog />} />
              <Route path="/producto/:slug" element={<ProductPage />} />
              <Route path="/energia" element={<Energy />} />
              <Route path="/servicios" element={<Services />} />
              <Route path="/nosotros" element={<About />} />
              <Route path="/aliados" element={<Allies />} />
              <Route path="/noticias" element={<News />} />
              <Route path="/noticias/:slug" element={<Article />} />
              <Route path="/contacto" element={<Contact />} />
              <Route path="/carrito" element={<Cart />} />
              <Route path="/pago" element={<Checkout />} />
              <Route path="/recibo/:number" element={<Receipt />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <CartSheet />
      </CartProvider>
    </ToastProvider>
  )
}
