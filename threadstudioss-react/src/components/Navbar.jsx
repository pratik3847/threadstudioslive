import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { cartCount } = useCart();

  // Handle scroll effect with hide/show on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Add scrolled class
      if (currentScrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Hide/show navbar based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false); // Scrolling down
      } else {
        setIsVisible(true); // Scrolling up
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${!isVisible ? 'hidden' : ''}`}>
      <div className="nav-container">
        <Link to={isAuthenticated && isAdmin ? "/admin/orders" : "/"} className="logo">The Thread Studioss</Link>
        
        <button 
          className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <ul className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          {!isAuthenticated || !isAdmin ? (
            <>
              <li>
                <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              </li>
              <li>
                <Link to="/products" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Products</Link>
              </li>
              <li>
                <Link to="/about" className="nav-link" onClick={() => setMobileMenuOpen(false)}>About</Link>
              </li>

              <li className="cart-link">
                <Link to="/cart" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                  Cart
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </Link>
              </li>
            </>
          ) : null}
          
          {isAuthenticated ? (
            <>
              {isAdmin ? (
                <li>
                  <Link to="/admin/orders" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                    Orders
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link to="/orders" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                      My Orders
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                      <i className="fas fa-user"></i>
                      Profile
                    </Link>
                  </li>
                </>
              )}
              <li>
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="nav-link logout-btn">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;