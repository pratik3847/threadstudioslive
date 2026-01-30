import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI, ordersAPI } from '../services/api';
import './OrdersPage.css';

const AdminOrdersPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isAdmin } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState('');
    const [edit, setEdit] = useState({});

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (!isAdmin) {
            navigate('/');
            return;
        }

        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, isAdmin]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getAllOrders({ limit: 50, page: 1 });
            setOrders(response.data.orders || []);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load orders');
            console.error('Admin orders fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const setField = (orderId, field, value) => {
        setEdit((prev) => ({
            ...prev,
            [orderId]: {
                ...(prev[orderId] || {}),
                [field]: value
            }
        }));
    };

    const getField = (order, field, fallback = '') => {
        const current = edit?.[order._id]?.[field];
        if (current === undefined) return fallback;
        return current;
    };

    const handleUpdate = async (order, mode) => {
        try {
            setUpdatingId(order._id);
            setError('');

            const status = getField(order, 'status', order.status || 'pending');
            const trackingNumber = getField(order, 'trackingNumber', order.trackingNumber || '');
            const shippingProvider = getField(order, 'shippingProvider', order.shippingProvider || '');
            const estimatedDelivery = getField(
                order,
                'estimatedDelivery',
                order.estimatedDelivery ? String(order.estimatedDelivery).slice(0, 10) : ''
            );
            const adminNotes = getField(order, 'adminNotes', '').trim();

            const payload = {};

            if (mode === 'status') {
                payload.status = status;
                if (adminNotes) payload.adminNotes = adminNotes;
            }

            if (mode === 'log') {
                if (!adminNotes) {
                    setError('Please enter a log note.');
                    return;
                }
                payload.adminNotes = adminNotes;
            }

            if (mode === 'shipping') {
                if (trackingNumber) payload.trackingNumber = trackingNumber;
                if (shippingProvider) payload.shippingProvider = shippingProvider;
                if (estimatedDelivery) payload.estimatedDelivery = estimatedDelivery;
                if (adminNotes) payload.adminNotes = adminNotes;
            }

            await ordersAPI.updateStatus(order._id, payload);

            setEdit((prev) => ({
                ...prev,
                [order._id]: {
                    ...(prev[order._id] || {}),
                    adminNotes: ''
                }
            }));

            await fetchOrders();
        } catch (err) {
            const apiError = err.response?.data?.error || 'Failed to update order';
            setError(apiError);
            console.error('Update order error:', err);
        } finally {
            setUpdatingId('');
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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

    const resolveImageUrl = (url) => {
        if (!url) return '/placeholder.jpg';
        if (typeof url !== 'string') return '/placeholder.jpg';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        if (url.startsWith('/')) return url;
        return `/${encodeURI(url)}`;
    };

    const headerMeta = useMemo(() => {
        const total = orders.length;
        const pending = orders.filter((o) => o.status === 'pending').length;
        return { total, pending };
    }, [orders]);

    if (loading) {
        return <div className="loading-container">Loading orders...</div>;
    }

    if (error) {
        return <div className="error-container">{error}</div>;
    }

    return (
        <div className="orders-page">
            <div className="orders-container">
                <div className="orders-header">
                    <div>
                        <h1>All Orders</h1>
                        <p>
                            Admin view · {headerMeta.total} total · {headerMeta.pending} pending
                        </p>
                    </div>
                </div>

                <div className="orders-list">
                    {orders.map((order) => {
                        const orderLabel = order.orderNumber || String(order._id).slice(-6).toUpperCase();
                        const itemCount = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
                        const customerName = order.userId?.name || 'Customer';
                        const customerEmail = order.userId?.email || '';

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
                                        <div className="order-submeta">
                                            {customerName}
                                            {customerEmail ? ` · ${customerEmail}` : ''}
                                        </div>
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

                                <div className="admin-panel">
                                    <div className="admin-row admin-row--top">
                                        <select
                                            value={getField(order, 'status', order.status || 'pending')}
                                            onChange={(e) => setField(order._id, 'status', e.target.value)}
                                            disabled={updatingId === order._id}
                                            className="admin-select"
                                        >
                                            <option value="pending">pending</option>
                                            <option value="confirmed">confirmed</option>
                                            <option value="processing">processing</option>
                                            <option value="packed">packed</option>
                                            <option value="shipped">shipped</option>
                                            <option value="out-for-delivery">out-for-delivery</option>
                                            <option value="delivered">delivered</option>
                                            <option value="cancelled">cancelled</option>
                                            <option value="returned">returned</option>
                                        </select>

                                        <button
                                            className="btn-primary"
                                            type="button"
                                            disabled={updatingId === order._id}
                                            onClick={() => handleUpdate(order, 'status')}
                                        >
                                            {updatingId === order._id ? 'Updating…' : 'Update Status'}
                                        </button>

                                        <button
                                            className="btn-secondary"
                                            type="button"
                                            disabled={updatingId === order._id}
                                            onClick={() => {
                                                setField(order._id, 'status', 'confirmed');
                                                handleUpdate(order, 'status');
                                            }}
                                        >
                                            Confirm
                                        </button>
                                    </div>

                                    <div className="admin-row admin-row--shipping">
                                        <input
                                            type="text"
                                            placeholder="Tracking Number"
                                            value={getField(order, 'trackingNumber', order.trackingNumber || '')}
                                            onChange={(e) => setField(order._id, 'trackingNumber', e.target.value)}
                                            disabled={updatingId === order._id}
                                            className="admin-input"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Shipping Provider"
                                            value={getField(order, 'shippingProvider', order.shippingProvider || '')}
                                            onChange={(e) => setField(order._id, 'shippingProvider', e.target.value)}
                                            disabled={updatingId === order._id}
                                            className="admin-input"
                                        />
                                        <input
                                            type="date"
                                            value={getField(
                                                order,
                                                'estimatedDelivery',
                                                order.estimatedDelivery ? String(order.estimatedDelivery).slice(0, 10) : ''
                                            )}
                                            onChange={(e) => setField(order._id, 'estimatedDelivery', e.target.value)}
                                            disabled={updatingId === order._id}
                                            className="admin-input admin-input--date"
                                        />
                                        <button
                                            className="btn-secondary"
                                            type="button"
                                            disabled={updatingId === order._id}
                                            onClick={() => handleUpdate(order, 'shipping')}
                                        >
                                            Save Shipping
                                        </button>
                                    </div>

                                    <div className="admin-row admin-row--log">
                                        <input
                                            type="text"
                                            placeholder="Add log note (e.g., Called customer, packed order, etc.)"
                                            value={getField(order, 'adminNotes', '')}
                                            onChange={(e) => setField(order._id, 'adminNotes', e.target.value)}
                                            disabled={updatingId === order._id}
                                            className="admin-input admin-input--full"
                                        />
                                        <button
                                            className="btn-secondary"
                                            type="button"
                                            disabled={updatingId === order._id}
                                            onClick={() => handleUpdate(order, 'log')}
                                        >
                                            Add Log
                                        </button>
                                    </div>

                                    {Array.isArray(order.statusHistory) && order.statusHistory.length > 0 && (
                                        <div className="admin-logs">
                                            <div className="admin-logs-title">Status Logs</div>
                                            <div className="admin-logs-list">
                                                {order.statusHistory
                                                    .slice()
                                                    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                                                    .map((h, idx) => (
                                                        <div key={idx} className="admin-log-item">
                                                            <span className="admin-log-date">{formatDate(h.timestamp)}</span>
                                                            <span className="admin-log-status">{String(h.status || '').toUpperCase()}</span>
                                                            <span className="admin-log-note">{h.note || '—'}</span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AdminOrdersPage;
