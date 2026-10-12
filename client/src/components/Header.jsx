import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import './Header.css';

export default function Header() {
  const { user, logout } = useAuth();
  const { cartCount, wishlistCount } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  function submitSearch(event) { event.preventDefault(); navigate(`/shop?q=${encodeURIComponent(search.trim())}`); setMenuOpen(false); }
  async function signOut() { await logout(); navigate('/'); setMenuOpen(false); }
  return <>
    <div className="announcement">Thoughtfully chosen pieces, made to live with <span>✳</span> Complimentary shipping over $150</div>
    <header className="site-header">
      <button className="menu-toggle" aria-label="Open menu" onClick={() => setMenuOpen(value => !value)}>{menuOpen ? '×' : '☰'}</button>
      <Link to="/" className="wordmark" aria-label="Atelier home"><span className="brand-mark">✳</span><span>Atelier</span></Link>
      <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
        <NavLink to="/shop" onClick={() => setMenuOpen(false)}>Shop all</NavLink>
        <NavLink to="/category/ceramics" onClick={() => setMenuOpen(false)}>Ceramics</NavLink>
        <NavLink to="/category/lighting" onClick={() => setMenuOpen(false)}>Lighting</NavLink>
        <NavLink to="/category/textiles" onClick={() => setMenuOpen(false)}>Textiles</NavLink>
        <NavLink to="/category/objects" onClick={() => setMenuOpen(false)}>Objects</NavLink>
      </nav>
      <div className="header-actions">
        <form className="header-search" onSubmit={submitSearch}><input value={search} onChange={event => setSearch(event.target.value)} aria-label="Search products" placeholder="Search" /><button aria-label="Submit search">⌕</button></form>
        {user ? <div className="account-wrap"><NavLink className="header-link account-link" to={user.role === 'admin' ? '/admin' : '/orders'}>{user.name.split(' ')[0]}</NavLink><button className="quiet-button signout-button" onClick={signOut}>Sign out</button></div> : <NavLink className="header-link" to="/login">Sign in</NavLink>}
        <NavLink className="icon-link wishlist-shortcut" to="/wishlist" aria-label={`Wishlist, ${wishlistCount} items`}><span>♡</span><sup>{wishlistCount}</sup></NavLink>
        <NavLink className="icon-link bag-shortcut" to="/cart" aria-label={`Shopping bag, ${cartCount} items`}><span>▱</span><sup>{cartCount}</sup></NavLink>
      </div>
    </header>
    {menuOpen && <button className="menu-scrim" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}
  </>;
}
