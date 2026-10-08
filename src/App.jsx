import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './auth';
import { AppShell, Loading, Logo } from './components';
import {
  ChallengeDetailPage,
  ChallengeListPage,
  CompanyChallengesPage,
  CompanyDashboard,
  CompanyReviewsPage,
  CreateChallengePage,
  LandingPage,
  LoginPage,
  OpportunitiesPage,
  ParticipationsPage,
  ProfilePage,
  RecognitionsPage,
  RegisterChoicePage,
  RegisterPage,
  StudentDashboard,
} from './pages';

function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loading label="Abrindo sua conta..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

function RequireRole({ role }) {
  const { user } = useAuth();
  if (user?.tipo_perfil !== role) {
    return <Navigate to={user?.tipo_perfil === 'empresa' ? '/empresa' : '/app'} replace />;
  }
  return <Outlet />;
}

function PublicExplorerLayout() {
  const { user } = useAuth();
  return (
    <>
      <header className="explorer-bar">
        <Logo />
        <div className="explorer-actions">
          <span>Desafios práticos para desenvolver seu potencial.</span>
          {user
            ? <a className="explorer-account" href={user.tipo_perfil === 'empresa' ? '/empresa' : '/app'}>Meu painel →</a>
            : <a className="explorer-account" href="/login">Entrar →</a>}
        </div>
      </header>
      <main className="public-explorer-content"><Outlet /></main>
      <footer className="landing-footer section-wrap"><span className="footer-brand">talent<span>hub</span></span><span>Talento em ação. Oportunidade em movimento.</span><span>© {new Date().getFullYear()} TalentHub</span></footer>
    </>
  );
}

function NotFoundPage() {
  return (
    <main className="not-found">
      <span className="eyebrow">404 · DESAFIO NÃO ENCONTRADO</span>
      <h1>Esta página ainda não entrou no TalentHub.</h1>
      <p>Volte para o início e encontre uma nova oportunidade.</p>
      <a className="button button-primary" href="/">Voltar para o início →</a>
    </main>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/acessar" element={<RegisterChoicePage />} />
      <Route path="/cadastro/estudante" element={<RegisterPage role="estudante" />} />
      <Route path="/cadastro/empresa" element={<RegisterPage role="empresa" />} />
      <Route element={<PublicExplorerLayout />}>
        <Route path="/app/desafios" element={<ChallengeListPage />} />
        <Route path="/app/desafios/:id" element={<ChallengeDetailPage />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route element={<RequireRole role="estudante" />}>
          <Route path="/app" element={<AppShell />}>
            <Route index element={<StudentDashboard />} />
            <Route path="participacoes" element={<ParticipationsPage />} />
            <Route path="entregas" element={<ParticipationsPage deliveriesOnly />} />
            <Route path="reconhecimentos" element={<RecognitionsPage />} />
            <Route path="oportunidades" element={<OpportunitiesPage />} />
            <Route path="perfil" element={<ProfilePage />} />
          </Route>
        </Route>
        <Route element={<RequireRole role="empresa" />}>
          <Route path="/empresa" element={<AppShell />}>
            <Route index element={<CompanyDashboard />} />
            <Route path="desafios" element={<CompanyChallengesPage />} />
            <Route path="criar-desafio" element={<CreateChallengePage />} />
            <Route path="participantes" element={<CompanyReviewsPage talentsOnly />} />
            <Route path="avaliacoes" element={<CompanyReviewsPage />} />
            <Route path="oportunidades" element={<OpportunitiesPage />} />
            <Route path="perfil" element={<ProfilePage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return <BrowserRouter><AppRoutes /></BrowserRouter>;
}
