import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { initiateGoogleLogin, initiateGitHubLogin } from '../services/authService';
import SocialLoginButton from '../Auth/SocialLoginButton';

const Login: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        </div>
        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            <SocialLoginButton provider="google" onClick={initiateGoogleLogin} />
            <SocialLoginButton provider="github" onClick={initiateGitHubLogin} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;