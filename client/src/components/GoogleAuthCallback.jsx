import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * Google OAuth Callback Handler
 * Handles the redirect from Google OAuth and saves tokens
 */
export default function GoogleAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error parameter first
        const errorParam = searchParams.get('error');
        if (errorParam) {
          let errorMessage = 'Authentication failed. Please try again.';
          
          if (errorParam === 'user_not_found') {
            errorMessage = 'No account found with this email. Please contact your administrator or sign up first.';
          } else if (errorParam === 'auth_failed') {
            errorMessage = 'Google authentication failed. Please try again.';
          }
          
          setError(errorMessage);
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 3000);
          return;
        }

        // Get parameters from URL
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const role = searchParams.get('role');
        const email = searchParams.get('email');
        const userId = searchParams.get('userId');

        // Check if we have the required data
        if (!accessToken || !refreshToken || !role || !email) {
          setError('Missing authentication data. Redirecting...');
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 2000);
          return;
        }

        // Save tokens and user data to localStorage
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify({
          id: userId,
          email: email,
          role: role
        }));

        console.log('✅ Google OAuth successful! Role:', role);

        // Redirect to appropriate dashboard based on role
        switch (role) {
          case 'admin':
            navigate('/admin/dashboard', { replace: true });
            break;
          case 'instructor':
            navigate('/instructor', { replace: true });
            break;
          case 'student':
            navigate('/student', { replace: true });
            break;
          default:
            setError('Invalid user role. Redirecting...');
            setTimeout(() => {
              navigate('/login', { replace: true });
            }, 2000);
        }
      } catch (error) {
        console.error('Error processing Google OAuth callback:', error);
        setError('An error occurred. Redirecting to login...');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '20px',
      padding: '20px',
      textAlign: 'center'
    }}>
      {error ? (
        <>
          <div style={{
            fontSize: '48px',
            color: '#e74c3c'
          }}>⚠️</div>
          <h2 style={{ color: '#e74c3c' }}>Authentication Error</h2>
          <p style={{ 
            maxWidth: '500px',
            fontSize: '16px',
            color: '#555'
          }}>
            {error}
          </p>
          <p style={{ fontSize: '14px', color: '#888' }}>
            Redirecting to login page...
          </p>
        </>
      ) : (
        <>
          <div style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            animation: 'spin 1s linear infinite'
          }} />
          <h2>Completing Google Sign-In...</h2>
          <p>Please wait while we redirect you to your dashboard.</p>
        </>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
