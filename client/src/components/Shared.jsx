import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Shared.css';

export function PageLoading({ label = 'Gathering the good things…' }) { return <div className="page-loading"><span className="loading-mark">✳</span><p>{label}</p></div>; }
export function EmptyState({ title, text, action = 'Explore the shop', to = '/shop' }) { return <div className="empty-state"><span className="empty-mark">✳</span><h2>{title}</h2><p>{text}</p><Link className="button button-dark" to={to}>{action}</Link></div>; }
export function Pagination({ page, pages, onChange }) {
  if (pages < 2) return null;
  return <nav className="pagination" aria-label="Product pages"><button disabled={page <= 1} onClick={() => onChange(page - 1)}>← Previous</button><span>Page <b>{page}</b> of {pages}</span><button disabled={page >= pages} onClick={() => onChange(page + 1)}>Next →</button></nav>;
}
export function ProtectedRoute({ children, admin = false }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoading label="Checking your account…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  if (admin && user.role !== 'admin') return <div className="access-denied"><h1>Admin access only</h1><p>This part of the shop is reserved for its team.</p><Link to="/">Back to the shop</Link></div>;
  return children;
}
