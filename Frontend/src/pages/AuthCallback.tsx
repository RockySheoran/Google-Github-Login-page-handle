import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getUser } from '../services/authService';


const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<any>(null); // Replace 'any' with your user type

  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(user)
    const authenticateUser = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Store the token
        localStorage.setItem('token', token);

        // Fetch user profile
        const { success, user, message } = await getUser(token);
        console.log(success,user,message)
        

        setUser(user);

        // Update auth context
        // setUser(user);
        
        // Redirect to home or intended page
        // const redirectTo = searchParams.get('redirect') || '/';
        // navigate(redirectTo);
      } catch (err) {
        console.error('Authentication error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    authenticateUser();
  }, [searchParams, navigate, setUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Processing your login...</h1>
          <p>Please wait while we authenticate your account.</p>
          <div className="mt-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-500">Authentication Error</h1>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }


    if (user) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Welcome, {user.name || user.email}!</h1>
            <p className="mb-4">You have successfully logged in.</p>
            <button
                onClick={() => navigate('/')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Go to Dashboard
            </button>
            </div>
        </div>
        );
    }
  return null;
};

export default AuthCallback;