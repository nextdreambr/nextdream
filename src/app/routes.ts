import { createBrowserRouter } from 'react-router';
import type { RouteObject } from 'react-router';

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
import SandboxAccess from './pages/SandboxAccess';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProfileSelect from './pages/auth/ProfileSelect';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import AcceptAdminInvite from './pages/auth/AcceptAdminInvite';
import AcceptPatientInvite from './pages/auth/AcceptPatientInvite';
import NotFound from './pages/NotFound';
import PublicDreamDetail from './pages/PublicDreamDetail';
import Contact from './pages/Contact';
import Partnerships from './pages/Partnerships';
import {
  CreateDreamConceptA,
  CreateDreamConceptB,
  CreateDreamConceptC,
} from './pages/concepts/CreateDreamConcepts';
import { getLocalePrefix, supportedLocales, type SupportedLocale } from './i18n/locale';
import { publicSlug } from './i18n/routes';

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
import AdminDreamDetailPage from './pages/admin/AdminDreamDetailPage';
import AdminProposals from './pages/admin/AdminProposals';
import AdminProposalDetailPage from './pages/admin/AdminProposalDetailPage';
import AdminMessages from './pages/admin/AdminMessages';
import AdminChats from './pages/admin/AdminChats';
import AdminReports from './pages/admin/AdminReports';
import AdminReportDetailPage from './pages/admin/AdminReportDetailPage';
import AdminEmailTemplates from './pages/admin/AdminEmailTemplates';
import AdminSettings from './pages/admin/AdminSettings';
import AdminAudit from './pages/admin/AdminAudit';

const createPublicChildren = (locale: SupportedLocale | null): RouteObject[] => {
  const slug = (key: Parameters<typeof publicSlug>[0]) => locale ? publicSlug(key, locale) : publicSlug(key, 'pt-BR');

  return [
    { index: true, Component: Landing },
    { path: slug('howItWorks'), Component: HowItWorks },
    { path: slug('security'), Component: Security },
    { path: slug('faq'), Component: FAQ },
    { path: slug('terms'), Component: Terms },
    { path: slug('privacy'), Component: Privacy },
    { path: slug('guidelines'), Component: Guidelines },
    { path: slug('sandbox'), Component: SandboxAccess },
    { path: slug('login'), Component: Login },
    { path: slug('register'), Component: Register },
    { path: slug('profileSelect'), Component: ProfileSelect },
    { path: slug('forgotPassword'), Component: ForgotPassword },
    { path: slug('resetPassword'), Component: ResetPassword },
    { path: slug('verifyEmail'), Component: VerifyEmail },
    { path: slug('acceptAdminInvite'), Component: AcceptAdminInvite },
    { path: slug('acceptPatientInvite'), Component: AcceptPatientInvite },
    { path: `${slug('publicDream')}/:id`, Component: PublicDreamDetail },
    { path: slug('contact'), Component: Contact },
    { path: slug('partnerships'), Component: Partnerships },
    { path: 'concept-a/paciente/sonhos/criar', Component: CreateDreamConceptA },
    { path: 'concept-b/paciente/sonhos/criar', Component: CreateDreamConceptB },
    { path: 'concept-c/paciente/sonhos/criar', Component: CreateDreamConceptC },
    { path: '*', Component: NotFound },
  ];
};

const createPatientChildren = (): RouteObject[] => [
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
];

const createSupporterChildren = (): RouteObject[] => [
  { index: true, Component: SupporterDashboard },
  { path: 'dashboard', Component: SupporterDashboard },
  { path: 'explorar', Component: ExploreDreams },
  { path: 'sonhos/:id', Component: SupporterDreamDetail },
  { path: 'propostas', Component: MyProposals },
  { path: 'chat', Component: SupporterChat },
  { path: 'perfil', Component: SupporterProfile },
  { path: 'notificacoes', Component: SupporterNotifications },
  { path: '*', Component: NotFound },
];

const createInstitutionChildren = (): RouteObject[] => [
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
];

const localizedRoutes = supportedLocales.flatMap<RouteObject>((locale) => {
  const prefix = getLocalePrefix(locale);

  return [
    {
      path: prefix,
      Component: PublicLayout,
      children: createPublicChildren(locale),
    },
    { path: `${prefix}/onboarding/paciente`, Component: PatientOnboarding },
    { path: `${prefix}/onboarding/apoiador`, Component: SupporterOnboarding },
    { path: `${prefix}/paciente/sonhos/:id/concluido`, Component: DreamCompletion },
    {
      path: `${prefix}/paciente`,
      Component: PatientLayout,
      children: createPatientChildren(),
    },
    {
      path: `${prefix}/apoiador`,
      Component: SupporterLayout,
      children: createSupporterChildren(),
    },
    {
      path: `${prefix}/instituicao`,
      Component: InstitutionLayout,
      children: createInstitutionChildren(),
    },
  ];
});

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      // Public routes
      {
        path: '/',
        Component: PublicLayout,
        children: createPublicChildren(null),
      },
      ...localizedRoutes,
      // Onboarding (standalone)
      { path: '/onboarding/paciente', Component: PatientOnboarding },
      { path: '/onboarding/apoiador', Component: SupporterOnboarding },
      // Dream completion (standalone - fullscreen celebration)
      { path: '/paciente/sonhos/:id/concluido', Component: DreamCompletion },
      // Patient routes
      {
        path: '/paciente',
        Component: PatientLayout,
        children: createPatientChildren(),
      },
      // Supporter routes
      {
        path: '/apoiador',
        Component: SupporterLayout,
        children: createSupporterChildren(),
      },
      // Institution routes
      {
        path: '/instituicao',
        Component: InstitutionLayout,
        children: createInstitutionChildren(),
      },
      // Admin routes
      {
        path: '/admin',
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminOverview },
          { path: 'usuarios', Component: AdminUsers },
          { path: 'usuarios/:userId', Component: AdminUsers },
          { path: 'admins', Component: AdminAdmins },
          { path: 'admins/:adminId', Component: AdminAdmins },
          { path: 'sonhos', Component: AdminDreams },
          { path: 'sonhos/:dreamId', Component: AdminDreamDetailPage },
          { path: 'propostas', Component: AdminProposals },
          { path: 'propostas/:proposalId', Component: AdminProposalDetailPage },
          { path: 'mensagens', Component: AdminMessages },
          { path: 'mensagens/:messageId', Component: AdminMessages },
          { path: 'chats', Component: AdminChats },
          { path: 'chats/:chatId', Component: AdminChats },
          { path: 'denuncias', Component: AdminReports },
          { path: 'denuncias/:reportId', Component: AdminReportDetailPage },
          { path: 'email-templates', Component: AdminEmailTemplates },
          { path: 'configuracoes', Component: AdminSettings },
          { path: 'auditoria', Component: AdminAudit },
          { path: '*', Component: NotFound },
        ],
      },
    ],
  },
]);
