import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import { EmptyState } from '../components/Shared';
import './WishlistPage.css';

export default function WishlistPage() {
  const { wishlist, addToCart, removeFromWishlist } = useStore();
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  async function move(product) { setBusyId(product._id); setError(''); try { const added = await addToCart(product, product.colors?.[0] || ''); if (added) await removeFromWishlist(product._id); } catch (err) { setError(err.message); } finally { setBusyId(''); } }
  return <section className="page-container wishlist-page"><div className="page-title-row"><div><span className="eyebrow">Your saved edit</span><h1>Wishlist <span>({wishlist.length})</span></h1></div><Link to="/shop" className="text-link">Continue exploring ↗</Link></div>
    {error&&<p className="error-message">{error}</p>}
    {wishlist.length? <><div className="product-grid shop-product-grid">{wishlist.map((product,index)=><div className="wishlist-card" key={product._id}><ProductCard product={product} index={index}/><div className="wishlist-actions"><button className="text-link-button" disabled={!product.isAvailable||busyId===product._id} onClick={()=>move(product)}>{busyId===product._id?'Moving…':product.isAvailable?'Move to bag':'Unavailable'}</button><button className="text-link-button remove-link" onClick={()=>removeFromWishlist(product._id)}>Remove</button></div></div>)}</div></>:<EmptyState title="A place for the pieces you love" text="Save something for later and it will find its way here."/>}
  </section>;
}
