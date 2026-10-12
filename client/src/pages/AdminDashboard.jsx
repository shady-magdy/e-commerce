import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { formatPrice } from '../components/ProductCard';
import AdminLayout from '../components/AdminLayout';
import { PageLoading } from '../components/Shared';

function dateLabel(date) { return new Date(date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}); }
export default function AdminDashboard() {
  const [data,setData]=useState(null); const [error,setError]=useState('');
  useEffect(()=>{api('/admin/dashboard').then(setData).catch(err=>setError(err.message));},[]);
  return <AdminLayout title="Overview"><div className="admin-stat-grid">{[['Products',data?.counts?.products],['Orders',data?.counts?.orders],['Customers',data?.counts?.customers]].map(([label,value])=><div className="admin-stat" key={label}><span>{label}</span><strong>{value??'—'}</strong></div>)}</div>
    <div className="admin-shortcuts"><Link to="/admin/products">Manage products <span>↗</span></Link><Link to="/admin/orders">Review orders <span>↗</span></Link><Link to="/admin/accounts">Customer accounts <span>↗</span></Link></div>
    <section className="admin-panel"><h2>Recent orders</h2>{error?<p className="admin-error">{error}</p>:!data?<PageLoading label="Opening the desk…"/>:<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead><tbody>{data.recentOrders?.length?data.recentOrders.map(order=><tr key={order._id}><td><b>#{order._id.slice(-8).toUpperCase()}</b></td><td>{order.user?.name||'Customer'}</td><td>{dateLabel(order.createdAt)}</td><td>{formatPrice(order.totalAmount)}</td><td><span className={`status-pill status-${order.status.toLowerCase()}`}>{order.status}</span></td></tr>):<tr><td colSpan="5">No orders yet.</td></tr>}</tbody></table></div>}</section>
  </AdminLayout>;
}
