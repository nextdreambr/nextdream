import { createBrowserRouter } from 'react-router';

// Root layout (provides AppContext to ALL routes)
import { RootLayout } from './components/layout/RootLayout';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { PatientLayout } from './components/layout/PatientLayout';
import { SupporterLayout } from './components/layout/SupporterLayout';
import { InstitutionLayout } from './components/layout/InstitutionLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Public pages
import Landing from './pages/Landing';
import HowItWorks from './pages/HowItWorks';
import Security from './pages/Security';
import FAQ from './pages/FAQ';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Guidelines from './pages/Guidelines';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProfileSelect from './pages/auth/ProfileSelect';
import ForgotPassword from './pages/auth/ForgotPassword';
import AcceptAdminInvite from './pages/auth/AcceptAdminInvite';
import AcceptPatientInvite from './pages/auth/AcceptPatientInvite';
import NotFound from './pages/NotFound';
import PublicDreamDetail from './pages/PublicDreamDetail';
import Contact from './pages/Contact';
import Partnerships from './pages/Partnerships';

// Onboarding
import PatientOnboarding from './pages/onboarding/PatientOnboarding';
import SupporterOnboarding from './pages/onboarding/SupporterOnboarding';
// Dream completion (standalone - fullscreen celebration)
import DreamCompletion from './pages/patient/DreamCompletion';

// Patient pages
import PatientDashboard from './pages/patient/PatientDashboard';
import CreateDream from './pages/patient/CreateDream';
import MyDreams from './pages/patient/MyDreams';
import DreamDetail from './pages/patient/DreamDetail';
import PatientProposals from './pages/patient/PatientProposals';
import PatientChat from './pages/patient/PatientChat';
import PatientProfile from './pages/patient/PatientProfile';
import PatientNotifications from './pages/patient/PatientNotifications';

// Supporter pages
import SupporterDashboard from './pages/supporter/SupporterDashboard';
import ExploreDreams from './pages/supporter/ExploreDreams';
import SupporterDreamDetail from './pages/supporter/SupporterDreamDetail';
import MyProposals from './pages/supporter/MyProposals';
import SupporterChat from './pages/supporter/SupporterChat';
import SupporterProfile from './pages/supporter/SupporterProfile';
import SupporterNotifications from './pages/supporter/SupporterNotifications';

// Institution pages
import InstitutionDashboard from './pages/institution/InstitutionDashboard';
import InstitutionPatients from './pages/institution/InstitutionPatients';
import InstitutionPatientDetail from './pages/institution/InstitutionPatientDetail';
import InstitutionDreams from './pages/institution/InstitutionDreams';
import InstitutionCreateDream from './pages/institution/InstitutionCreateDream';
import InstitutionProposals from './pages/institution/InstitutionProposals';
import InstitutionChat from './pages/institution/InstitutionChat';
import InstitutionNotifications from './pages/institution/InstitutionNotifications';
import InstitutionProfile from './pages/institution/InstitutionProfile';

// Admin pages
import AdminOverview from './pages/admin/AdminOverview';
import AdminAdmins from './pages/admin/AdminAdmins';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDreams from './pages/admin/AdminDreams';
import AdminProposals from './pages/admin/AdminProposals';
import AdminMessages from './pages/admin/AdminMessages';
import AdminChats from './pages/admin/AdminChats';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';
import AdminAudit from './pages/admin/AdminAudit';
import AdminEmailTemplates from './pages/admin/AdminEmailTemplates';

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      // Public routes
      {
        path: '/',
        Component: PublicLayout,
        children: [
          { index: true, Component: Landing },
          { path: 'como-funciona', Component: HowItWorks },
          { path: 'seguranca', Component: Security },
          { path: 'faq', Component: FAQ },
          { path: 'termos', Component: Terms },
          { path: 'privacidade', Component: Privacy },
          { path: 'diretrizes', Component: Guidelines },
          { path: 'login', Component: Login },
          { path: 'cadastro', Component: Register },
          { path: 'selecionar-perfil', Component: ProfileSelect },
          { path: 'esqueci-senha', Component: ForgotPassword },
          { path: 'aceitar-convite-admin', Component: AcceptAdminInvite },
          { path: 'aceitar-convite-paciente', Component: AcceptPatientInvite },
          { path: 'sonhos/:id', Component: PublicDreamDetail },
          { path: 'contato', Component: Contact },
          { path: 'parcerias', Component: Partnerships },
          { path: '*', Component: NotFound },
        ],
      },
      // Onboarding (standalone)
      { path: '/onboarding/paciente', Component: PatientOnboarding },
      { path: '/onboarding/apoiador', Component: SupporterOnboarding },
      // Dream completion (standalone - fullscreen celebration)
      { path: '/paciente/sonhos/:id/concluido', Component: DreamCompletion },
      // Patient routes
      {
        path: '/paciente',
        Component: PatientLayout,
        children: [
          { index: true, Component: PatientDashboard },
          { path: 'dashboard', Component: PatientDashboard },
          { path: 'sonhos', Component: MyDreams },
          { path: 'sonhos/criar', Component: CreateDream },
          { path: 'sonhos/editar/:id', Component: CreateDream },
          { path: 'sonhos/:id', Component: DreamDetail },
          { path: 'propostas', Component: PatientProposals },
          { path: 'chat', Component: PatientChat },
          { path: 'perfil', Component: PatientProfile },
          { path: 'notificacoes', Component: PatientNotifications },
          { path: '*', Component: NotFound },
        ],
      },
      // Supporter routes
      {
        path: '/apoiador',
        Component: SupporterLayout,
        children: [
          { index: true, Component: SupporterDashboard },
          { path: 'dashboard', Component: SupporterDashboard },
          { path: 'explorar', Component: ExploreDreams },
          { path: 'sonhos/:id', Component: SupporterDreamDetail },
          { path: 'propostas', Component: MyProposals },
          { path: 'chat', Component: SupporterChat },
          { path: 'perfil', Component: SupporterProfile },
          { path: 'notificacoes', Component: SupporterNotifications },
          { path: '*', Component: NotFound },
        ],
      },
      // Institution routes
      {
        path: '/instituicao',
        Component: InstitutionLayout,
        children: [
          { index: true, Component: InstitutionDashboard },
          { path: 'dashboard', Component: InstitutionDashboard },
          { path: 'pacientes', Component: InstitutionPatients },
          { path: 'pacientes/:managedPatientId', Component: InstitutionPatientDetail },
          { path: 'sonhos', Component: InstitutionDreams },
          { path: 'sonhos/criar', Component: InstitutionCreateDream },
          { path: 'sonhos/editar/:id', Component: InstitutionCreateDream },
          { path: 'propostas', Component: InstitutionProposals },
          { path: 'chat', Component: InstitutionChat },
          { path: 'notificacoes', Component: InstitutionNotifications },
          { path: 'perfil', Component: InstitutionProfile },
          { path: '*', Component: NotFound },
        ],
      },
      // Admin routes
      {
        path: '/admin',
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminOverview },
          { path: 'usuarios', Component: AdminUsers },
          { path: 'admins', Component: AdminAdmins },
          { path: 'sonhos', Component: AdminDreams },
          { path: 'propostas', Component: AdminProposals },
          { path: 'mensagens', Component: AdminMessages },
          { path: 'chats', Component: AdminChats },
          { path: 'denuncias', Component: AdminReports },
          { path: 'configuracoes', Component: AdminSettings },
          { path: 'auditoria', Component: AdminAudit },
          { path: 'emails', Component: AdminEmailTemplates },
          { path: '*', Component: NotFound },
        ],
      },
    ],
  },
]);
