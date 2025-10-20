import React, { createContext, useContext, useState } from 'react';
import type { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (userId: string, password: string) => boolean;
  logout: () => void;
  users: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    avatar: '👨‍💼',
    password: 'password', // In a real app, this would be hashed
  },
  {
    id: '2',
    name: 'Jane Smith',
    avatar: '👩‍💻',
    password: 'password',
  },
  {
    id: '3',
    name: 'Guest',
    avatar: '👤',
    password: '',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users] = useState<User[]>(defaultUsers);

  const login = (userId: string, password: string): boolean => {
    const user = users.find(u => u.id === userId);
    if (user && (user.password === password || user.password === '')) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: currentUser !== null,
        login,
        logout,
        users,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
