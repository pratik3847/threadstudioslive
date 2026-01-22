import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import './OrdersPage.css';

const OrdersPage = () => {
    const { isAuthenticated } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrders();
        }
    }, [isAuthenticated]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await ordersAPI.getAll();
            setOrders(response.data.orders);
            setError('');
        } catch (err) {
            setError('Failed to load orders');
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
            shipped: 'status-shipped',
            delivered: 'status-delivered',
            cancelled: 'status-cancelled'
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
                <h1>My Orders</h1>

                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order._id} className="order-card">
                            <div className="order-header">
                                <div className="order-info">
                                    <h3>Order #{order.orderNumber}</h3>
                                    <p className="order-date">{formatDate(order.createdAt)}</p>
                                </div>
                                <div className={`order-status ${getStatusClass(order.status)}`}>
                                    {order.status.toUpperCase()}
                                </div>
                            </div>

                            <div className="order-items">
                                {order.items.map((item, index) => (
                                    <div key={index} className="order-item">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="order-item-image"
                                        />
                                        <div className="order-item-details">
                                            <h4>{item.name}</h4>
                                            <p>Quantity: {item.quantity}</p>
                                            <p className="order-item-price">₹{item.price * item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="order-footer">
                                <div className="order-address">
                                    <h4>Shipping Address</h4>
                                    <p>{order.shippingAddress.name}</p>
                                    <p>{order.shippingAddress.street}</p>
                                    <p>
                                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                                    </p>
                                    <p>{order.shippingAddress.phone}</p>
                                </div>
                                <div className="order-total">
                                    <h4>Total Amount</h4>
                                    <p className="total-amount">₹{order.totalAmount}</p>
                                    <p className="payment-method">Payment: {order.paymentMethod.toUpperCase()}</p>
                                </div>
                            </div>

                            {order.trackingNumber && (
                                <div className="tracking-info">
                                    <i className="fas fa-truck"></i>
                                    <span>Tracking: {order.trackingNumber}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;
