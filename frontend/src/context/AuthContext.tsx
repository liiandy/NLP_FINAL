import React, { createContext, useState, useEffect } from 'react';

export interface AuthContextProps {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  refreshUser: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  setUser: () => {},
  refreshUser: () => {},
  logout: () => {}
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState(null);

  const refreshUser = () => {
    const token = localStorage.getItem('token');
    console.log('refreshUser token:', token);
    if (token) {
      fetch('/api/v1/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then((res) => res.json())
      .then((data) => {
        console.log('refreshUser /api/auth/me 回傳:', data);
        if (data && data.user) {
          const userData = data.user;
          // 若後端未提供 avatar 或 username 則以預設值替代
          userData.avatar = userData.avatar || localStorage.getItem('userAvatar') || '/default_avatar.png';
          userData.username = userData.username || localStorage.getItem('userName') || '使用者名稱';
          setUser(userData);
        }
      })
      .catch((err) => console.error('Failed to refresh user:', err));
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userAvatar');
    localStorage.removeItem('userName');
    setUser(null);
  };

  // 初始化時呼叫 refreshUser
  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
