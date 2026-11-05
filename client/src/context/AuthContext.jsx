import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [activeClub, setActiveClub] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/auth/me', {
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        setUser(json.data.user);
        if (json.data.user.memberships && json.data.user.memberships.length > 0) {
          const storedClubId = localStorage.getItem('clubrelay_active_club');
          const matched = json.data.user.memberships.find(
            (m) => m.clubId && m.clubId._id === storedClubId
          );
          setActiveClub(matched ? matched.clubId : json.data.user.memberships[0].clubId);
        }
      } else {
        setUser(null);
        setActiveClub(null);
      }
    } catch (err) {
      console.error('[AuthContext] Failed to fetch current user:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || 'Login failed');
    }
    setUser(json.data.user);
    if (json.data.user.memberships && json.data.user.memberships.length > 0) {
      const firstClub = json.data.user.memberships[0].clubId;
      setActiveClub(firstClub);
      if (firstClub && firstClub._id) {
        localStorage.setItem('clubrelay_active_club', firstClub._id);
      }
    }
    return json.data.user;
  };

  const logout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    setActiveClub(null);
    localStorage.removeItem('clubrelay_active_club');
  };

  const switchClub = (club) => {
    setActiveClub(club);
    if (club && club._id) {
      localStorage.setItem('clubrelay_active_club', club._id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        campus: user?.campusId,
        activeClub,
        memberships: user?.memberships || [],
        loading,
        login,
        logout,
        switchClub,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
