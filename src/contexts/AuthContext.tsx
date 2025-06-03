import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Check if user is already logged in from localStorage
    const storedUser = localStorage.getItem('qa_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (error) {
        localStorage.removeItem('qa_user');
      }
    }
  }, []);
  
  const login = (username: string) => {
    // For demo purposes, we're creating a mock user
    const newUser = {
      id: Math.random().toString(36).substring(2, 9),
      name: username.charAt(0).toUpperCase() + username.slice(1),
      username: username.toLowerCase(),
    };
    
    setUser(newUser);
    setIsLoggedIn(true);
    localStorage.setItem('qa_user', JSON.stringify(newUser));
  };
  
  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('qa_user');
  };
  
  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};