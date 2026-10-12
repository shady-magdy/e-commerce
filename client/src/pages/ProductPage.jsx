import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { useStore } from '../context/StoreContext';
import { effectivePrice, formatPrice } from '../components/ProductCard';
import { PageLoading } from '../components/Shared';
import './ProductPage.css';

const swatchColors = { Ivory: '#e9e3d7', Sand: '#c4b397', Olive: '#636a50', Charcoal: '#424440', Terracotta: '#b8795f', White: '#f4f2ec', Black: '#353635', Sage: '#a9b09a', Natural: '#d5c7ad', Blue: '#7892a6' };
export default function ProductPage() {
  const { id } = useParams();
  const { addToCart, addToWishlist, isWished, removeFromWishlist } = useStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [color, setColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  useEffect(() => { let active = true; api(`/products/${id}`).then(data => { if (active) { setProduct(data.product); setColor(data.product.colors?.[0] || ''); } }).catch(err => setError(err.message)).finally(() => setLoading(false)); return () => { active = false; }; }, [id]);
  if (loading) return <PageLoading label="Finding your piece…"/>;
  if (!product) return <section className="product-fail"><span className="eyebrow">A little detour</span><h1>{error || 'Product not found'}</h1><Link className="button button-dark" to="/shop">Return to the collection</Link></section>;
  const available = product.isAvailable && product.stock > 0;
  const discountedPrice = effectivePrice(product);
  const wished = isWished(product._id);
  async function handleAdd() { setMessage(''); try { const added = await addToCart(product, color, Number(quantity)); if (added) setMessage('Added to your bag.'); } catch (err) { setMessage(err.message); } }
  async function handleWish() { setMessage(''); try { const changed = wished ? await removeFromWishlist(product._id) : await addToWishlist(product); if (changed) setMessage(wished ? 'Removed from your wishlist.' : 'Saved to your wishlist.'); } catch (err) { setMessage(err.message); } }
  return <div className="product-detail page-container">
    <nav className="breadcrumbs"><Link to="/">Home</Link><span>/</span><Link to={product.category?.slug ? `/category/${product.category.slug}` : '/shop'}>{product.category?.name || 'Shop'}</Link><span>/</span><span>{product.name}</span></nav>
    <div className="product-detail-layout"><div className="product-gallery"><div className="detail-main-image"><img src={product.images?.[activeImage] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1100&q=85'} alt={product.name}/>{product.isBestSeller && <span className="badge badge-bestseller detail-bestseller">Best seller</span>}</div>{product.images?.length > 1 && <div className="detail-thumbs">{product.images.map((src,index)=><button key={`${src}-${index}`} className={activeImage===index?'active':''} onClick={()=>setActiveImage(index)}><img src={src} alt={`${product.name} view ${index+1}`}/></button>)}</div>}</div>
      <div className="product-detail-info"><span className="eyebrow">{product.category?.name || 'The Atelier edit'} · {product.sku}</span><h1>{product.name}</h1><div className="detail-price">{product.isDiscounted && <span className="old-price">{formatPrice(product.price)}</span>}<span className={product.isDiscounted?'sale-price':''}>{formatPrice(product.isDiscounted?discountedPrice:product.price)}</span>{product.isDiscounted && <span className="detail-discount">-{product.discountPercent}%</span>}</div><p className="detail-description">{product.description}</p>
        {product.colors?.length>0&&<fieldset className="color-picker"><legend>Color <span>{color}</span></legend><div>{product.colors.map(value=><button type="button" key={value} className={`color-swatch ${color===value?'selected':''}`} aria-label={value} title={value} style={{'--swatch':swatchColors[value]||'#c8c2b6'}} onClick={()=>setColor(value)}><span>{value}</span></button>)}</div></fieldset>}
        <div className={`detail-stock ${available?'is-available':'is-unavailable'}`}><span className="stock-dot"/>{available?`${product.stock} in stock — ready to ship`:'Currently unavailable'}</div>
        <div className="detail-actions"><label className="quantity-control"><span className="sr-only">Quantity</span><button disabled={!available||quantity<=1} onClick={()=>setQuantity(value=>Math.max(1,value-1))}>−</button><span>{quantity}</span><button disabled={!available||quantity>=product.stock} onClick={()=>setQuantity(value=>Math.min(product.stock,value+1))}>+</button></label><button className="button button-dark add-detail-button" disabled={!available} onClick={handleAdd}>{available?'Add to bag':'Unavailable'}</button><button className={`detail-wishlist ${wished?'is-wished':''}`} disabled={!available&&!wished} aria-label={wished?'Remove from wishlist':'Save to wishlist'} onClick={handleWish}>{wished?'♥':'♡'}</button></div>
        {message&&<p className="detail-message">{message}</p>}
        <div className="detail-promise"><div><span>✳</span><p>Thoughtfully chosen<br/><small>Considered materials, lasting forms.</small></p></div><div><span>↗</span><p>Easy delivery<br/><small>Complimentary over $150.</small></p></div></div>
        <div className="detail-disclosure"><details><summary>Details & care</summary><p>{product.description} Handle with care and enjoy for years to come.</p></details><details><summary>Shipping & returns</summary><p>Orders are prepared with care. Current demo checkout records an order as unpaid and does not accept payment.</p></details></div>
      </div></div>
    <section className="detail-footnote"><span className="eyebrow">The everyday, a little more considered</span><p>Keep looking for the pieces that feel like they have always belonged.</p><Link to="/shop" className="text-link">Back to the collection ↗</Link></section>
  </div>;
}
