'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { User, SwapRequest } from '@/lib/types';

// Admin user who is always present
const adminUser: User = {
    id: '4',
    name: 'Admin User',
    email: 'admin@example.com',
    isAdmin: true,
    isBanned: false,
    location: 'Control Room',
    avatarUrl: 'https://placehold.co/100x100.png',
    skillsOffered: [],
    skillsWanted: [],
    availability: '24/7',
    isPublic: false,
    interests: 'Overseeing the SkillHub platform.'
};


interface DataContextType {
  users: User[];
  swapRequests: SwapRequest[];
  addUser: (user: User) => void;
  updateUser: (userId: string, data: Partial<User>) => void;
  findUserByEmail: (email: string) => User | undefined;
  addSwapRequest: (request: Omit<SwapRequest, 'id'>) => void;
  updateSwapRequest: (requestId: string, data: Partial<SwapRequest>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([adminUser]);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);

  const addUser = useCallback((user: User) => {
    setUsers(prevUsers => [...prevUsers, user]);
  }, []);

  const updateUser = useCallback((userId: string, data: Partial<User>) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, ...data } : user
      )
    );
  }, []);

  const findUserByEmail = useCallback((email: string) => {
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }, [users]);

  const addSwapRequest = useCallback((request: Omit<SwapRequest, 'id'>) => {
    const newRequest = { ...request, id: `swap-${Date.now()}-${Math.random()}` };
    setSwapRequests(prev => [...prev, newRequest]);
  }, []);

  const updateSwapRequest = useCallback((requestId: string, data: Partial<SwapRequest>) => {
    setSwapRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { ...req, ...data } : req
      )
    );
  }, []);
  
  return (
    <DataContext.Provider value={{ 
        users, 
        swapRequests, 
        addUser, 
        updateUser,
        findUserByEmail,
        addSwapRequest,
        updateSwapRequest
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
