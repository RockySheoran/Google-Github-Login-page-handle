import api from './api';



export const getUser = async (token: string) => {
  const response = await api.get('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.user;
};

export const logoutUser = async () => {
  const response = await api.get('/api/auth/logout');
  return response.data;
};

export const initiateGoogleLogin = () => {
  window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/auth/google`;
};

export const initiateGitHubLogin = () => {
  window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/auth/github`;
};