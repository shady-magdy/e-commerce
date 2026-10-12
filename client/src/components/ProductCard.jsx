import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import './ProductCard.css';

export function formatPrice(value) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(value || 0)); }
export function effectivePrice(product) {
  const price = Number(product?.price) || 0;
  const discount = product?.isDiscounted ? Number(product.discountPercent) || 0 : 0;
  return Number((price * (1 - discount / 100)).toFixed(2));
}
export default function ProductCard({ product, index = 0 }) {
  const { addToCart, addToWishlist, removeFromWishlist, isWished } = useStore();
  const available = Boolean(product.isAvailable && product.stock > 0);
  const wished = isWished(product._id || product.id);
  async function save(event) {
    event.preventDefault(); event.stopPropagation();
    try { wished ? await removeFromWishlist(product._id || product.id) : await addToWishlist(product); }
    catch (error) { window.alert(error.message); }
  }
  async function quickAdd() {
    if (!available) return;
    try {
      const added = await addToCart(product, product.colors?.[0] || '');
      if (added) window.dispatchEvent(new CustomEvent('atelier:toast', { detail: 'Added to your bag' }));
    }
    catch (error) { window.alert(error.message); }
  }
  return <article className="product-card" style={{ '--card-order': index % 5 }}>
    <div className="product-media">
      <Link to={`/product/${product._id || product.id}`} aria-label={`View ${product.name}`}>
        <img src={product.images?.[0] || 'https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=900&q=80'} alt={product.name} loading="lazy" />
      </Link>
      <div className="product-badges">{product.isDiscounted && <span className="badge badge-sale">-{product.discountPercent}%</span>}{product.isBestSeller && <span className="badge badge-bestseller">Best seller</span>}</div>
      <button className={`heart-button ${wished ? 'is-wished' : ''}`} disabled={!available && !wished} onClick={save} aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}>{wished ? '♥' : '♡'}</button>
      <button className="quick-add" disabled={!available} onClick={quickAdd}>{available ? 'Quick add +' : 'Unavailable'}</button>
    </div>
    <div className="product-info"><div><Link className="product-name" to={`/product/${product._id || product.id}`}>{product.name}</Link><span className="product-category">{product.category?.name || 'Atelier edit'}</span></div>
      <div className="product-prices">{product.isDiscounted && <span className="old-price">{formatPrice(product.price)}</span>}<span className={product.isDiscounted ? 'current-price sale-price' : 'current-price'}>{formatPrice(effectivePrice(product))}</span></div></div>
    {!available && <p className="stock-note">Currently unavailable</p>}
  </article>;
}
