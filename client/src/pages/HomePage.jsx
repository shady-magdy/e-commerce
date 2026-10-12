import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { storeIdentity } from '../config/store';
import ProductCard from '../components/ProductCard';
import { PageLoading } from '../components/Shared';
import './HomePage.css';

const fallbackCategories = [
  { name: 'Ceramics', slug: 'ceramics', image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Lighting', slug: 'lighting', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Textiles', slug: 'textiles', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Objects', slug: 'objects', image: 'https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1000&q=85' },
];
export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    api('/categories').then(data => setCategories(data.categories || []))
      .catch(err => setError(err.message)).finally(() => setLoading(false));
  }, []);
  const displayCategories = categories.length ? categories : fallbackCategories.map(category => ({ ...category, products: [] }));
  return <div className="home-page">
    <section className="hero" style={{ '--hero-image': `url("${storeIdentity.heroImage}")` }}>
      <div className="hero-copy"><span className="eyebrow">A quieter kind of collection</span><h1>Make room<br />for <em>ritual.</em></h1><p>Considered pieces for the little moments that make a home.</p><Link to="/shop" className="button button-dark">Explore the collection <span>↗</span></Link><span className="hero-index">01 / THE ATELIER EDIT</span></div>
      <div className="hero-side-note"><span>01 — 04</span><span>Objects for<br />everyday living</span></div>
      <span className="hero-caption">Collected with intention · Made to be lived with</span>
    </section>
    <section className="home-intro page-container"><div className="intro-mark">✳</div><div><span className="eyebrow">The Atelier point of view</span><p>Objects for the everyday, chosen with care. A slower, more thoughtful edit of familiar forms, honest materials and pieces that feel like they’ve always belonged.</p></div><span className="intro-aside">Thoughtfully found.<br />Ready to be lived with.</span></section>
    <section className="category-section page-container"><div className="section-heading"><div><span className="eyebrow">Find your feeling</span><h2>Explore the edit</h2></div><Link to="/shop">Shop everything <span>↗</span></Link></div><div className="category-grid">{displayCategories.map((category, index) => <Link to={`/category/${category.slug}`} className="category-tile" key={category._id || category.slug}><img src={category.image || category.products?.[0]?.images?.[0] || fallbackCategories[index % 4].image} alt="" loading="lazy"/><span className="category-count">{String(index + 1).padStart(2, '0')}</span><div className="category-overlay"><span>{category.name}</span><span>Discover ↗</span></div></Link>)}</div></section>
    {loading ? <PageLoading label="Curating the collection…" /> : error && categories.length === 0 ? <p className="catalog-note page-container">{error} Start MongoDB and seed the demo collection to see products here.</p> : null}
    {categories.map(category => category.products?.length > 0 && <section className="product-section page-container" key={category._id}>
      <div className="section-heading"><div><span className="eyebrow">The considered collection</span><h2>{category.name}</h2></div><Link to={`/category/${category.slug}`}>View all <span>↗</span></Link></div>
      <div className="product-grid product-grid-4">{category.products.map((product, index) => <ProductCard product={product} index={index} key={product._id} />)}</div>
    </section>)}
    <section className="home-story"><div className="story-image"><img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=85" alt="A warm and considered interior with natural materials" loading="lazy" /></div><div className="story-copy"><span className="eyebrow">A little more intention</span><h2>Good things<br />gather here.</h2><p>Pieces with texture, soul and a story worth keeping. Collected for the rituals that turn rooms into somewhere you belong.</p><Link className="text-link" to="/shop">Find your everyday heirloom <span>↗</span></Link><span className="story-sign">A</span></div></section>
    <section className="newsletter page-container"><div><span className="eyebrow">Letters from Atelier</span><h2>A softer scroll<br />through the everyday.</h2></div><div className="newsletter-text"><p>Notes on living well, considered pieces and a few things we’re loving.</p><Link className="button button-outline" to="/shop">Explore the collection&nbsp; →</Link><small>No noise. Just a good note, now and then.</small></div></section>
  </div>;
}
