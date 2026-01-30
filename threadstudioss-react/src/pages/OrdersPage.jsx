import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import './OrdersPage.css';

const OrdersPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await ordersAPI.getAll({ limit: 20, page: 1 });
            setOrders(response.data.orders || []);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load orders');
            console.error('Fetch orders error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status) => {
        const statusMap = {
            pending: 'status-pending',
            confirmed: 'status-confirmed',
            processing: 'status-processing',
            packed: 'status-processing',
            shipped: 'status-shipped',
            'out-for-delivery': 'status-shipped',
            delivered: 'status-delivered',
            cancelled: 'status-cancelled',
            returned: 'status-cancelled'
        };
        return statusMap[status] || '';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const resolveImageUrl = (url) => {
        if (!url) return '/placeholder.jpg';
        if (typeof url !== 'string') return '/placeholder.jpg';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        if (url.startsWith('/')) return url;
        return `/${encodeURI(url)}`;
    };

    if (loading) {
        return <div className="loading-container">Loading orders...</div>;
    }

    if (error) {
        return <div className="error-container">{error}</div>;
    }

    if (orders.length === 0) {
        return (
            <div className="no-orders">
                <i className="fas fa-shopping-bag"></i>
                <h2>No orders yet</h2>
                <p>Start shopping to see your orders here</p>
                <a href="/products" className="btn-primary">
                    Browse Products
                </a>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <div className="orders-container">
                <div className="orders-header">
                    <h1>My Orders</h1>
                    <p>Track your purchases, delivery, and order status.</p>
                </div>

                <div className="orders-list">
                    {orders.map((order) => {
                        const orderLabel = order.orderNumber || String(order._id).slice(-6).toUpperCase();
                        const itemCount =
                            order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

                        return (
                            <div key={order._id} className="order-card">
                                <div className="order-header">
                                    <div className="order-info">
                                        <h3>
                                            Order #{orderLabel}
                                            <span className="order-submeta">
                                                {' '}
                                                · {itemCount} item{itemCount === 1 ? '' : 's'}
                                            </span>
                                        </h3>
                                        <p className="order-date">{formatDate(order.createdAt)}</p>
                                    </div>
                                    <div className={`order-status ${getStatusClass(order.status)}`}>
                                        {String(order.status || 'pending').toUpperCase()}
                                    </div>
                                </div>

                                <div className="order-items">
                                    {(order.items || []).map((item, index) => (
                                        <div key={index} className="order-item">
                                            <img
                                                src={resolveImageUrl(item.image)}
                                                alt={item.name}
                                                className="order-item-image"
                                            />
                                            <div className="order-item-details">
                                                <h4>{item.name}</h4>
                                                <p className="order-item-qty">Qty: {item.quantity}</p>
                                            </div>
                                            <div className="order-item-total">
                                                <span className="order-item-price">₹{item.price * item.quantity}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="order-footer">
                                    <div className="order-address">
                                        <h4>Shipping Address</h4>
                                        <p>{order.shippingAddress?.name}</p>
                                        <p>{order.shippingAddress?.street}</p>
                                        {order.shippingAddress?.addressLine2 && (
                                            <p>{order.shippingAddress.addressLine2}</p>
                                        )}
                                        {order.shippingAddress?.landmark && (
                                            <p>Landmark: {order.shippingAddress.landmark}</p>
                                        )}
                                        <p>
                                            {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                                            {order.shippingAddress?.zipCode}
                                        </p>
                                        {order.shippingAddress?.country && <p>{order.shippingAddress.country}</p>}
                                        <p>{order.shippingAddress?.phone}</p>
                                    </div>
                                    <div className="order-total">
                                        <h4>Total Amount</h4>
                                        <p className="total-amount">₹{order.totalAmount}</p>
                                        <p className="payment-method">
                                            Payment: {String(order.paymentMethod || 'cod').toUpperCase()}
                                        </p>
                                    </div>
                                </div>

                                {order.trackingNumber && (
                                    <div className="tracking-info">
                                        <i className="fas fa-truck"></i>
                                        <span>Tracking: {order.trackingNumber}</span>
                                    </div>
                                )}

                                {Array.isArray(order.statusHistory) && order.statusHistory.length > 0 && (
                                    <div className="tracking-info">
                                        <i className="fas fa-clipboard-list"></i>
                                        <span>
                                            Latest update:{' '}
                                            {order.statusHistory[order.statusHistory.length - 1]?.note || '—'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;
