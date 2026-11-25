import { memo } from 'react'
import { Link } from 'react-router-dom'
import { fromPrice, priceLabel, productImage, type Product } from '../data/products'
import { useCart } from '../state/cart'
import { Icon } from './Icon'

/** Foto de estudio: producto sin fondo sobre blanco con sombra de contacto */
export function ProductShot({ product, className = '', eager = false }: { product: Product; className?: string; eager?: boolean }) {
  const src = productImage(product)
  return (
    <div className={`shot shot--studio ${className}`}>
      {src ? <img src={src} alt={product.name} loading={eager ? 'eager' : 'lazy'} decoding="async" /> : <span className="shot__ph" aria-hidden="true"><Icon name="tag" size={32} /></span>}
    </div>
  )
}

export const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  const { add } = useCart()
  const hasVariants = (product.variants?.length ?? 0) > 1
  const price = fromPrice(product)
  return (
    <article className="pcard">
      <Link to={`/producto/${product.slug}`} className="pcard__link">
        <ProductShot product={product} />
        <div className="pcard__body">
          <p className="pcard__meta">
            {product.brand}
            {product.condition === 'Usado' ? <span className="pcard__used">Usado</span> : null}
            {product.sub ? <span className="pcard__sub">{product.sub}</span> : null}
          </p>
          <h3 className="pcard__name">{product.name}</h3>
          <p className="pcard__hl">{product.highlight}</p>
        </div>
      </Link>
      <div className="pcard__foot">
        <p className={`pcard__price${price === null ? ' pcard__price--ask' : ''}`}>{priceLabel(product)}</p>
        {hasVariants ? (
          <Link className="iconbtn" to={`/producto/${product.slug}`} aria-label={`Elegir medida de ${product.name}`}>
            <Icon name="arrowRight" />
          </Link>
        ) : (
          <button
            className="iconbtn iconbtn--solid"
            aria-label={price === null ? `Agregar ${product.name} a la cotización` : `Agregar ${product.name} al carrito`}
            onClick={() => add(product.id, 1, product.variants?.[0]?.code)}
          >
            <Icon name="plus" />
          </button>
        )}
      </div>
    </article>
  )
})
