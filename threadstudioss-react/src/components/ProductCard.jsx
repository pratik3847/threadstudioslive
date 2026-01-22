import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { _id, name, price, description, images, stock } = product;
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsAdding(true);
    addToCart({
      productId: _id,
      name,
      price,
      image: images?.[0] || '/placeholder.jpg',
      quantity: 1
    });
    setTimeout(() => setIsAdding(false), 1000);
  };

  const isOutOfStock = stock === 0;
  
  return (
    <div className="product-card">
      <Link to={`/products/${_id}`} className="product-link">
        <img 
          src={images?.[0] || '/placeholder.jpg'} 
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