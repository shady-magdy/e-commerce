import { Link } from 'react-router-dom';
import { socialLinks } from '../config/socialLinks';
import './Footer.css';

export default function Footer() {
  return <footer className="site-footer">
    <div className="footer-main">
      <div className="footer-brand"><Link className="wordmark footer-wordmark" to="/"><span className="brand-mark">✳</span><span>Atelier</span></Link><p>Objects for a softer everyday.</p></div>
      <div className="footer-col"><span className="footer-heading">Explore</span><Link to="/shop">All pieces</Link><Link to="/category/ceramics">Ceramics</Link><Link to="/category/textiles">Textiles</Link></div>
      <div className="footer-col"><span className="footer-heading">Your Atelier</span><Link to="/orders">Order history</Link><Link to="/wishlist">Wishlist</Link><Link to="/cart">Shopping bag</Link></div>
      <div className="footer-col footer-note"><span className="footer-heading">A note from us</span><p>Made to last. Chosen to be lived with. Find a little more meaning in the everyday.</p><a href="mailto:hello@atelier.example">hello@atelier.example</a></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Atelier. Demo storefront.</span><div className="social-links">{socialLinks.map(item => <a key={item.label} href={item.href} target="_blank" rel="noreferrer" aria-label={item.label}>{item.label}</a>)}</div><span>Designed with intention</span></div>
  </footer>;
}
