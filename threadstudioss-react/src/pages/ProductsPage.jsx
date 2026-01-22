import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import './ProductsPage.css';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        category: 'all',
        search: '',
        sortBy: 'createdAt',
        order: 'desc'
    });

    useEffect(() => {
        fetchProducts();
    }, [filters]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await productsAPI.getAll(filters);
            setProducts(response.data.products);
        } catch (err) {
            setError('Failed to load products');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (category) => {
        setFilters({ ...filters, category });
    };

    const handleSearchChange = (e) => {
        setFilters({ ...filters, search: e.target.value });
    };

    return (
        <div className="products-page">
            <div className="products-header">
                <h1>Our Products</h1>
                <p>Discover our handcrafted crochet collection</p>
            </div>

            <div className="products-filters">
                <div className="filter-group">
                    <button
                        className={filters.category === 'all' ? 'active' : ''}
                        onClick={() => handleCategoryChange('all')}
                    >
                        All
                    </button>
                    <button
                        className={filters.category === 'keychain' ? 'active' : ''}
                        onClick={() => handleCategoryChange('keychain')}
                    >
                        Keychains
                    </button>
                    <button
                        className={filters.category === 'flowers' ? 'active' : ''}
                        onClick={() => handleCategoryChange('flowers')}
                    >
                        Flowers
                    </button>
                    <button
                        className={filters.category === 'baskets' ? 'active' : ''}
                        onClick={() => handleCategoryChange('baskets')}
                    >
                        Baskets
                    </button>
                    <button
                        className={filters.category === 'accessories' ? 'active' : ''}
                        onClick={() => handleCategoryChange('accessories')}
                    >
                        Accessories
                    </button>
                </div>

                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={filters.search}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            {loading && <div className="loading">Loading products...</div>}
            {error && <div className="error">{error}</div>}

            {!loading && !error && (
                <div className="products-grid">
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}

            {!loading && !error && products.length === 0 && (
                <div className="no-products">
                    <p>No products found. Try adjusting your filters.</p>
                </div>
            )}
        </div>
    );
};

export default ProductsPage;
