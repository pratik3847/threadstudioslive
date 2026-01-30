import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../services/api';
import './Auth.css';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        const { confirmPassword, ...registerData } = formData;
        const result = await register(registerData);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    const handleOAuthSignup = (provider) => {
        window.location.href = `${API_BASE_URL}/auth/${provider}`;
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Create Account</h1>
                <p className="auth-subtitle">Join The Thread Studioss</p>

                <div className="auth-spacer-6" />

                {error && (
                    <div className="auth-alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-stack-4">
                    <div>
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="auth-input"
                            required
                            placeholder="Enter your full name"
                        />
                    </div>

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
                            minLength="6"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="auth-input"
                            required
                            placeholder="Confirm your password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-btn primary"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>or continue with</span>
                </div>

                <div className="auth-oauth-buttons">
                    <button
                        onClick={() => handleOAuthSignup('google')}
                        className="auth-btn oauth-btn google"
                    >
                        <i className="fab fa-google"></i>
                        Google
                    </button>
                </div>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
