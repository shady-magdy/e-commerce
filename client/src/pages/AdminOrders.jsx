import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import AdminLayout from '../components/AdminLayout';
import { formatPrice } from '../components/ProductCard';
import { PageLoading } from '../components/Shared';

const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
export default function AdminOrders() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (status) params.set('status', status);
    api(`/admin/orders?${params}`).then(setData).catch(err => setError(err.message)).finally(() => setLoading(false));
  }, [page, status]);
  useEffect(() => { load(); }, [load]);
  async function change(order, value) {
    setError('');
    try {
      const result = await api(`/admin/orders/${order._id}/status`, { method: 'PATCH', body: { status: value } });
      if (selected?._id === order._id) setSelected(result.order);
      load();
    } catch (err) { setError(err.message); }
  }
  return <AdminLayout title="Orders">
    <section className="admin-panel">
      <div className="admin-toolbar"><span className="eyebrow">Fulfillment desk</span><select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }} aria-label="Filter order status"><option value="">All statuses</option>{statuses.map(value => <option key={value}>{value}</option>)}</select></div>
      {error && <p className="admin-error">{error}</p>}
      {loading ? <PageLoading label="Finding the orders…" /> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Details & update</th></tr></thead><tbody>
        {data?.orders?.length ? data.orders.map(order => <tr key={order._id}><td><b>#{order._id.slice(-8).toUpperCase()}</b><br/><small>{new Date(order.createdAt).toLocaleDateString()}</small></td><td>{order.user?.name}<br/><small>{order.user?.email}</small></td><td>{order.items.reduce((sum,item)=>sum+item.quantity,0)}</td><td>{formatPrice(order.totalAmount)}</td><td>{order.paymentStatus}</td><td><span className={`status-pill status-${order.status.toLowerCase()}`}>{order.status}</span></td><td><div className="admin-actions"><button onClick={() => setSelected(order)}>View</button><select aria-label={`Update order ${order._id} status`} value={order.status} onChange={event => change(order, event.target.value)}>{statuses.map(value => <option key={value}>{value}</option>)}</select></div></td></tr>) : <tr><td colSpan="7">No orders match.</td></tr>}
      </tbody></table></div>}
      {data?.pagination?.pages > 1 && <div className="admin-pagination"><span>Page {page} of {data.pagination.pages}</span><div><button disabled={page<=1} onClick={()=>setPage(value=>value-1)}>←</button> <button disabled={page>=data.pagination.pages} onClick={()=>setPage(value=>value+1)}>→</button></div></div>}
    </section>
    {selected && <div className="admin-modal-backdrop" onMouseDown={event => event.target===event.currentTarget && setSelected(null)}><section className="admin-modal order-detail-modal"><div className="admin-modal-head"><div><span className="eyebrow">Order #{selected._id.slice(-8).toUpperCase()}</span><h2>{selected.user?.name || 'Customer order'}</h2><small>{selected.user?.email}</small></div><button onClick={()=>setSelected(null)} aria-label="Close">×</button></div><div className="order-detail-meta"><span><b>Status</b> {selected.status}</span><span><b>Payment</b> {selected.paymentStatus}{selected.paymentMethod?` · ${selected.paymentMethod}`:''}</span><span><b>Placed</b> {new Date(selected.createdAt).toLocaleString()}</span></div><h3 className="order-detail-subtitle">Items</h3><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Color</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead><tbody>{selected.items.map((item,index)=><tr key={`${item.product}-${index}`}><td>{item.name}</td><td>{item.color||'—'}</td><td>{item.quantity}</td><td>{formatPrice(item.price)}</td><td>{formatPrice(item.price*item.quantity)}</td></tr>)}</tbody></table></div><h3 className="order-detail-subtitle">Ship to</h3><address className="order-address">{selected.shippingAddress.name}<br/>{selected.shippingAddress.line1}{selected.shippingAddress.line2&&<><br/>{selected.shippingAddress.line2}</>}<br/>{selected.shippingAddress.city}, {selected.shippingAddress.postalCode}<br/>{selected.shippingAddress.country}{selected.shippingAddress.phone&&<><br/>{selected.shippingAddress.phone}</>}</address><div className="order-detail-total"><b>Order total</b><strong>{formatPrice(selected.totalAmount)}</strong></div></section></div>}
  </AdminLayout>;
}
