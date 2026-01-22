import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import './CartPage.css';

const CartPage = () => {
    const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [shippingAddress, setShippingAddress] = useState({
        name: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
    });
    const [showCheckout, setShowCheckout] = useState(false);

    const shippingCost = cartTotal > 1000 ? 0 : 50;
    const tax = 0;
    const totalAmount = cartTotal + shippingCost + tax;

    const handleCheckout = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setShowCheckout(true);
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const orderData = {
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    customization: item.customization || []
                })),
                shippingAddress,
                paymentMethod: 'cod'
            };

            const response = await ordersAPI.create(orderData);
            clearCart();
            navigate(`/orders`);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    const handleAddressChange = (e) => {
        setShippingAddress(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    if (cart.length === 0) {
        return (
            <div className="empty-cart">
                <i className="fas fa-shopping-cart"></i>
                <h2>Your cart is empty</h2>
                <p>Add some amazing products to your cart</p>
                <button onClick={() => navigate('/products')} className="btn-primary">
                    Continue Shopping
                </button>
            </div>
        );
    }

    if (showCheckout) {
        return (
            <div className="cart-page">
                <div className="checkout-container">
                    <h1>Checkout</h1>
                    {error && <div className="error-message">{error}</div>}
                    
                    <form onSubmit={handlePlaceOrder} className="checkout-form">
                        <div className="form-section">
                            <h2>Shipping Address</h2>
                            <div className="form-grid">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Full Name *"
                                    value={shippingAddress.name}
                                    onChange={handleAddressChange}
                                    required
                                />
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Phone Number *"
                                    value={shippingAddress.phone}
                                    onChange={handleAddressChange}
                                    required
                                    pattern="[0-9]{10}"
                                />
                                <input
                                    type="text"
                                    name="street"
                                    placeholder="Street Address *"
                                    value={shippingAddress.street}
                                    onChange={handleAddressChange}
                                    required
                                    className="full-width"
                                />
                                <input
                                    type="text"
                                    name="city"
                                    placeholder="City *"
                                    value={shippingAddress.city}
                                    onChange={handleAddressChange}
                                    required
                                />
                                <input
                                    type="text"
                                    name="state"
                                    placeholder="State *"
                                    value={shippingAddress.state}
                                    onChange={handleAddressChange}
                                    required
                                />
                                <input
                                    type="text"
                                    name="zipCode"
                                    placeholder="ZIP Code *"
                                    value={shippingAddress.zipCode}
                                    onChange={handleAddressChange}
                                    required
                                    pattern="[0-9]{6}"
                                />
                            </div>
                        </div>

                        <div className="order-summary">
                            <h2>Order Summary</h2>
                            <div className="summary-line">
                                <span>Subtotal:</span>
                                <span>₹{cartTotal}</span>
                            </div>
                            <div className="summary-line">
                                <span>Shipping:</span>
                                <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
                            </div>
                            <div className="summary-line total">
                                <span>Total:</span>
                                <span>₹{totalAmount}</span>
                            </div>
                        </div>

                        <div className="checkout-actions">
                            <button type="button" onClick={() => setShowCheckout(false)} className="btn-secondary">
                                Back to Cart
                            </button>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Placing Order...' : 'Place Order (COD)'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="cart-container">
                <h1>Shopping Cart</h1>

                <div className="cart-content">
                    <div className="cart-items">
                        {cart.map((item, index) => (
                            <div key={`${item.productId}-${index}`} className="cart-item">
                                <img src={item.image} alt={item.name} className="item-image" />
                                <div className="item-details">
                                    <h3>{item.name}</h3>
                                    <p className="item-price">₹{item.price}</p>
                                </div>
                                <div className="item-quantity">
                                    <button
                                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.customization)}
                                        className="qty-btn"
                                    >
                                        -
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.customization)}
                                        className="qty-btn"
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="item-total">
                                    ₹{item.price * item.quantity}
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.productId, item.customization)}
                                    className="remove-btn"
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <h2>Cart Summary</h2>
                        <div className="summary-line">
                            <span>Subtotal:</span>
                            <span>₹{cartTotal}</span>
                        </div>
                        <div className="summary-line">
                            <span>Shipping:</span>
                            <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
                        </div>
                        {shippingCost > 0 && (
                            <p className="shipping-note">
                                Add ₹{1000 - cartTotal} more for free shipping!
                            </p>
                        )}
                        <div className="summary-line total">
                            <span>Total:</span>
                            <span>₹{totalAmount}</span>
                        </div>
                        <button onClick={handleCheckout} className="btn-primary full-width">
                            Proceed to Checkout
                        </button>
                        <button onClick={() => navigate('/products')} className="btn-secondary full-width">
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
