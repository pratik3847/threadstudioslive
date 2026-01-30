import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await productsAPI.getById(id);
            setProduct(response.data.product);
            setError('');
        } catch (err) {
            setError('Product not found');
            console.error('Fetch product error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        addToCart(product, quantity);
        setMessage('Added to cart!');
        setTimeout(() => setMessage(''), 3000);
    };

    const handleBuyNow = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        addToCart(product, quantity);
        navigate('/cart');
    };

    if (loading) {
        return <div className="loading-container">Loading...</div>;
    }

    if (error || !product) {
        return (
            <div className="error-container">
                <h2>{error}</h2>
                <button onClick={() => navigate('/products')} className="btn-primary">
                    Back to Products
                </button>
            </div>
        );
    }

    const currentPrice = product.salePrice || product.price;
    const hasDiscount = product.salePrice && product.salePrice < product.price;

    const resolveImageUrl = (url) => {
        if (!url) return '/placeholder.jpg';
        if (typeof url !== 'string') return '/placeholder.jpg';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        if (url.startsWith('/')) return url;
        return `/${encodeURI(url)}`;
    };

    const firstImage = product.images?.[0];
    const mainImageUrl = typeof firstImage === 'string' ? firstImage : firstImage?.url;

    return (
        <div className="product-detail-page">
            <div className="product-detail-container">
                <div className="product-images">
                    <img
                        src={resolveImageUrl(mainImageUrl)}
                        alt={product.name}
                        className="main-image"
                    />
                    {(product.images?.length ?? 0) > 1 && (
                        <div className="thumbnail-images">
                            {product.images.map((img, index) => {
                                const imgUrl = typeof img === 'string' ? img : img?.url;
                                return (
                                    <img
                                        key={index}
                                        src={resolveImageUrl(imgUrl)}
                                        alt={`${product.name} ${index + 1}`}
                                        className="thumbnail"
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="product-info">
                    <h1 className="product-name">{product.name}</h1>

                    <div className="product-price">
                        <span className="current-price">₹{currentPrice}</span>
                        {hasDiscount && (
                            <>
                                <span className="original-price">₹{product.price}</span>
                                <span className="discount-badge">
                                    {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                                </span>
                            </>
                        )}
                    </div>

                    <div className="product-description">
                        <h3>Description</h3>
                        <p>{product.description}</p>
                    </div>

                    {product.tags && product.tags.length > 0 && (
                        <div className="product-tags">
                            {product.tags.map((tag, index) => (
                                <span key={index} className="tag">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="product-stock">
                        {product.inStock ? (
                            <span className="in-stock">
                                <i className="fas fa-check-circle"></i> In Stock
                                {product.inventory && ` (${product.inventory} available)`}
                            </span>
                        ) : (
                            <span className="out-of-stock">
                                <i className="fas fa-times-circle"></i> Out of Stock
                            </span>
                        )}
                    </div>

                    {product.inStock && (
                        <>
                            <div className="quantity-selector">
                                <label>Quantity:</label>
                                <div className="quantity-controls">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="quantity-btn"
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        min="1"
                                        max={product.inventory || 99}
                                        className="quantity-input"
                                    />
                                    <button
                                        onClick={() => setQuantity(Math.min(product.inventory || 99, quantity + 1))}
                                        className="quantity-btn"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {message && <div className="success-message">{message}</div>}

                            <div className="product-actions">
                                <button onClick={handleAddToCart} className="btn-secondary">
                                    <i className="fas fa-shopping-cart"></i> Add to Cart
                                </button>
                                <button onClick={handleBuyNow} className="btn-primary">
                                    <i className="fas fa-bolt"></i> Buy Now
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
