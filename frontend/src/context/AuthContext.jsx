import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ner_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error("Token verification failed:", err);
          logout();
        }
      } else {
        // Fallback default demo user (Logistics Coordinator)
        setUser({
          id: 'demo_coord',
          full_name: 'Ananya Sharma',
          email: 'coordinator@ner.gov.in',
          role: 'logistics_coordinator',
          region: 'Assam'
        });
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('ner_token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { access_token, user: createdUser } = res.data;
    localStorage.setItem('ner_token', access_token);
    setToken(access_token);
    setUser(createdUser);
    return createdUser;
  };

  const switchDemoRole = (role) => {
    const roleProfiles = {
      admin: {
        id: 'demo_admin',
        full_name: 'Tenzing Norbu',
        email: 'admin@ner.gov.in',
        role: 'admin',
        region: 'Arunachal Pradesh'
      },
      logistics_coordinator: {
        id: 'demo_coord',
        full_name: 'Ananya Sharma',
        email: 'coordinator@ner.gov.in',
        role: 'logistics_coordinator',
        region: 'Assam'
      },
      field_driver: {
        id: 'demo_driver',
        full_name: 'Rajesh Jamatia',
        email: 'driver@ner.gov.in',
        role: 'field_driver',
        region: 'Tripura'
      },
      regional_observer: {
        id: 'demo_obs',
        full_name: 'Lalthan Pachuau',
        email: 'observer@ner.gov.in',
        role: 'regional_observer',
        region: 'Mizoram'
      }
    };
    if (roleProfiles[role]) {
      setUser(roleProfiles[role]);
    }
  };

  const logout = () => {
    localStorage.removeItem('ner_token');
    setToken(null);
    setUser({
      id: 'guest',
      full_name: 'Guest Regional Observer',
      email: 'guest@ner.local',
      role: 'regional_observer',
      region: 'NER'
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, switchDemoRole, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
