import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useCookies } from 'react-cookie';
import { getUser, logoutUser } from '../services/authService';
import type { User } from '../types/authTypes';


interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [cookies, , removeCookie] = useCookies(['jwt']);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery(
    'user',
    () => getUser(cookies.jwt),
    {
      enabled: !!cookies.jwt,
      onSuccess: (data) => {
        if (data) {
          setIsAuthenticated(true);
        }
      },
      onError: () => {
        removeCookie('jwt');
        setIsAuthenticated(false);
      },
    }
  );

  const logoutMutation = useMutation(logoutUser, {
    onSuccess: () => {
      removeCookie('jwt');
      setIsAuthenticated(false);
      queryClient.removeQueries('user');
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading: isLoading || logoutMutation.isLoading,
        isAuthenticated,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);