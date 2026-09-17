import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useAuthStore } from '@/stores/authStore';
import AppLayout from '@/layouts/AppLayout';
import { ToastProvider } from '@/components/ui/Toast';

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const IncidentsPage = lazy(() => import('@/pages/IncidentsPage'));
const IncidentDetailsPage = lazy(() => import('@/pages/IncidentDetailsPage'));
const AssignTeamPage = lazy(() => import('@/pages/AssignTeamPage'));
const MapPage = lazy(() => import('@/pages/MapPage'));
const TeamsPage = lazy(() => import('@/pages/TeamsPage'));
const TeamDetailsPage = lazy(() => import('@/pages/TeamDetailsPage'));
const CommunicationPage = lazy(() => import('@/pages/CommunicationPage'));
const ResourcesPage = lazy(() => import('@/pages/ResourcesPage'));
const MedicalPage = lazy(() => import('@/pages/MedicalPage'));
const ReportsPage = lazy(() => import('@/pages/ReportsPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const AlertsPage = lazy(() => import('@/pages/AlertsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const SimulationPage = lazy(() => import('@/pages/SimulationPage'));

function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-secondary">Loading...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function NotFound() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-navy mb-4">404</h1>
        <p className="text-xl text-text-secondary mb-6">Page not found</p>
        <a href="/dashboard" className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors">Go to Dashboard</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/incidents" element={<IncidentsPage />} />
              <Route path="/incidents/:id" element={<IncidentDetailsPage />} />
              <Route path="/incidents/:id/assign" element={<AssignTeamPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/teams/:id" element={<TeamDetailsPage />} />
              <Route path="/communication" element={<CommunicationPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/medical" element={<MedicalPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/simulation" element={<SimulationPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ToastProvider>
  );
}
