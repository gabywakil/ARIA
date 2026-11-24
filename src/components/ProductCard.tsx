import { memo } from 'react'
import { Link } from 'react-router-dom'
import { money, productImage, type Product } from '../data/products'
import { useCart } from '../state/cart'
import { useToast } from '../state/toast'
import { Icon } from './Icon'

export function ProductShot({ product, className = '', eager = false }: { product: Product; className?: string; eager?: boolean }) {
  return (
    <div className={`shot shot--${product.look} ${className}`}>
      <img src={productImage(product)} alt={product.name} loading={eager ? 'eager' : 'lazy'} decoding="async" />
    </div>
  )
}

export const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  const { add } = useCart()
  const toast = useToast()
  return (
    <article className="pcard">
      <Link to={`/producto/${product.slug}`} className="pcard__link">
        <ProductShot product={product} />
        <div className="pcard__body">
          <p className="pcard__meta">
            {product.brand}
            {product.condition === 'Usado' ? <span className="pcard__used">Usado</span> : null}
          </p>
          <h3 className="pcard__name">{product.name}</h3>
          <p className="pcard__hl">{product.highlight}</p>
        </div>
      </Link>
      <div className="pcard__foot">
        <p className="pcard__price">
          {money(product.price)}
          {product.rentPerDay ? <small> o {money(product.rentPerDay)}/día</small> : null}
        </p>
        <button
          className="iconbtn iconbtn--solid"
          aria-label={`Agregar ${product.name} al carrito`}
          onClick={() => {
            add(product.id)
            toast(`${product.name} agregado al carrito`)
          }}
        >
          <Icon name="plus" />
        </button>
      </div>
    </article>
  )
})
