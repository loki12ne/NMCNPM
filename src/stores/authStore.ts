import { create } from 'zustand';

export type UserRole = 'user' | 'tutor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

// Mock user data for development
const MOCK_USERS = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin' as UserRole,
    avatar: 'https://i.pravatar.cc/150?img=1',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Tutor User',
    email: 'tutor@example.com',
    password: 'password123',
    role: 'tutor' as UserRole,
    avatar: 'https://i.pravatar.cc/150?img=2',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Regular User',
    email: 'user@example.com',
    password: 'password123',
    role: 'user' as UserRole,
    avatar: 'https://i.pravatar.cc/150?img=3',
    createdAt: new Date().toISOString()
  }
];

// Store user in local storage for persistence
const getUserFromStorage = (): User | null => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      return JSON.parse(storedUser) as User;
    } catch (error) {
      console.error('Failed to parse stored user', error);
      return null;
    }
  }
  return null;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getUserFromStorage(),
  isAuthenticated: !!getUserFromStorage(),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    
    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const foundUser = MOCK_USERS.find(user => 
        user.email === email && user.password === password
      );
      
      if (!foundUser) {
        throw new Error('Invalid credentials');
      }
      
      const { password: _, ...userWithoutPassword } = foundUser;
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      set({ 
        user: userWithoutPassword, 
        isAuthenticated: true,
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if user already exists
      if (MOCK_USERS.some(user => user.email === email)) {
        throw new Error('User already exists');
      }
      
      // Create new user (in a real app, this would be done on the backend)
      const newUser = {
        id: String(MOCK_USERS.length + 1),
        name,
        email,
        password,
        role: 'user' as UserRole,
        createdAt: new Date().toISOString()
      };
      
      MOCK_USERS.push(newUser);
      
      const { password: _, ...userWithoutPassword } = newUser;
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      set({ 
        user: userWithoutPassword, 
        isAuthenticated: true,
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    
    try {
      // In a real app, you would validate the token with the server
      const user = getUserFromStorage();
      set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false 
      });
    } catch (error) {
      localStorage.removeItem('user');
      set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false 
      });
    }
  }
}));