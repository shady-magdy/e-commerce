import { Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import AuthPage from './pages/AuthPage';
import WishlistPage from './pages/WishlistPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminAccounts from './pages/AdminAccounts';
import { ProtectedRoute } from './components/Shared';
import './styles/layout.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pathname]);
  return null;
}
export default function App() {
  return <div className="app-shell"><ScrollToTop /><Header /><main className="site-main"><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/shop" element={<ShopPage />} />
    <Route path="/category/:slug" element={<ShopPage />} />
    <Route path="/product/:id" element={<ProductPage />} />
    <Route path="/signup" element={<AuthPage mode="signup" />} />
    <Route path="/login" element={<AuthPage mode="login" />} />
    <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
    <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
    <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
    <Route path="/admin" element={<ProtectedRoute admin><AdminDashboard /></ProtectedRoute>} />
    <Route path="/admin/products" element={<ProtectedRoute admin><AdminProducts /></ProtectedRoute>} />
    <Route path="/admin/orders" element={<ProtectedRoute admin><AdminOrders /></ProtectedRoute>} />
    <Route path="/admin/accounts" element={<ProtectedRoute admin><AdminAccounts /></ProtectedRoute>} />
    <Route path="*" element={<section className="not-found"><span>404</span><h1>We can’t find that little corner.</h1><a className="button button-dark" href="/">Return home</a></section>} />
  </Routes></main><Footer /></div>;
}
