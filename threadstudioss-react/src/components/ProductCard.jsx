import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { _id, name, price, description, images } = product;
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);

  const resolveImageUrl = (url) => {
    if (!url) return '/placeholder.jpg';
    if (typeof url !== 'string') return '/placeholder.jpg';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return url;
    return `/${encodeURI(url)}`;
  };

  const primaryImage = Array.isArray(images) ? images[0] : null;
  const primaryImageUrl =
    typeof primaryImage === 'string' ? primaryImage : primaryImage?.url;
  const primaryImageSrc = resolveImageUrl(primaryImageUrl);
  
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsAdding(true);
    addToCart(product, 1);
    setTimeout(() => setIsAdding(false), 1000);
  };

  const inventoryCount = product?.inventory ?? product?.stock;
  const isOutOfStock = product?.inStock === false || inventoryCount === 0;
  
  return (
    <div className="product-card">
      <Link to={`/products/${_id}`} className="product-link">
        <img 
          src={primaryImageSrc} 
          alt={name} 
          className="product-image" 
        />
        {isOutOfStock && <div className="out-of-stock-badge">Out of Stock</div>}
      </Link>
      <div className="product-info">
        <h3 className="product-title">{name}</h3>
        <p className="product-price">₹{price}</p>
        <p className="product-description">{description}</p>
        <div className="product-actions">
          <Link to={`/products/${_id}`} className="btn btn-secondary">
            View Details
          </Link>
          <button 
            className="btn btn-primary"
            onClick={handleAddToCart}
            disabled={isAdding || isOutOfStock}
          >
            {isAdding ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;