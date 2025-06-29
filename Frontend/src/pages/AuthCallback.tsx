import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getUser } from '../services/authService';

// Define proper types for your user data
interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  providers?: string[];
  // Add other user properties as needed
}


const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {   


    const authenticateUser = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Store the token
        localStorage.setItem('token', token);

        // Fetch user profile
        const response = await getUser(token);
        console.log(response)
        
       
        setUser(response.user_metadata);

        // Update auth context here if you're using one
        // authContext.setUser(response.user);
        
        // Set redirecting state before navigation
        // setRedirecting(true);
        
        // Redirect to home or intended page after a brief delay for better UX
        // const redirectTo = searchParams.get('redirect') || '/';
        // setTimeout(() => navigate(redirectTo), 1000);
        
      } catch (err) {
        console.error('Authentication error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        // Clear invalid token if present
        localStorage.removeItem('token');
        navigate('/login', { state: { error: 'Authentication failed' } });
      } finally {
        setLoading(false);
      }
    };

    authenticateUser();
    }, [searchParams ]);


  

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
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-red-500">Authentication Error</h1>
          <p className="mb-6 text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
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
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          {user.avatar_url && (
            <img 
              src={user.avatar_url} 
              alt="User avatar" 
              className="w-16 h-16 rounded-full mx-auto mb-4"
            />
          )}
          <h1 className="text-2xl text-black font-bold mb-2">
            Welcome, {user.name}!
          </h1>
          <p className="mb-6 text-gray-600">You have successfully logged in.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
           login
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;