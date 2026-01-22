import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user, updateProfile, logout } = useAuth();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: {
            street: user?.address?.street || '',
            city: user?.address?.city || '',
            state: user?.address?.state || '',
            zipCode: user?.address?.zipCode || '',
            country: user?.address?.country || 'India'
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        const result = await updateProfile(formData);

        if (result.success) {
            setMessage('Profile updated successfully!');
            setEditing(false);
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    const handleCancel = () => {
        setEditing(false);
        setFormData({
            name: user?.name || '',
            phone: user?.phone || '',
            address: {
                street: user?.address?.street || '',
                city: user?.address?.city || '',
                state: user?.address?.state || '',
                zipCode: user?.address?.zipCode || '',
                country: user?.address?.country || 'India'
            }
        });
    };

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.name} />
                        ) : (
                            <div className="avatar-placeholder">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="profile-header-info">
                        <h1>{user?.name}</h1>
                        <p>{user?.email}</p>
                        {user?.authProvider && user.authProvider !== 'local' && (
                            <span className="oauth-badge">
                                <i className={`fab fa-${user.authProvider}`}></i>
                                {user.authProvider}
                            </span>
                        )}
                    </div>
                </div>

                {message && <div className="success-message">{message}</div>}
                {error && <div className="error-message">{error}</div>}

                <div className="profile-content">
                    {!editing ? (
                        <div className="profile-info">
                            <div className="info-section">
                                <h2>Personal Information</h2>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>Name</label>
                                        <p>{user?.name || 'Not provided'}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Email</label>
                                        <p>{user?.email}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Phone</label>
                                        <p>{user?.phone || 'Not provided'}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Role</label>
                                        <p className="role-badge">{user?.role}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="info-section">
                                <h2>Address</h2>
                                {user?.address?.street ? (
                                    <div className="address-display">
                                        <p>{user.address.street}</p>
                                        <p>
                                            {user.address.city}, {user.address.state} {user.address.zipCode}
                                        </p>
                                        <p>{user.address.country}</p>
                                    </div>
                                ) : (
                                    <p className="no-data">No address provided</p>
                                )}
                            </div>

                            <div className="profile-actions">
                                <button onClick={() => setEditing(true)} className="btn-primary">
                                    <i className="fas fa-edit"></i> Edit Profile
                                </button>
                                <button onClick={logout} className="btn-secondary">
                                    <i className="fas fa-sign-out-alt"></i> Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="profile-form">
                            <div className="form-section">
                                <h2>Personal Information</h2>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            pattern="[0-9]{10}"
                                            placeholder="10-digit number"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h2>Address</h2>
                                <div className="form-grid">
                                    <div className="form-group full-width">
                                        <label>Street</label>
                                        <input
                                            type="text"
                                            name="address.street"
                                            value={formData.address.street}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>City</label>
                                        <input
                                            type="text"
                                            name="address.city"
                                            value={formData.address.city}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>State</label>
                                        <input
                                            type="text"
                                            name="address.state"
                                            value={formData.address.state}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>ZIP Code</label>
                                        <input
                                            type="text"
                                            name="address.zipCode"
                                            value={formData.address.zipCode}
                                            onChange={handleChange}
                                            pattern="[0-9]{6}"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Country</label>
                                        <input
                                            type="text"
                                            name="address.country"
                                            value={formData.address.country}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" onClick={handleCancel} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
