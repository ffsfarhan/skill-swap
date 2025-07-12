'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/lib/types';
import { useData } from './data-context';

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
  const { findUserByEmail, addUser } = useData();

  useEffect(() => {
    const storedUser = localStorage.getItem('skillhub-user');
    if (storedUser) {
      // Re-fetch user from our "DB" on load to ensure data is fresh
      const parsedUser = JSON.parse(storedUser);
      const freshUser = findUserByEmail(parsedUser.email);
      if (freshUser) {
        setUser(freshUser);
      } else {
        // User in local storage doesn't exist in our DB anymore
        localStorage.removeItem('skillhub-user');
      }
    }
    setLoading(false);
  }, [findUserByEmail]);
  
  const login = async (email: string, pass: string) => {
    const foundUser = findUserByEmail(email);

    if (!foundUser) {
      throw new Error('User not found.');
    }
    
    if (foundUser.isBanned) {
      throw new Error('This account has been suspended.');
    }

    // In a real app, you would check a hashed password.
    const userToLogin = { ...foundUser };

    if (pass === ADMIN_PASSWORD) {
        userToLogin.isAdmin = true;
    } else {
        userToLogin.isAdmin = false;
    }

    setUser(userToLogin);
    localStorage.setItem('skillhub-user', JSON.stringify(userToLogin));
  };
  
  const signup = async (name: string, email: string, pass: string) => {
    if (findUserByEmail(email)) {
        throw new Error('An account with this email already exists.');
    }

    const newUser: User = {
        id: (Math.random() * 100000).toString(),
        name,
        email,
        isAdmin: false,
        isBanned: false,
        avatarUrl: 'https://placehold.co/100x100.png',
        skillsOffered: [],
        skillsWanted: [],
        availability: 'Not set',
        isPublic: true,
        interests: 'Not set yet. Please edit your profile!',
    };
    
    addUser(newUser);
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
