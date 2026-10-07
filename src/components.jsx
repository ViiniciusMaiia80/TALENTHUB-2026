import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Compass,
  FileBadge,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Target,
  Trophy,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { api } from './api';
import { useAuth } from './auth';

export const iconMap = {
  dashboard: LayoutDashboard,
  challenges: Compass,
  participations: ClipboardCheck,
  deliveries: FileText,
  recognitions: Award,
  opportunities: BriefcaseBusiness,
  profile: UserRound,
  company: Building2,
  participants: UsersRound,
  reviews: ClipboardCheck,
  talents: Sparkles,
};

export function Logo({ light = false, compact = false }) {
  return (
    <Link className={`brand ${light ? 'brand-light' : ''}`} to="/" aria-label="TalentHub — início">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 36 36" fill="none">
          <path d="M5 24.5 14.4 8l5.1 9 3.4-5.8L31 27H16.8l-3-5.2-3 5.2H5Z" fill="currentColor" />
          <circle cx="26.7" cy="8.5" r="3.4" fill="currentColor" opacity=".62" />
        </svg>
      </span>
      {!compact && <span>talent<span className="brand-accent">hub</span></span>}
    </Link>
  );
}

export function Button({ children, variant = 'primary', className = '', icon: Icon, ...props }) {
  return (
    <button className={`button button-${variant} ${className}`} {...props}>
      {children}
      {Icon && <Icon size={17} strokeWidth={2} aria-hidden="true" />}
    </button>
  );
}

export function LinkButton({ to, children, variant = 'primary', icon: Icon, className = '', ...props }) {
  return (
    <Link className={`button button-${variant} ${className}`} to={to} {...props}>
      {children}
      {Icon && <Icon size={17} strokeWidth={2} aria-hidden="true" />}
    </Link>
  );
}

export function Field({ label, className = '', hint, as, ...props }) {
  return (
    <label className={`field ${className}`}>
      <span className="field-label">{label}</span>
      {as === 'textarea' ? (
        <textarea {...props} />
      ) : (
        <input {...props} />
      )}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export function SelectField({ label, options, ...props }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <select {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

export function SectionTitle({ eyebrow, title, description, action, className = '' }) {
  return (
    <div className={`section-title ${className}`}>
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Loading({ label = 'Carregando...' }) {
  return (
    <div className="loading-state" role="status">
      <span className="spinner" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ icon: Icon = CircleHelp, title, description, action }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Icon size={22} /></span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}

export function ErrorMessage({ children }) {
  if (!children) return null;
  return <div className="error-message" role="alert">{children}</div>;
}

export function useResource(path, token) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!path) {
      setData(null);
      setError('');
      setLoading(false);
      return () => { active = false; };
    }
    setLoading(true);
    setError('');
    api(path, { token })
      .then((result) => {
        if (active) setData(result);
      })
      .catch((reason) => {
        if (active) setError(reason.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [path, token]);

  return { data, setData, loading, error, setError };
}

export function StatusBadge({ children }) {
  const normalized = String(children || '').toLowerCase();
  const tone = normalized.includes('avaliad') || normalized.includes('conclu') || normalized.includes('aceit')
    ? 'success'
    : normalized.includes('submet') || normalized.includes('avalia') || normalized.includes('convite')
      ? 'warning'
      : normalized.includes('recus') || normalized.includes('cancel')
        ? 'danger'
        : 'neutral';
  return <span className={`status-badge status-${tone}`}><span />{children || 'Em andamento'}</span>;
}

export function ChallengeCard({ challenge, featured = false }) {
  return (
    <article className={`challenge-card ${featured ? 'challenge-card-featured' : ''}`}>
      <div className="challenge-card-top">
        <span className="category-icon"><Target size={18} /></span>
        <span className="challenge-level">{challenge.nivel}</span>
      </div>
      <p className="challenge-area">{challenge.area}</p>
      <h3>{challenge.titulo}</h3>
      <p className="challenge-description">{challenge.descricao}</p>
      <div className="challenge-company">
        <span className="company-avatar">{(challenge.empresa?.razao_social || 'E').slice(0, 1).toUpperCase()}</span>
        <span>{challenge.empresa?.razao_social || 'Empresa parceira'}</span>
        <span className="challenge-deadline">{challenge.prazo} dias</span>
      </div>
      <div className="tag-list">
        {(challenge.tecnologias || []).slice(0, 4).map((technology) => (
          <span className="tag" key={technology}>{technology}</span>
        ))}
      </div>
      <Link className="card-link" to={`/app/desafios/${challenge.id}`}>
        Ver desafio <ArrowUpRight size={16} />
      </Link>
    </article>
  );
}

export function AppShell() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const company = user?.tipo_perfil === 'empresa';
  const base = company ? '/empresa' : '/app';
  const navItems = company
    ? [
        ['Dashboard', base, 'dashboard'],
        ['Meus desafios', `${base}/desafios`, 'challenges'],
        ['Criar desafio', `${base}/criar-desafio`, 'company'],
        ['Participantes', `${base}/participantes`, 'participants'],
        ['Avaliações', `${base}/avaliacoes`, 'reviews'],
        ['Oportunidades', `${base}/oportunidades`, 'opportunities'],
        ['Perfil da empresa', `${base}/perfil`, 'profile'],
      ]
    : [
        ['Dashboard', base, 'dashboard'],
        ['Explorar desafios', `${base}/desafios`, 'challenges'],
        ['Minhas participações', `${base}/participacoes`, 'participations'],
        ['Entregas', `${base}/entregas`, 'deliveries'],
        ['Reconhecimentos', `${base}/reconhecimentos`, 'recognitions'],
        ['Oportunidades', `${base}/oportunidades`, 'opportunities'],
        ['Meu perfil', `${base}/perfil`, 'profile'],
      ];

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      window.location.assign('/');
    }
  };

  return (
    <div className="app-layout">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <Logo />
          <button className="icon-button sidebar-close" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}>
            <X size={19} />
          </button>
        </div>
        <div className="workspace-label">{company ? 'ESPAÇO DA EMPRESA' : 'ESPAÇO DO ESTUDANTE'}</div>
        <nav className="side-nav" aria-label="Menu principal">
          {navItems.map(([label, to, icon]) => {
            const Icon = iconMap[icon];
            const active = to === base ? location.pathname === base : location.pathname.startsWith(to);
            return (
              <NavLink key={to} to={to} className={`side-link ${active ? 'side-link-active' : ''}`}>
                <Icon size={18} strokeWidth={1.8} />
                <span>{label}</span>
                {active && <span className="side-active-dot" />}
              </NavLink>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="tip-icon"><Sparkles size={17} /></span>
            <strong>{company ? 'Encontre novos talentos' : 'Seu próximo passo começa aqui'}</strong>
            <span>{company ? 'Desafios práticos revelam o potencial.' : 'Cada desafio é uma nova experiência.'}</span>
          </div>
          <button className="side-link logout-link" onClick={handleSignOut}>
            <LogOut size={18} /><span>Sair da conta</span>
          </button>
        </div>
      </aside>
      {menuOpen && <button className="sidebar-overlay" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} />}
      <div className="app-main">
        <header className="topbar">
          <button className="icon-button menu-toggle" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}>
            <Menu size={21} />
          </button>
          <div className="topbar-breadcrumb"><span>TalentHub</span><ChevronRight size={15} /><strong>{company ? 'Empresa' : 'Estudante'}</strong></div>
          <div className="topbar-user">
            <div className="topbar-user-copy">
              <strong>{company ? user?.perfil?.razao_social || user?.nome : user?.nome}</strong>
              <span>{company ? user?.perfil?.area_atuacao || 'Empresa parceira' : user?.perfil?.curso || 'Estudante'}</span>
            </div>
            <span className={`avatar ${company ? 'avatar-company' : ''}`}>
              {company ? <Building2 size={18} /> : user?.nome?.slice(0, 1).toUpperCase()}
            </span>
          </div>
        </header>
        <main className="page-content"><Outlet /></main>
        <footer className="app-footer"><span>© {new Date().getFullYear()} TalentHub</span><span>Feito para transformar potencial em oportunidade.</span></footer>
      </div>
    </div>
  );
}

export function MetricCard({ icon: Icon, label, value, note, tone = 'mint' }) {
  return (
    <article className="metric-card">
      <span className={`metric-icon metric-${tone}`}><Icon size={19} /></span>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value ?? '—'}</strong>
      {note && <span className="metric-note">{note}</span>}
    </article>
  );
}

export function PageBack({ to, children = 'Voltar' }) {
  return <Link className="back-link" to={to}><ArrowLeft size={16} />{children}</Link>;
}

export const commonIcons = {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Award,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronRight,
  FileBadge,
  FileText,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Target,
  Trophy,
  X,
};
