'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/lib/types';
import { users as mockUsers } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_PASSWORD = 'adminpassword';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Persist user auth state
    const storedUser = localStorage.getItem('skillhub-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);
  
  const login = async (email: string, pass: string) => {
    // This is a mock login. In a real app, you'd call an API.
    const foundUser = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!foundUser) {
      throw new Error('User not found.');
    }

    // In a real app, you would check a hashed password.
    // For this mock, any password works unless it's the admin password.
    if (pass === ADMIN_PASSWORD) {
        foundUser.isAdmin = true;
    } else {
        foundUser.isAdmin = false; // Ensure isAdmin is reset if not using admin pass
    }

    setUser(foundUser);
    localStorage.setItem('skillhub-user', JSON.stringify(foundUser));
  };
  
  const signup = async (name: string, email: string, pass: string) => {
    // Mock signup. Check if user exists, then create a new one.
    if (mockUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('An account with this email already exists.');
    }

    const newUser: User = {
        id: String(mockUsers.length + 1),
        name,
        email,
        isAdmin: false,
        avatarUrl: 'https://placehold.co/100x100.png',
        skillsOffered: [],
        skillsWanted: [],
        availability: 'Not set',
        isPublic: true,
        interests: 'Not set',
        location: 'Not set',
    };
    
    mockUsers.push(newUser); // In a real app, this would be a DB insert.
    setUser(newUser);
    localStorage.setItem('skillhub-user', JSON.stringify(newUser));
  }

  const logout = () => {
    setUser(null);
    localStorage.removeItem('skillhub-user');
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('skillhub-user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
