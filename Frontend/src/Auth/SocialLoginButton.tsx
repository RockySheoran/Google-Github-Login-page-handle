import React from 'react';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { FcGoogle } from 'react-icons/fc';

interface SocialLoginButtonProps {
  provider: 'google' | 'github';
  onClick: () => void;
}

const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({ provider, onClick }) => {
  const providerData = {
    google: {
      text: 'Login with Google',
      icon: <FcGoogle className="w-5 h-5" />,
      bgColor: 'bg-white',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-300',
    },
    github: {
      text: 'Login with GitHub',
      icon: <GitHubLogoIcon className="w-5 h-5" />,
      bgColor: 'bg-gray-800',
      textColor: 'text-white',
      borderColor: 'border-gray-800',
    },
  };

  const { text, icon, bgColor, textColor, borderColor } = providerData[provider];

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium ${bgColor} ${textColor} ${borderColor} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
    >
      <span className="mr-2">{icon}</span>
      {text}
    </button>
  );
};

export default SocialLoginButton;