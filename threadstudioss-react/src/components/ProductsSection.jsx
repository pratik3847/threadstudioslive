import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { productsAPI } from '../services/api';
import './ProductsSection.css';

const ProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getAll({ featured: true });

        // API response shape is { products: [...] } in this app
        const apiProducts = response?.data?.products ?? response?.data ?? [];
        setProducts(Array.isArray(apiProducts) ? apiProducts : []);
        setError(null);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products');
        // Fallback to empty array if API fails
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="products-section">
        <h2 className="section-title">Our Creations</h2>
        <div className="loading">Loading products...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="products-section">
        <h2 className="section-title">Our Creations</h2>
        <div className="error">Error: {error}</div>
      </section>
    );
  }

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