import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

export default function AdminLayout({ title, eyebrow = 'The Atelier desk', children }) {
  const { user } = useAuth();
  return <div className="page-container admin-page"><div className="admin-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1></div><Link to="/" className="admin-store-link">View storefront ↗</Link></div>
    <div className="admin-layout"><aside className="admin-sidebar"><div className="admin-avatar">{user?.name?.[0]?.toUpperCase() || 'A'}</div><div className="admin-user"><b>{user?.name}</b><span>Store administrator</span></div><nav>{[['/admin','Overview'],['/admin/products','Products'],['/admin/orders','Orders'],['/admin/accounts','Customers']].map(([to,label])=><NavLink end={to==='/admin'} to={to} key={to}>{label}<span>↗</span></NavLink>)}</nav><div className="admin-side-note">ATELIER<br/><small>Commerce console</small></div></aside><div className="admin-content">{children}</div></div>
  </div>;
}
