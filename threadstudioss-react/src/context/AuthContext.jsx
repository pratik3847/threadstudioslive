import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const storedUser = localStorage.getItem('user');

                if (token && storedUser) {
                    setUser(JSON.parse(storedUser));
                    // Optionally fetch fresh user data
                    try {
                        const response = await authAPI.getProfile();
                        setUser(response.data.user);
                        localStorage.setItem('user', JSON.stringify(response.data.user));
                    } catch (err) {
                        // If token is invalid, will be handled by interceptor
                        console.error('Profile fetch error:', err);
                    }
                }
            } catch (err) {
                console.error('Auth check error:', err);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const register = async (userData) => {
        try {
            setError(null);
            const response = await authAPI.register(userData);
            const { user, accessToken, refreshToken } = response.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            setUser(user);
            return { success: true, user };
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Registration failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const login = async (credentials) => {
        try {
            setError(null);
            const response = await authAPI.login(credentials);
            const { user, accessToken, refreshToken } = response.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            setUser(user);
            return { success: true, user };
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Login failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setUser(null);
        }
    };

    const updateProfile = async (profileData) => {
        try {
            setError(null);
            const response = await authAPI.updateProfile(profileData);
            const updatedUser = response.data.user;

            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            return { success: true, user: updatedUser };
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Profile update failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const value = {
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
