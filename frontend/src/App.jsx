import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Sidebar, Topbar } from './components/layout/Navbar';

// Core Platform Pages
import { LoginPage } from './pages/Login/LoginPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { ShipmentsPage } from './pages/Shipments/ShipmentsPage';
import { FleetPage } from './pages/Fleet/FleetPage';
import { RoutePlannerPage } from './pages/RoutePlanner/RoutePlannerPage';
import { IncidentsPage } from './pages/Incidents/IncidentsPage';
import { EmergencyPage } from './pages/Emergency/EmergencyPage';
import { AnalyticsPage } from './pages/Analytics/AnalyticsPage';
import { ReportsPage } from './pages/Reports/ReportsPage';
import { DriverPage } from './pages/Driver/DriverPage';
import { ObserverPage } from './pages/Observer/ObserverPage';

// Topbar Metadata Map
const PAGE_META = {
  '/': { title: 'Regional Command Center', subtitle: 'Live GIS monitoring, corridor risk & fleet telemetry' },
  '/shipments': { title: 'Supply Shipments', subtitle: 'Essential goods tracking, GPS simulation & rerouting' },
  '/fleet': { title: 'Fleet Monitoring', subtitle: 'Real-time vehicle telemetry, pilot communications & speeds' },
  '/routes': { title: 'Route Intelligence', subtitle: 'AI-powered safe alternative bypass planning' },
  '/incidents': { title: 'Disruption Board', subtitle: 'Crowdsourced hazard reports & incident management' },
  '/emergency': { title: 'Emergency Operations Center', subtitle: 'Crisis response protocols, priority shipments & escorts' },
  '/analytics': { title: 'AI Analytics & Risk Sandbox', subtitle: 'Random Forest risk scoring & parameter simulation' },
  '/reports': { title: 'Reports & Audits', subtitle: 'Regional transit compliance, reliability rate & summaries' },
  '/driver': { title: 'Pilot Convoy Cockpit', subtitle: 'Mountain navigation, checkpoint tracking & hazard submission' },
  '/observer': { title: 'Regional Observer Command', subtitle: 'District accessibility surveillance & ground verification' },
};

// Protected layout wrapper
const ProtectedLayout = ({ children, path }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f8fafc', flexDirection: 'column', gap: 16
      }}>
        <div style={{
          width: 44, height: 44,
          border: '3px solid #e2e8f0',
          borderTop: '3px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ color: '#64748b', fontSize: 13, fontWeight: '600' }}>Initializing NER LogiFlow...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const meta = PAGE_META[path] || { title: 'NER LogiFlow', subtitle: 'Regional Logistics Command' };

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Topbar title={meta.title} subtitle={meta.subtitle} />
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

// Public route wrapper — redirects if already authenticated
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) {
    if (user?.role === 'field_driver') return <Navigate to="/driver" replace />;
    if (user?.role === 'regional_observer') return <Navigate to="/observer" replace />;
    return <Navigate to="/" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />

      <Route path="/" element={
        <ProtectedLayout path="/">
          <DashboardPage />
        </ProtectedLayout>
      } />

      <Route path="/shipments" element={
        <ProtectedLayout path="/shipments">
          <ShipmentsPage />
        </ProtectedLayout>
      } />

      <Route path="/fleet" element={
        <ProtectedLayout path="/fleet">
          <FleetPage />
        </ProtectedLayout>
      } />

      <Route path="/routes" element={
        <ProtectedLayout path="/routes">
          <RoutePlannerPage />
        </ProtectedLayout>
      } />

      <Route path="/incidents" element={
        <ProtectedLayout path="/incidents">
          <IncidentsPage />
        </ProtectedLayout>
      } />

      <Route path="/emergency" element={
        <ProtectedLayout path="/emergency">
          <EmergencyPage />
        </ProtectedLayout>
      } />

      <Route path="/analytics" element={
        <ProtectedLayout path="/analytics">
          <AnalyticsPage />
        </ProtectedLayout>
      } />

      <Route path="/reports" element={
        <ProtectedLayout path="/reports">
          <ReportsPage />
        </ProtectedLayout>
      } />

      <Route path="/driver" element={
        <ProtectedLayout path="/driver">
          <DriverPage />
        </ProtectedLayout>
      } />

      <Route path="/observer" element={
        <ProtectedLayout path="/observer">
          <ObserverPage />
        </ProtectedLayout>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
