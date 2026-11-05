import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { CampusDashboard } from './pages/CampusDashboard';
import { ClubDashboard } from './pages/ClubDashboard';
import { EventsList } from './pages/EventsList';
import { EventDetail } from './pages/EventDetail';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { Directory } from './pages/Directory';
import { Decisions } from './pages/Decisions';
import { HandoverCenter } from './pages/HandoverCenter';
import { FacultyApprovals } from './pages/FacultyApprovals';
import { AnnualReports } from './pages/AnnualReports';
import { Members } from './pages/Members';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center text-xs text-charcoal-500 font-medium">
        Verifying session…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />

              {/* Protected Application Workspace */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/campus" replace />} />
                <Route path="campus" element={<CampusDashboard />} />
                <Route path="faculty/approvals" element={<FacultyApprovals />} />
                <Route path="clubs/:clubId" element={<ClubDashboard />} />
                <Route path="clubs/:clubId/events" element={<EventsList />} />
                <Route path="clubs/:clubId/events/:eventId" element={<EventDetail />} />
                <Route path="clubs/:clubId/memory" element={<KnowledgeBase />} />
                <Route path="clubs/:clubId/directory" element={<Directory />} />
                <Route path="clubs/:clubId/decisions" element={<Decisions />} />
                <Route path="clubs/:clubId/handover" element={<HandoverCenter />} />
                <Route path="clubs/:clubId/reports" element={<AnnualReports />} />
                <Route path="clubs/:clubId/members" element={<Members />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

