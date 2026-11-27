import { lazy, Suspense } from 'react'
import { Outlet, Route, Routes } from 'react-router-dom'
import { CartSheet } from './components/CartSheet'
import { Footer } from './components/Footer'
import { RevealOnScroll, ScrollProgress } from './components/fx'
import { Header } from './components/Header'
import { ScrollToTop } from './components/ScrollToTop'
import Home from './pages/Home'
import { CartProvider } from './state/cart'
import { StoreProvider } from './state/store'
import { ToastProvider } from './state/toast'

// El inicio va en el paquete principal; el resto se carga al visitarlo.
const Catalog = lazy(() => import('./pages/Catalog'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const References = lazy(() => import('./pages/References'))
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
const Tracking = lazy(() => import('./pages/Tracking'))
const Faq = lazy(() => import('./pages/Faq'))
const HowToBuy = lazy(() => import('./pages/HowToBuy'))
const Business = lazy(() => import('./pages/Business'))
const Legal = lazy(() => import('./pages/Legal'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Admin = lazy(() => import('./admin/Admin'))

function SiteLayout() {
  return (
    <>
      <ScrollProgress />
      <RevealOnScroll />
      <a className="skip" href="#contenido">Saltar al contenido</a>
      <Header />
      <main id="contenido">
        <Suspense fallback={<div className="loading" aria-busy="true" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <CartSheet />
    </>
  )
}

export function App() {
  return (
    <ToastProvider>
      <StoreProvider>
        <CartProvider>
          <ScrollToTop />
          <Routes>
            <Route
              path="/admin/*"
              element={
                <Suspense fallback={<div className="loading" aria-busy="true" />}>
                  <Admin />
                </Suspense>
              }
            />
            <Route element={<SiteLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/catalogo" element={<Catalog />} />
              <Route path="/catalogo/:cat" element={<Catalog />} />
              <Route path="/producto/:slug" element={<ProductPage />} />
              <Route path="/ferreteria/referencias" element={<References />} />
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
              <Route path="/seguimiento" element={<Tracking />} />
              <Route path="/preguntas" element={<Faq />} />
              <Route path="/como-comprar" element={<HowToBuy />} />
              <Route path="/empresas" element={<Business />} />
              <Route path="/legal/:doc" element={<Legal />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </CartProvider>
      </StoreProvider>
    </ToastProvider>
  )
}
