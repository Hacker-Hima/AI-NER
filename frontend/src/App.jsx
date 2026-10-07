import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DisclaimerBanner } from './components/layout/DisclaimerBanner';
import { Navbar } from './components/layout/Navbar';

// Pages
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { ShipmentsPage } from './pages/Shipments/ShipmentsPage';
import { RoutePlannerPage } from './pages/RoutePlanner/RoutePlannerPage';
import { IncidentsPage } from './pages/Incidents/IncidentsPage';
import { AnalyticsPage } from './pages/Analytics/AnalyticsPage';

export function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
          {/* SIH Educational Prototype Disclaimer */}
          <DisclaimerBanner />
          
          {/* Main Top Navigation */}
          <Navbar />

          {/* Page Body Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/shipments" element={<ShipmentsPage />} />
              <Route path="/routes" element={<RoutePlannerPage />} />
              <Route path="/incidents" element={<IncidentsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 space-y-1">
              <p className="font-medium text-slate-400">
                Project NER — AI-Based Smart Logistics & Accessibility Intelligence Platform for North Eastern Region
              </p>
              <p>
                Inspired by the Smart India Hackathon (SIH) Problem Statement. Educational prototype designed with React, FastAPI, MongoDB & Scikit-learn.
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
