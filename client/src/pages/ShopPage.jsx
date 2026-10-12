import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard';
import { EmptyState, PageLoading, Pagination } from '../components/Shared';
import './ShopPage.css';

export default function ShopPage() {
  const { slug } = useParams();
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const query = searchParams.get('q') || '';
  const [categoryName, setCategoryName] = useState('');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ discounted: false, bestSeller: false, sort: 'featured' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { setPage(1); }, [slug, query, filters]);
  useEffect(() => { api('/categories').then(data => setCategories(data.categories || [])).catch(() => setCategories([])); }, []);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    const params = new URLSearchParams({ page: String(page), limit: '20', sort: filters.sort });
    if (slug) params.set('category', slug);
    if (query) params.set('q', query);
    if (filters.discounted) params.set('discounted', 'true');
    if (filters.bestSeller) params.set('bestSeller', 'true');
    api(`/products?${params}`).then(data => { if (active) { setProducts(data.products || []); setPagination(data.pagination); } })
      .catch(err => { if (active) { setError(err.message); setProducts([]); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug, query, page, filters]);
  useEffect(() => { if (slug) setCategoryName(categories.find(category => category.slug === slug)?.name || slug.replace(/-/g, ' ')); }, [slug, categories]);
  const title = query ? `Results for “${query}”` : slug ? categoryName : 'The whole collection';
  return <div className="shop-page page-container">
    <div className="shop-heading"><div><span className="eyebrow">Atelier — thoughtfully gathered</span><h1>{title}</h1><p>{pagination.total ? `${pagination.total} considered pieces` : 'An edit of pieces for everyday living'}</p></div><span className="shop-heading-mark">✳</span></div>
    <div className="shop-toolbar"><div className="filter-group"><label className="filter-check"><input type="checkbox" checked={filters.discounted} onChange={e => setFilters(value => ({ ...value, discounted: e.target.checked }))}/> On offer</label><label className="filter-check"><input type="checkbox" checked={filters.bestSeller} onChange={e => setFilters(value => ({ ...value, bestSeller: e.target.checked }))}/> Best sellers</label><select aria-label="Category" value={slug || ''} onChange={e => { window.location.href = e.target.value ? `/category/${e.target.value}` : '/shop'; }}><option value="">All categories</option>{categories.map(category => <option value={category.slug} key={category._id}>{category.name}</option>)}</select></div><label className="sort-control">Sort by <select value={filters.sort} onChange={e => setFilters(value => ({ ...value, sort: e.target.value }))}><option value="featured">Featured</option><option value="newest">Newest</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></label></div>
    {loading ? <PageLoading/> : error ? <div className="catalog-error"><h2>We’re setting up the shelves</h2><p>{error} Start the MongoDB database and run the seed script to load the demo collection.</p></div> : products.length ? <><div className="product-grid shop-product-grid">{products.map((product, index) => <ProductCard key={product._id} product={product} index={index}/>)}</div><Pagination page={pagination.page || page} pages={pagination.pages || 1} onChange={setPage}/></> : <EmptyState title="Nothing in this edit just yet" text="Try a different filter, or browse the full Atelier collection." to="/shop"/>}
  </div>;
}
