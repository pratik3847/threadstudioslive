import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../services/api';
import './Auth.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }

        const errorParam = searchParams.get('error');
        if (errorParam === 'oauth_failed') {
            setError('OAuth authentication failed. Please try again.');
        } else if (errorParam === 'auth_failed') {
            setError('Authentication failed. Please try again.');
        }
    }, [isAuthenticated, navigate, searchParams]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(formData);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    const handleOAuthLogin = (provider) => {
        window.location.href = `${API_BASE_URL}/auth/${provider}`;
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">Login to your account</p>

                <div className="auth-spacer-6" />

                {error && (
                    <div className="auth-alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-stack-4">
                    <div>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="auth-input"
                            required
                            placeholder="Enter your email"
                        />
                    </div>

                    <div>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="auth-input"
                            required
                            placeholder="Enter your password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-btn primary"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>or continue with</span>
                </div>

                <div className="auth-oauth-buttons">
                    <button
                        onClick={() => handleOAuthLogin('google')}
                        className="auth-btn oauth-btn google"
                    >
                        <i className="fab fa-google"></i>
                        Google
                    </button>
                </div>

                <div className="auth-footer">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
