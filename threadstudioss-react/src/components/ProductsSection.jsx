import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { flower, flowerbasket, keychain } from '../assets/images';
import './ProductsSection.css';

// Sample product data (would be fetched from API in production)
const sampleProducts = [
  {
    _id: '1',
    name: 'Handmade Flower Basket',
    price: 1299,
    description: 'Beautiful handcrafted flower basket made with love and care.',
    images: [flowerbasket],
    stock: 10
  },
  {
    _id: '2',
    name: 'Crochet Keychain',
    price: 299,
    description: 'Adorable crochet keychain, perfect as a gift or personal accessory.',
    images: [keychain],
    stock: 15
  },
  {
    _id: '3',
    name: 'Decorative Flower',
    price: 499,
    description: 'Elegant decorative flower that never wilts, bringing permanent beauty to your home.',
    images: [flower],
    stock: 20
  }
];

const ProductsSection = () => {
  const [products, setProducts] = useState([]);
  
  // Simulate API fetch
  useEffect(() => {
    // In a real app, this would be an API call
    setProducts(sampleProducts);
  }, []);

  return (
    <section className="products-section">
      <h2 className="section-title">Our Creations</h2>
      <div className="products-grid">
        {products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default ProductsSection;