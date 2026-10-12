import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api';
import { formatPrice } from '../components/ProductCard';
import { EmptyState, PageLoading } from '../components/Shared';
import './OrdersPage.css';

function dateLabel(date) { return new Date(date).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}); }
export default function OrdersPage() {
  const location = useLocation();
  const [orders,setOrders]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
  useEffect(()=>{api('/orders').then(data=>setOrders(data.orders||[])).catch(err=>setError(err.message)).finally(()=>setLoading(false));},[]);
  return <section className="page-container orders-page"><div className="page-title-row"><div><span className="eyebrow">Your Atelier account</span><h1>Order history</h1></div></div>
    {location.state?.placed&&<p className="success-message">Your order is in. We’ve saved it as Pending / Unpaid.</p>}
    {loading?<PageLoading label="Finding your orders…"/>:error?<p className="error-message">{error}</p>:orders.length? <div className="order-list">{orders.map(order=><article className="order-card" key={order._id}><div className="order-card-top"><div><span className="eyebrow">Order placed</span><p>{dateLabel(order.createdAt)}</p><small>#{order._id.slice(-8).toUpperCase()}</small></div><div className="order-total"><span className="eyebrow">Order total</span><p>{formatPrice(order.totalAmount)}</p></div></div><div className="order-card-items">{order.items.map((item,index)=><div className="order-item" key={`${item.product}-${index}`}><span>{item.quantity} × {item.name}{item.color?` · ${item.color}`:''}</span><span>{formatPrice(item.price*item.quantity)}</span></div>)}</div><div className="order-card-bottom"><div><span className={`status-pill status-${order.status.toLowerCase()}`}>{order.status}</span><span className="payment-pill">{order.paymentStatus}</span></div><span className="shipping-label">Delivering to {order.shippingAddress.city}, {order.shippingAddress.country}</span></div></article>)}</div>:<EmptyState title="Your story with Atelier starts here" text="Orders you place will be gathered here, along with their latest status."/>}
    <div className="orders-footer"><Link to="/shop" className="text-link">Find something for the everyday ↗</Link></div>
  </section>;
}
