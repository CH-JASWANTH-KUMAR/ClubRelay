import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [activeClub, setActiveClub] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/auth/me', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        setUser(json.data.user);
        if (json.data.user.memberships && json.data.user.memberships.length > 0) {
          const serverActiveId = json.data.user.lastActiveClubId;
          const storedClubId = localStorage.getItem('clubrelay_active_club');
          const matched =
            json.data.user.memberships.find((m) => m.clubId && m.clubId._id === serverActiveId) ||
            json.data.user.memberships.find((m) => m.clubId && m.clubId._id === storedClubId);
          setActiveClub(matched ? matched.clubId : json.data.user.memberships[0].clubId);
        } else {
          setActiveClub(null);
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
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || 'Login failed');
    }
    setUser(json.data.user);
    if (json.data.user.memberships && json.data.user.memberships.length > 0) {
      const serverActiveId = json.data.user.lastActiveClubId;
      const storedClubId = localStorage.getItem('clubrelay_active_club');
      const matched =
        json.data.user.memberships.find((m) => m.clubId && m.clubId._id === serverActiveId) ||
        json.data.user.memberships.find((m) => m.clubId && m.clubId._id === storedClubId);
      const chosenClub = matched ? matched.clubId : json.data.user.memberships[0].clubId;
      setActiveClub(chosenClub);
      if (chosenClub && chosenClub._id) {
        localStorage.setItem('clubrelay_active_club', chosenClub._id);
      }
    } else {
      setActiveClub(null);
      localStorage.removeItem('clubrelay_active_club');
    }
    return json.data.user;
  };

  const register = async ({ fullName, email, password, accountType }) => {
    const res = await fetch('/api/v1/auth/register', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName,
        email,
        password,
        ...(accountType ? { accountType } : {}),
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || 'Could not create account');
    }
    return json;
  };

  const logout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' });
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
      fetch('/api/v1/auth/active-club', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubId: club._id }),
      }).catch(() => {});
    }
  };

  const getMembershipForClub = useCallback(
    (targetClubId) => {
      const cid = targetClubId || activeClub?._id || user?.memberships?.[0]?.clubId?._id;
      if (!cid || !user?.memberships) return null;
      return user.memberships.find((m) => (m.clubId?._id || m.clubId) === cid) || null;
    },
    [user, activeClub]
  );

  const hasClubCapability = useCallback(
    (capability, targetClubId) => {
      if (!user) return false;
      if (user.campusRole === 'CAMPUS_ADMIN') return true;
      const membership = getMembershipForClub(targetClubId);
      if (!membership) return false;
      if (Array.isArray(membership.capabilities)) {
        return membership.capabilities.includes(capability);
      }
      // Fallback for unit-test mocks without explicit capabilities array
      const role = membership.clubRole;
      if (role === 'PRESIDENT') return true;
      if (role === 'SECRETARY') return capability !== 'club.transfer_ownership';
      if (role === 'CORE_TEAM') {
        return !['members.manage', 'club.transfer_ownership', 'club.manage_settings', 'decisions.record'].includes(capability);
      }
      return capability.endsWith('.view') || capability === 'club.view_overview';
    },
    [user, getMembershipForClub]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        campus: user?.campusId,
        activeClub,
        memberships: user?.memberships || [],
        draftClubs: user?.draftClubs || [],
        pendingInvitationsCount: user?.pendingInvitationsCount || 0,
        loading,
        login,
        register,
        logout,
        switchClub,
        getMembershipForClub,
        hasClubCapability,
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
