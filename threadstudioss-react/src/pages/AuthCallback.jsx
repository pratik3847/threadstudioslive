import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const userParam = searchParams.get('user');

        if (accessToken && refreshToken && userParam) {
            try {
                const userData = JSON.parse(decodeURIComponent(userParam));
                
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('user', JSON.stringify(userData));

                // Force page reload to update auth context
                window.location.href = '/';
            } catch (error) {
                console.error('OAuth callback error:', error);
                navigate('/login?error=auth_failed');
            }
        } else {
            navigate('/login?error=oauth_failed');
        }
    }, [searchParams, navigate]);

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh' 
        }}>
            <div style={{ textAlign: 'center' }}>
                <h2>Completing authentication...</h2>
                <p>Please wait while we log you in.</p>
            </div>
        </div>
    );
};

export default AuthCallback;
