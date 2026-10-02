import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useSession } from './auth/useSession';
import { useProfile } from './auth/useProfile';
import { panelAccess } from './auth/access';
import { supabase } from './lib/supabaseClient';
import HotelProfilesPage from './pages/HotelProfilesPage';
import HotelPanel from './pages/HotelPanel';
import CommissionCollectionsPage from './pages/CommissionCollectionsPage';
import FinanceDashboard from './pages/FinanceDashboard';
import AccountPage from './pages/AccountPage';
import LoginPage from './auth/LoginPage';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { TABLES } from './config/tables';

import Dashboard from './pages/Dashboard';
import AccommodationsPage from './pages/AccommodationsPage';
import HostsPage from './pages/HostsPage';
import RoomsPage from './pages/RoomsPage';
import HostAccountsPage from './pages/HostAccountsPage';
import AccommodationHostsPage from './pages/AccommodationHostsPage';
import AccommodationPoliciesPage from './pages/AccommodationPoliciesPage';
import MotorcyclesPage from './pages/MotorcyclesPage';
import BoatRoutesPage from './pages/BoatRoutesPage';
import BoatOperatorsPage from './pages/BoatOperatorsPage';
import BoatSchedulesPage from './pages/BoatSchedulesPage';
import LandTransportRoutesPage from './pages/LandTransportRoutesPage';
import LandTransportSchedulesPage from './pages/LandTransportSchedulesPage';
import ExperiencesPage from './pages/ExperiencesPage';
import TourGuidesPage from './pages/TourGuidesPage';
import DestinationsPage from './pages/DestinationsPage';
import TravelGuidesPage from './pages/TravelGuidesPage';
import EventsPage from './pages/EventsPage';
import BlogCategoriesPage from './pages/BlogCategoriesPage';
import BlogPostsPage from './pages/BlogPostsPage';
import PagesPage from './pages/PagesPage';
import HomepageBannersPage from './pages/HomepageBannersPage';
import BenefitsPage from './pages/BenefitsPage';
import CampaignsPage from './pages/CampaignsPage';
import AdsPage from './pages/AdsPage';
import NewslettersPage from './pages/NewslettersPage';
import SeoEntriesPage from './pages/SeoEntriesPage';
import MediaAssetsPage from './pages/MediaAssetsPage';
import RequestsPage from './pages/RequestsPage';
import ReservationsPage from './pages/ReservationsPage';
import ProfilesPage from './pages/ProfilesPage';
import SiteSettingsPage from './pages/SiteSettingsPage';
import ContactMessagesPage from './pages/ContactMessagesPage';
import FinanceTransactionsPage from './pages/FinanceTransactionsPage';
import AutomationRulesPage from './pages/AutomationRulesPage';
import AutomationLogsPage from './pages/AutomationLogsPage';
import AnalyticsEventsPage from './pages/AnalyticsEventsPage';
import ConversionFunnelEventsPage from './pages/ConversionFunnelEventsPage';
import AuditLogsPage from './pages/AuditLogsPage';

function LoadingScreen() {
  return (
    <div className="ro-splash">
      <Loader2 size={22} className="ro-spin" />
      <span>Cargando Centro de Operaciones…</span>
    </div>
  );
}

function CurrentTopbar({ onOpenSidebar, userEmail }) {
  const location = useLocation();
  const table = TABLES.find((t) => t.path === location.pathname);
  const title = location.pathname === '/finanzas' ? 'Dashboard de finanzas' : location.pathname === '/alojamiento/host-accounts' ? 'Anfitriones e invitaciones' : location.pathname === '/finanzas/collections' ? 'Comisiones y cobros' : location.pathname === '/cuenta' ? 'Mi cuenta' : location.pathname === '/alojamiento/hotel-profiles' ? 'Perfiles de alojamientos' : table ? table.label : 'Inicio';
  const subtitle = table
    ? table.readOnly
      ? 'Registro de solo lectura'
      : 'Gestiona el contenido y la operación de Reserva Ometepe'
    : 'Resumen general de Reserva Ometepe';
  return <Topbar title={title} subtitle={subtitle} userEmail={userEmail} onOpenSidebar={onOpenSidebar} />;
}

export default function App() {
  const session = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const profileState = useProfile(session);

  if (session === undefined) return <LoadingScreen />;
  if (!session) return <LoginPage />;
  if (profileState.loading) return <LoadingScreen />;
  const access = panelAccess(profileState.profile);
  if (profileState.error || access === 'denied') return <div className="ro-login-screen"><div className="ro-login-card">
    <h1>Acceso al panel</h1><p role="alert">{profileState.error || 'Tu cuenta está inactiva o no tiene permisos para este panel.'}</p>
    <button className="ro-btn ro-btn-primary" onClick={profileState.retry}>Reintentar</button>
    <button className="ro-btn ro-btn-ghost" onClick={() => supabase.auth.signOut()}>Cerrar sesión</button>
  </div></div>;
  if (access === 'host') return <div className="ro-owner-app">
    <Topbar title="Panel de mi alojamiento" subtitle="Reserva Ometepe" userEmail={session.user.email} />
    <main className="ro-content"><Routes>
      <Route path="/cuenta" element={<AccountPage />} />
      <Route path="/mi-hotel" element={<HotelPanel key={session.user.id} userId={session.user.id} />} />
      <Route path="*" element={<Navigate to="/mi-hotel" replace />} />
    </Routes></main>
  </div>;

  return (
    <div className="ro-app">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="ro-main">
        <CurrentTopbar onOpenSidebar={() => setSidebarOpen(true)} userEmail={session?.user?.email} />
        <main className="ro-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cuenta" element={<AccountPage />} />
            <Route path="/alojamiento/hotel-profiles" element={<Navigate to="/alojamiento/accommodations" replace />} />
            <Route path="/alojamiento/rooms" element={<RoomsPage />} />
            <Route path="/alojamiento/accommodations" element={<AccommodationsPage />} />
            <Route path="/alojamiento/hosts" element={<HostsPage />} />
            <Route path="/alojamiento/host-accounts" element={<Navigate to="/alojamiento/accommodations?section=hosts" replace />} />
            <Route path="/alojamiento/accommodation-hosts" element={<AccommodationHostsPage />} />
            <Route path="/alojamiento/policies" element={<AccommodationPoliciesPage />} />
            <Route path="/movilidad/motorcycles" element={<MotorcyclesPage />} />
            <Route path="/movilidad/boat-routes" element={<BoatRoutesPage />} />
            <Route path="/movilidad/boat-operators" element={<BoatOperatorsPage />} />
            <Route path="/movilidad/boat-schedules" element={<BoatSchedulesPage />} />
            <Route path="/movilidad/land-routes" element={<LandTransportRoutesPage />} />
            <Route path="/movilidad/land-schedules" element={<LandTransportSchedulesPage />} />
            <Route path="/contenido/experiences" element={<ExperiencesPage />} />
            <Route path="/contenido/tour-guides" element={<TourGuidesPage />} />
            <Route path="/contenido/destinations" element={<DestinationsPage />} />
            <Route path="/contenido/travel-guides" element={<TravelGuidesPage />} />
            <Route path="/contenido/events" element={<EventsPage />} />
            <Route path="/contenido/blog-categories" element={<BlogCategoriesPage />} />
            <Route path="/contenido/blog-posts" element={<BlogPostsPage />} />
            <Route path="/contenido/pages" element={<PagesPage />} />
            <Route path="/marketing/homepage-banners" element={<HomepageBannersPage />} />
            <Route path="/marketing/benefits" element={<BenefitsPage />} />
            <Route path="/marketing/campaigns" element={<CampaignsPage />} />
            <Route path="/marketing/ads" element={<AdsPage />} />
            <Route path="/marketing/newsletters" element={<NewslettersPage />} />
            <Route path="/marketing/seo" element={<SeoEntriesPage />} />
            <Route path="/marketing/media" element={<MediaAssetsPage />} />
            <Route path="/ventas/requests" element={<RequestsPage />} />
            <Route path="/ventas/reservations" element={<ReservationsPage />} />
            <Route path="/config/profiles" element={<ProfilesPage />} />
            <Route path="/config/site-settings" element={<SiteSettingsPage />} />
            <Route path="/config/contact-messages" element={<ContactMessagesPage />} />
            <Route path="/finanzas" element={<FinanceDashboard />} />
            <Route path="/finanzas/collections" element={<CommissionCollectionsPage />} />
            <Route path="/finanzas/transactions" element={<FinanceTransactionsPage />} />
            <Route path="/finanzas/automation-rules" element={<AutomationRulesPage />} />
            <Route path="/finanzas/automation-logs" element={<AutomationLogsPage />} />
            <Route path="/analitica/events" element={<AnalyticsEventsPage />} />
            <Route path="/analitica/funnel" element={<ConversionFunnelEventsPage />} />
            <Route path="/analitica/audit" element={<AuditLogsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
