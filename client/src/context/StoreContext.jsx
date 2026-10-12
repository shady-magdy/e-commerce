import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from './AuthContext';

const StoreContext = createContext(null);
export function StoreProvider({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const refresh = useCallback(async () => {
    if (!user) { setCartItems([]); setWishlist([]); return; }
    setLoading(true);
    try {
      const [cartData, wishData] = await Promise.all([api('/cart'), api('/wishlist')]);
      setCartItems(cartData.cart.items || []);
      setWishlist(wishData.products || []);
    } catch { setCartItems([]); setWishlist([]); }
    finally { setLoading(false); }
  }, [user]);
  useEffect(() => { refresh(); }, [refresh]);
  const askLogin = () => navigate('/login', { state: { from: window.location.pathname } });
  const value = useMemo(() => ({
    cartItems, wishlist, loading,
    cartCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    wishlistCount: wishlist.length,
    isWished: id => wishlist.some(product => String(product._id || product.id) === String(id)),
    async addToCart(product, color = '', quantity = 1) {
      if (!user) { askLogin(); return false; }
      await api('/cart/items', { method: 'POST', body: { productId: product._id || product.id, color, quantity } });
      await refresh();
      return true;
    },
    async updateCartItem(id, changes) { await api(`/cart/items/${id}`, { method: 'PATCH', body: changes }); await refresh(); },
    async removeCartItem(id) { await api(`/cart/items/${id}`, { method: 'DELETE' }); await refresh(); },
    async addToWishlist(product) {
      if (!user) { askLogin(); return false; }
      await api('/wishlist', { method: 'POST', body: { productId: product._id || product.id } });
      await refresh();
      return true;
    },
    async removeFromWishlist(id) { await api(`/wishlist/${id}`, { method: 'DELETE' }); await refresh(); return true; },
    async moveToCart(product) {
      const added = await this.addToCart(product, product.colors?.[0] || '', 1);
      if (added) await this.removeFromWishlist(product._id);
      return added;
    },
    refresh,
  }), [cartItems, wishlist, loading, user, refresh]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useStore must be used within StoreProvider');
  return value;
}
