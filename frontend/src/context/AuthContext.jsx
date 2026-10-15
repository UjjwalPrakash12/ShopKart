import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCustomerProfile, logoutCustomer } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const data = await getCustomerProfile();
      // Supports both wrapped { customer: {...} } and direct { _id, fullName, ... } formats
      const customerData = data?.customer || (data?._id ? data : null);
      if (customerData) {
        setUser(customerData);
        return customerData;
      } else {
        setUser(null);
        localStorage.removeItem('shopkart_token');
        return null;
      }
    } catch (err) {
      // 401 or network error indicates unauthenticated user
      setUser(null);
      localStorage.removeItem('shopkart_token');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = (payload) => {
    if (payload?.token) {
      localStorage.setItem('shopkart_token', payload.token);
    }
    const customerData = payload?.customer || (payload?._id ? payload : null);
    if (customerData) {
      setUser(customerData);
    }
  };

  const logout = async () => {
    try {
      await logoutCustomer();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('shopkart_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        customer: user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        refreshUser: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
