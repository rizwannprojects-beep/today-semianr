import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return safe defaults during Vite dep-optimization reload
    return {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: async () => {},
      logout: () => {},
      register: async () => {},
      checkAuth: async () => {}
    };
  }
  return context;
};

export default useAuth;
