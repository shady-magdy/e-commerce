import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { effectivePrice, formatPrice } from '../components/ProductCard';
import { EmptyState } from '../components/Shared';
import './CartPage.css';

export default function CartPage() {
  const { user } = useAuth();
  const { cartItems, updateCartItem, removeCartItem, refresh } = useStore();
  const navigate = useNavigate();
  const [address, setAddress] = useState({ name: user?.name || '', line1: '', line2: '', city: '', postalCode: '', country: '', phone: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const total = useMemo(() => cartItems.reduce(
    (sum, item) => sum + (item.product ? effectivePrice(item.product) * item.quantity : 0), 0,
  ), [cartItems]);
  const stockConflict = cartItems.some(item => !item.product || !item.product.isAvailable || item.product.stock < item.quantity);

  function setField(event) {
    setAddress(value => ({ ...value, [event.target.name]: event.target.value }));
  }
  async function checkout(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api('/orders', { method: 'POST', body: { shippingAddress: address } });
      await refresh();
      navigate('/orders', { state: { placed: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  async function update(id, changes) {
    setError('');
    try { await updateCartItem(id, changes); }
    catch (err) { setError(err.message); }
  }

  if (!cartItems.length) {
    return <div className="page-container cart-page">
      <div className="page-title-row"><div><span className="eyebrow">Your considered edit</span><h1>Shopping bag</h1></div></div>
      <EmptyState title="Your bag has room for something good" text="A few pieces you love, all in one place." />
    </div>;
  }

  return <section className="page-container cart-page">
    <div className="page-title-row">
      <div><span className="eyebrow">Your considered edit</span><h1>Shopping bag <span>({cartItems.reduce((sum, item) => sum + item.quantity, 0)})</span></h1></div>
      <Link to="/shop" className="text-link">Continue exploring ↗</Link>
    </div>
    <div className="cart-layout">
      <div className="cart-lines">
        {cartItems.map(item => item.product ? (
          <article className="cart-line" key={item._id}>
            <Link to={`/product/${item.product._id}`} className="cart-line-image"><img src={item.product.images?.[0]} alt={item.product.name} /></Link>
            <div className="cart-line-info">
              <Link to={`/product/${item.product._id}`} className="cart-line-name">{item.product.name}</Link>
              <span className="cart-line-sku">{item.product.sku}</span>
              <div className="cart-line-controls">
                {item.product.colors?.length > 0 && <label>Color <select value={item.color} onChange={event => update(item._id, { color: event.target.value, quantity: item.quantity })}>{item.product.colors.map(color => <option value={color} key={color}>{color}</option>)}</select></label>}
                <label>Qty <select value={item.quantity} onChange={event => update(item._id, { quantity: Number(event.target.value) })}>{Array.from({ length: Math.min(item.product.stock, 10) }, (_, i) => i + 1).map(number => <option key={number} value={number}>{number}</option>)}</select></label>
              </div>
              <button className="remove-cart" onClick={() => removeCartItem(item._id)}>Remove</button>
              {item.product.stock < item.quantity && <small className="cart-stock-warning">Quantity exceeds remaining stock.</small>}
            </div>
            <div className="cart-line-price">{formatPrice(effectivePrice(item.product) * item.quantity)}</div>
          </article>
        ) : (
          <article className="cart-line" key={item._id}>
            <div className="cart-line-info"><p className="cart-line-name">This product is no longer available.</p><small className="cart-stock-warning">Remove it to continue to checkout.</small><button className="remove-cart" onClick={() => removeCartItem(item._id)}>Remove item</button></div>
          </article>
        ))}
      </div>
      <aside className="checkout-card">
        <span className="eyebrow">A few last details</span><h2>Delivery & total</h2>
        <div className="subtotal-row"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
        <p className="checkout-note">Shipping and applicable taxes are confirmed separately. Payment is not collected in this demo.</p>
        {stockConflict && <p className="error-message">One or more items are no longer available in the selected quantity. Please update your bag.</p>}
        <form className="shipping-form" onSubmit={checkout}>
          <label>Full name<input required name="name" autoComplete="name" value={address.name} onChange={setField} /></label>
          <label>Address<input required name="line1" autoComplete="address-line1" value={address.line1} onChange={setField} /></label>
          <label>Apartment, suite (optional)<input name="line2" autoComplete="address-line2" value={address.line2} onChange={setField} /></label>
          <div className="shipping-pair"><label>City<input required name="city" autoComplete="address-level2" value={address.city} onChange={setField} /></label><label>Postcode<input required name="postalCode" autoComplete="postal-code" value={address.postalCode} onChange={setField} /></label></div>
          <div className="shipping-pair"><label>Country<input required name="country" autoComplete="country-name" value={address.country} onChange={setField} /></label><label>Phone (optional)<input name="phone" autoComplete="tel" value={address.phone} onChange={setField} /></label></div>
          {error && <p role="alert" className="error-message">{error}</p>}
          <button className="button button-dark checkout-submit" disabled={busy || stockConflict}>{busy ? 'Placing order…' : 'Place order · unpaid'}</button>
        </form>
        <p className="checkout-secure">✳ &nbsp; Your order will be created as Pending / Unpaid</p>
      </aside>
    </div>
  </section>;
}
