import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Code2,
  Compass,
  FileCheck2,
  FileText,
  Filter,
  GraduationCap,
  Handshake,
  HeartHandshake,
  Layers3,
  LockKeyhole,
  Mail,
  MapPin,
  Rocket,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  UsersRound,
  WandSparkles,
} from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { apiPatch, apiPost, errorForField } from './api';
import { useAuth } from './auth';
import {
  Button,
  ChallengeCard,
  EmptyState,
  ErrorMessage,
  Field,
  LinkButton,
  Loading,
  MetricCard,
  PageBack,
  SectionTitle,
  SelectField,
  StatusBadge,
  useResource,
} from './components';

const formatDate = (value) => value
  ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
  : '—';

const initials = (name = '') => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'TH';

function PublicNav() {
  const { user } = useAuth();
  return (
    <header className="public-nav">
      <Link className="brand" to="/">
        <span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 36 36" fill="none"><path d="M5 24.5 14.4 8l5.1 9 3.4-5.8L31 27H16.8l-3-5.2-3 5.2H5Z" fill="currentColor" /><circle cx="26.7" cy="8.5" r="3.4" fill="currentColor" opacity=".62" /></svg></span>
        <span>talent<span className="brand-accent">hub</span></span>
      </Link>
      <nav className="public-nav-links" aria-label="Navegação">
        <a href="#como-funciona">Como funciona</a>
        <a href="#beneficios">Benefícios</a>
        <Link to="/app/desafios">Desafios</Link>
      </nav>
      <div className="public-nav-actions">
        {user
          ? <LinkButton to={user.tipo_perfil === 'empresa' ? '/empresa' : '/app'} variant="quiet">Acessar painel <ArrowRight size={16} /></LinkButton>
          : <>
              <Link className="text-link" to="/login">Entrar</Link>
              <LinkButton to="/acessar" className="nav-cta">Criar conta <ArrowRight size={16} /></LinkButton>
            </>}
      </div>
    </header>
  );
}

export function LandingPage() {
  const { data: challenges, loading, error } = useResource('/challenges/');
  const featured = (challenges || []).slice(0, 3);
  const heroChallenge = featured[0];
  const companies = new Set((challenges || []).map((challenge) => challenge.empresa?.razao_social).filter(Boolean));

  return (
    <div className="landing">
      <PublicNav />
      <main>
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-kicker"><span className="pulse-dot" /> O talento encontra a oportunidade</div>
            <h1>Mostre o que você sabe fazer. <span>Conquiste o próximo passo.</span></h1>
            <p className="hero-lead">Resolva desafios reais de empresas, transforme aprendizado em experiência e deixe seu trabalho falar por você.</p>
            <div className="hero-actions">
              <LinkButton to="/app/desafios" icon={ArrowRight}>Explorar desafios</LinkButton>
              <LinkButton to="/acessar?perfil=empresa" variant="outline">Sou uma empresa <ArrowUpRight size={17} /></LinkButton>
            </div>
            <div className="hero-social-proof">
              <div className="avatar-stack" aria-hidden="true"><span>G</span><span>M</span><span>R</span><span>B</span></div>
              <span><strong>Aprenda fazendo.</strong><br />Cresça mostrando seu potencial.</span>
            </div>
          </div>
          <div className="hero-visual" aria-label="Ilustração da plataforma de desafios TalentHub">
            <div className="visual-grid" />
            <div className="visual-orbit orbit-one" />
            <div className="visual-orbit orbit-two" />
            <div className="hero-decoration decor-one" />
            <div className="hero-decoration decor-two" />
            <div className="hero-panel">
              <div className="hero-panel-top"><span className="mini-brand">th</span><span>Seu próximo projeto</span><span className="panel-live"><i /> AO VIVO</span></div>
              <div className="hero-panel-body">
                <span className="panel-label">DESAFIO EM DESTAQUE</span>
                <div className="panel-project-icon"><BarChart3 size={24} /></div>
                <h3>{heroChallenge?.titulo || (loading ? 'Buscando desafios...' : 'Um desafio prático')}</h3>
                <p>{heroChallenge?.descricao || 'Transforme suas habilidades em experiência real.'}</p>
                <div className="panel-tags">{(heroChallenge?.tecnologias || ['Experiência real', 'Seu próximo projeto']).slice(0, 2).map((technology) => <span key={technology}>{technology}</span>)}<span>{heroChallenge ? `${heroChallenge.prazo} dias` : 'No seu ritmo'}</span></div>
                <div className="panel-progress"><span><i /></span><small>Um projeto. Novas possibilidades.</small></div>
              </div>
            </div>
            <div className="floating-card floating-feedback">
              <span className="float-check"><Check size={16} /></span><span><strong>Feedback de verdade</strong><small>Seu trabalho reconhecido</small></span>
            </div>
            <div className="floating-card floating-score">            <span className="score-icon"><Trophy size={18} /></span><span><strong>Seu talento</strong><small>reconhecido por empresas</small></span></div>
            <span className="hero-sparkle sparkle-a"><Sparkles size={20} /></span>
            <span className="hero-sparkle sparkle-b"><Star size={15} /></span>
          </div>
          <div className="hero-bottom">
            <div><strong>{loading ? '—' : challenges?.length ?? 0}</strong><span>desafios disponíveis</span></div>
            <span className="hero-divider" />
            <div><strong>{loading ? '—' : companies.size}</strong><span>empresas parceiras</span></div>
            <span className="hero-bottom-note">Portfólio construído com experiência real <ArrowDownRightIcon /></span>
          </div>
          {error && <span className="sr-only">Não foi possível carregar os desafios.</span>}
        </section>

        <section className="steps-section section-wrap" id="como-funciona">
          <div className="section-intro">
            <span className="eyebrow">SIMPLES ASSIM</span>
            <h2>Da curiosidade à <span>conquista.</span></h2>
            <p>Uma jornada prática para tirar suas habilidades do papel e levá-las para o mercado.</p>
          </div>
          <div className="steps-grid">
            {[
              [Search, 'Encontre seu desafio', 'Escolha um desafio alinhado à sua área, nível e curiosidade.'],
              [Code2, 'Coloque a mão na massa', 'Construa uma solução no seu ritmo, com objetivos e prazos claros.'],
              [FileCheck2, 'Mostre sua solução', 'Compartilhe seu projeto e explique as escolhas por trás dele.'],
              [Handshake, 'Abra novas portas', 'Receba feedback, reconhecimentos e conexões profissionais.'],
            ].map(([Icon, title, description], index) => (
              <article className="step-card" key={title}>
                <span className="step-number">0{index + 1}</span>
                <span className="step-icon"><Icon size={21} /></span>
                <h3>{title}</h3><p>{description}</p>
                {index < 3 && <ChevronRight className="step-arrow" size={18} />}
              </article>
            ))}
          </div>
        </section>

        <section className="benefits-section" id="beneficios">
          <div className="benefits-layout section-wrap">
            <div className="benefits-copy">
              <span className="eyebrow">MAIS DO QUE UM CURRÍCULO</span>
              <h2>Competência não se conta. <span>Se demonstra.</span></h2>
              <p>Construa um histórico de experiências que mostra como você pensa, resolve problemas e aprende com cada projeto.</p>
              <LinkButton to="/acessar" variant="dark">Comece sua jornada <ArrowRight size={17} /></LinkButton>
            </div>
            <div className="benefits-list">
              {[
                [Rocket, 'Experiência prática', 'Resolva problemas que existem fora da sala de aula.'],
                [BadgeCheck, 'Feedback que desenvolve', 'Saiba o que fez bem e onde pode ir além.'],
                [Trophy, 'Reconhecimento real', 'Registre badges, certificados e competências.'],
                [BriefcaseBusiness, 'Conexões profissionais', 'Empresas conhecem seu trabalho antes da entrevista.'],
              ].map(([Icon, title, description], index) => (
                <article className="benefit-item" key={title}>
                  <span className={`benefit-icon benefit-icon-${index}`}><Icon size={20} /></span>
                  <span><strong>{title}</strong><small>{description}</small></span>
                  <ArrowUpRight size={17} />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="featured-section section-wrap">
          <div className="featured-heading">
            <div className="section-intro align-left">
              <span className="eyebrow">FEITOS PARA APRENDER FAZENDO</span>
              <h2>Desafios que viram <span>histórias.</span></h2>
              <p>Problemas reais. Espaço para experimentar. Resultados que você leva consigo.</p>
            </div>
            <Link className="all-link" to="/app/desafios">Explorar todos <ArrowRight size={17} /></Link>
          </div>
          {loading ? <Loading label="Buscando oportunidades..." /> : error ? (
            <div className="inline-notice">{error}</div>
          ) : featured.length ? (
            <div className="challenge-grid landing-challenge-grid">
              {featured.map((challenge, index) => <ChallengeCard key={challenge.id} challenge={challenge} featured={index === 0} />)}
            </div>
          ) : (
            <EmptyState icon={Compass} title="Novos desafios em breve" description="Acesse a plataforma mais tarde para ver novas oportunidades." />
          )}
        </section>

        <section className="company-cta section-wrap">
          <div className="company-cta-decoration" />
          <span className="company-cta-icon"><Building2 size={22} /></span>
          <div><span className="eyebrow">PARA EMPRESAS</span><h2>Encontre potencial onde outros veem apenas um currículo.</h2><p>Publique um desafio e conheça estudantes pela qualidade das soluções que entregam.</p></div>
          <LinkButton to="/acessar?perfil=empresa" variant="light">Conheça o TalentHub <ArrowRight size={17} /></LinkButton>
        </section>
      </main>
      <footer className="landing-footer section-wrap"><span className="footer-brand">talent<span>hub</span></span><span>Talento em ação. Oportunidade em movimento.</span><span>© {new Date().getFullYear()} TalentHub</span></footer>
    </div>
  );
}

function ArrowDownRightIcon() {
  return <ArrowRight size={15} aria-hidden="true" />;
}

export function LoginPage() {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={user.tipo_perfil === 'empresa' ? '/empresa' : '/app'} replace />;

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const currentUser = await signIn(form);
      const requested = location.state?.from?.pathname;
      const redirect = requested && requested.startsWith('/') && !requested.startsWith('//')
        ? requested
        : currentUser.tipo_perfil === 'empresa' ? '/empresa' : '/app';
      navigate(redirect, { replace: true });
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  };

  const role = searchParams.get('perfil');
  return (
    <AuthLayout title="Boas-vindas de volta." description="Entre na sua conta e continue de onde parou." aside={role === 'empresa' ? 'Descubra pessoas que já provaram o que sabem fazer.' : 'Seu próximo desafio pode abrir uma nova porta.'}>
      <form className="auth-form" onSubmit={submit}>
        <div className="auth-role-hint"><span className="role-icon"><LockKeyhole size={18} /></span><span><strong>Acesso TalentHub</strong><small>Entre com o e-mail usado no cadastro.</small></span></div>
        <Field label="E-mail" type="email" autoComplete="email" placeholder="voce@email.com" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        <Field label="Senha" type="password" autoComplete="current-password" placeholder="Sua senha" required value={form.senha} onChange={(event) => setForm({ ...form, senha: event.target.value })} />
        <ErrorMessage>{error}</ErrorMessage>
        <Button className="button-full" type="submit" disabled={busy}>{busy ? 'Entrando...' : 'Entrar'} <ArrowRight size={17} /></Button>
        <p className="auth-switch">Ainda não tem conta? <Link to="/acessar">Criar conta grátis</Link></p>
      </form>
    </AuthLayout>
  );
}

export function RegisterChoicePage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  if (user) return <Navigate to={user.tipo_perfil === 'empresa' ? '/empresa' : '/app'} replace />;
  const preferred = searchParams.get('perfil');
  return (
    <AuthLayout title="Seu talento merece espaço." description="Escolha como deseja fazer parte do TalentHub." aside="Um bom próximo passo começa com uma oportunidade prática.">
      <div className="choice-cards">
        <Link className={`choice-card ${preferred === 'estudante' ? 'choice-highlighted' : ''}`} to="/cadastro/estudante">
          <span className="choice-icon choice-student"><GraduationCap size={23} /></span><span className="choice-text"><strong>Sou estudante</strong><small>Participe de desafios, mostre seu trabalho e conquiste reconhecimento.</small></span><ArrowRight size={18} />
        </Link>
        <Link className={`choice-card ${preferred === 'empresa' ? 'choice-highlighted' : ''}`} to="/cadastro/empresa">
          <span className="choice-icon choice-company"><Building2 size={22} /></span><span className="choice-text"><strong>Sou empresa</strong><small>Publique desafios, avalie soluções e encontre novos talentos.</small></span><ArrowRight size={18} />
        </Link>
        <p className="auth-switch">Já tem uma conta? <Link to="/login">Entrar</Link></p>
      </div>
    </AuthLayout>
  );
}

export function RegisterPage({ role }) {
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const isCompany = role === 'empresa';
  const [form, setForm] = useState(isCompany
    ? { razao_social: '', email: '', senha: '', area_atuacao: '', descricao: '', cnpj: '' }
    : { nome: '', email: '', senha: '', curso: '', instituicao: '', area_interesse: '', competencias: '' });
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState({});
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={user.tipo_perfil === 'empresa' ? '/empresa' : '/app'} replace />;

  const change = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldError((current) => ({ ...current, [field]: '' }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setFieldError({});
    const payload = { ...form };
    if (isCompany) {
      payload.cnpj = payload.cnpj.replace(/\D/g, '') || undefined;
    } else {
      payload.competencias = payload.competencias.split(',').map((value) => value.trim()).filter(Boolean);
    }
    try {
      await signUp(role, payload);
      navigate(isCompany ? '/empresa' : '/app', { replace: true });
    } catch (reason) {
      setError(reason.message);
      if (reason.details && typeof reason.details === 'object') {
        setFieldError(Object.fromEntries(Object.keys(form).map((field) => [field, errorForField(reason, field)]).filter(([, value]) => value)));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title={isCompany ? 'Vamos construir juntos.' : 'Seu talento começa aqui.'} description={isCompany ? 'Crie o perfil da sua empresa e conheça novos talentos.' : 'Crie seu perfil e encontre desafios que combinam com você.'} aside={isCompany ? 'Transforme problemas reais em oportunidades para descobrir novos talentos.' : 'Cada projeto concluído se torna parte da sua história profissional.'}>
      <form className="auth-form register-form" onSubmit={submit}>
        <div className="auth-role-hint"><span className={`role-icon ${isCompany ? 'role-company' : ''}`}>{isCompany ? <Building2 size={18} /> : <GraduationCap size={19} />}</span><span><strong>Conta de {isCompany ? 'empresa' : 'estudante'}</strong><small>Você poderá completar seu perfil depois.</small></span></div>
        {isCompany ? <>
          <Field label="Nome da empresa" autoComplete="organization" placeholder="Ex.: Acme Tecnologia" required value={form.razao_social} onChange={(event) => change('razao_social', event.target.value)} />
          <Field label="E-mail corporativo" type="email" autoComplete="email" placeholder="voce@empresa.com" required value={form.email} onChange={(event) => change('email', event.target.value)} />
          <Field label="Senha" type="password" autoComplete="new-password" minLength={8} placeholder="Mínimo de 8 caracteres" required value={form.senha} onChange={(event) => change('senha', event.target.value)} hint={fieldError.senha} />
          <Field label="Área de atuação" placeholder="Ex.: Tecnologia e Dados" required value={form.area_atuacao} onChange={(event) => change('area_atuacao', event.target.value)} />
          <Field label="CNPJ (opcional)" inputMode="numeric" placeholder="14 números, sem pontuação" value={form.cnpj} onChange={(event) => change('cnpj', event.target.value)} hint={fieldError.cnpj} />
          <Field label="Sobre a empresa" as="textarea" rows={3} placeholder="Conte brevemente o que a empresa faz" required value={form.descricao} onChange={(event) => change('descricao', event.target.value)} />
        </> : <>
          <Field label="Nome completo" autoComplete="name" placeholder="Como podemos chamar você?" required value={form.nome} onChange={(event) => change('nome', event.target.value)} />
          <Field label="E-mail" type="email" autoComplete="email" placeholder="voce@email.com" required value={form.email} onChange={(event) => change('email', event.target.value)} hint={fieldError.email} />
          <Field label="Senha" type="password" autoComplete="new-password" minLength={8} placeholder="Mínimo de 8 caracteres" required value={form.senha} onChange={(event) => change('senha', event.target.value)} hint={fieldError.senha} />
          <div className="form-row">
            <Field label="Curso" placeholder="Seu curso" required value={form.curso} onChange={(event) => change('curso', event.target.value)} />
            <Field label="Instituição" placeholder="Sua instituição" required value={form.instituicao} onChange={(event) => change('instituicao', event.target.value)} />
          </div>
          <Field label="Área de interesse" placeholder="Ex.: Dados, Design, Desenvolvimento" value={form.area_interesse} onChange={(event) => change('area_interesse', event.target.value)} />
          <Field label="Conhecimentos e tecnologias" placeholder="Python, SQL, Figma..." value={form.competencias} onChange={(event) => change('competencias', event.target.value)} hint="Separe os itens por vírgula." />
        </>}
        <ErrorMessage>{error}</ErrorMessage>
        <Button className="button-full" type="submit" disabled={busy}>{busy ? 'Criando sua conta...' : 'Criar conta'} <ArrowRight size={17} /></Button>
        <p className="auth-switch">Já tem uma conta? <Link to="/login">Entrar</Link></p>
      </form>
    </AuthLayout>
  );
}

function AuthLayout({ title, description, aside, children }) {
  return (
    <div className="auth-page">
      <div className="auth-left">
        <Link className="auth-back" to="/"><span>←</span> Voltar para o início</Link>
        <div className="auth-box">
          <Link className="brand auth-brand" to="/"><span className="brand-mark"><svg viewBox="0 0 36 36" fill="none"><path d="M5 24.5 14.4 8l5.1 9 3.4-5.8L31 27H16.8l-3-5.2-3 5.2H5Z" fill="currentColor" /><circle cx="26.7" cy="8.5" r="3.4" fill="currentColor" opacity=".62" /></svg></span><span>talent<span className="brand-accent">hub</span></span></Link>
          <span className="eyebrow">FAÇA PARTE DO TALENTHUB</span>
          <h1>{title}</h1>
          <p className="auth-description">{description}</p>
          {children}
          <p className="auth-legal"><ShieldCheck size={14} /> Seus dados ficam protegidos e só são usados na plataforma.</p>
        </div>
        <span className="auth-copyright">© {new Date().getFullYear()} TalentHub · Seu talento em movimento.</span>
      </div>
      <aside className="auth-aside">
        <div className="auth-orb auth-orb-one" /><div className="auth-orb auth-orb-two" />
        <span className="auth-aside-symbol"><WandSparkles size={25} /></span>
        <span className="eyebrow">APRENDER · PRATICAR · CONQUISTAR</span>
        <h2>{aside}</h2>
        <p>Desafios que aproximam a sua vontade de aprender das oportunidades que você procura.</p>
        <div className="auth-aside-note"><span><Sparkles size={17} /></span><span><strong>O seu trabalho tem valor.</strong><small>Mostre ao mercado tudo o que você pode fazer.</small></span></div>
      </aside>
    </div>
  );
}

export function StudentDashboard() {
  const { token, user } = useAuth();
  const { data, loading, error } = useResource('/dashboard/', token);
  const stats = data?.indicadores || {};
  if (loading) return <Loading label="Preparando seu espaço..." />;
  if (error) return <PageLoadError error={error} />;
  const participations = data?.participacoes || [];
  const featured = data?.desafios_recomendados || [];
  return (
    <div className="page-stack">
      <div className="dashboard-welcome">
        <div><span className="eyebrow">SEU ESPAÇO DE CRESCIMENTO</span><h1>Olá, {user?.nome?.split(' ')[0]} <span className="wave">✳</span></h1><p>Continue desenvolvendo suas habilidades, um desafio de cada vez.</p></div>
        <LinkButton to="/app/desafios" icon={ArrowRight}>Explorar desafios</LinkButton>
      </div>
      <div className="metrics-grid">
        <MetricCard icon={Check} label="Desafios concluídos" value={stats.desafios_concluidos} note="experiência comprovada" tone="mint" />
        <MetricCard icon={Clock3} label="Em andamento" value={stats.desafios_em_andamento} note="seu próximo projeto" tone="lavender" />
        <MetricCard icon={Award} label="Reconhecimentos" value={stats.badges} note="badges conquistados" tone="peach" />
        <MetricCard icon={BriefcaseBusiness} label="Oportunidades" value={stats.oportunidades} note="empresas interessadas" tone="blue" />
      </div>
      <section className="content-card">
        <div className="content-card-heading"><div><span className="eyebrow">SEU PROGRESSO</span><h2>Continue de onde parou</h2><p>Suas participações mais recentes.</p></div><Link to="/app/participacoes" className="all-link">Ver todas <ArrowRight size={16} /></Link></div>
        {participations.length ? (
          <div className="progress-list">{participations.slice(0, 4).map((participation) => (
            <ParticipationRow key={participation.id} participation={participation} />
          ))}</div>
        ) : <EmptyState icon={Compass} title="Sua próxima experiência começa com um desafio" description="Encontre uma oportunidade para praticar suas habilidades e começar a construir seu portfólio." action={<LinkButton to="/app/desafios" variant="outline">Explorar desafios <ArrowRight size={16} /></LinkButton>} />}
      </section>
      <section className="content-card">
        <div className="content-card-heading"><div><span className="eyebrow">FEITOS PARA VOCÊ</span><h2>Desafios recomendados</h2><p>Oportunidades alinhadas ao seu perfil.</p></div><Link to="/app/desafios" className="all-link">Ver todos <ArrowRight size={16} /></Link></div>
        {featured.length
          ? <div className="challenge-grid dashboard-challenge-grid">{featured.slice(0, 3).map((challenge) => <ChallengeCard key={challenge.id} challenge={challenge} />)}</div>
          : <EmptyState icon={Sparkles} title="Ainda não há recomendações" description="Explore os desafios disponíveis para encontrar um bom ponto de partida." action={<LinkButton to="/app/desafios" variant="outline">Buscar desafios <ArrowRight size={16} /></LinkButton>} />}
      </section>
    </div>
  );
}

export function CompanyDashboard() {
  const { token, user } = useAuth();
  const { data, loading, error } = useResource('/dashboard/', token);
  if (loading) return <Loading label="Carregando o painel da empresa..." />;
  if (error) return <PageLoadError error={error} />;
  const stats = data?.indicadores || {};
  const challenges = data?.desafios || [];
  const pending = data?.entregas_pendentes || [];
  return (
    <div className="page-stack">
      <div className="dashboard-welcome company-welcome">
        <div><span className="eyebrow">ESPAÇO DA EMPRESA</span><h1>Olá, {user?.perfil?.razao_social || user?.nome}</h1><p>Acompanhe seus desafios e conheça novos talentos.</p></div>
        <LinkButton to="/empresa/criar-desafio" icon={ArrowRight}>Publicar desafio</LinkButton>
      </div>
      <div className="metrics-grid metrics-grid-company">
        <MetricCard icon={Layers3} label="Desafios publicados" value={stats.desafios_publicados} tone="mint" />
        <MetricCard icon={UsersRound} label="Participações" value={stats.participacoes} tone="lavender" />
        <MetricCard icon={FileCheck2} label="Entregas recebidas" value={stats.entregas_recebidas} tone="blue" />
        <MetricCard icon={Clock3} label="Avaliações pendentes" value={stats.avaliacoes_pendentes} tone="peach" />
        <MetricCard icon={HeartHandshake} label="Talentos identificados" value={stats.talentos_identificados} tone="rose" />
      </div>
      <section className="content-card">
        <div className="content-card-heading"><div><span className="eyebrow">PRÓXIMO PASSO</span><h2>Entregas aguardando avaliação</h2><p>Seu feedback pode abrir caminhos.</p></div><Link to="/empresa/avaliacoes" className="all-link">Ver avaliações <ArrowRight size={16} /></Link></div>
        {pending.length ? <div className="progress-list">{pending.slice(0, 5).map((participation) => <SubmissionRow key={participation.id} participation={participation} />)}</div>
          : <EmptyState icon={FileCheck2} title="Nenhuma entrega pendente" description="Quando estudantes enviarem suas soluções, elas aparecerão aqui." />}
      </section>
      <section className="content-card">
        <div className="content-card-heading"><div><span className="eyebrow">SEUS PROJETOS</span><h2>Desafios da empresa</h2><p>Gerencie as oportunidades que você publicou.</p></div><Link to="/empresa/desafios" className="all-link">Ver todos <ArrowRight size={16} /></Link></div>
        {challenges.length ? <CompanyChallengeList challenges={challenges.slice(0, 5)} /> : <EmptyState icon={Target} title="Publique seu primeiro desafio" description="Compartilhe uma demanda real e descubra como os estudantes a resolvem." action={<LinkButton to="/empresa/criar-desafio">Criar desafio <ArrowRight size={16} /></LinkButton>} />}
      </section>
    </div>
  );
}

function ParticipationRow({ participation }) {
  const status = participation.status || 'Inscrito';
  return (
    <article className="progress-row">
      <div className="progress-thumb"><Compass size={19} /></div>
      <div className="progress-main"><strong>{participation.desafio?.titulo || 'Desafio'}</strong><span>{participation.desafio?.empresa?.razao_social || 'Empresa parceira'} · {participation.desafio?.area || 'Desafio prático'}</span></div>
      <div className="progress-status"><StatusBadge>{status}</StatusBadge><small>{participation.data_entrega ? `Entregue em ${formatDate(participation.data_entrega)}` : `${participation.desafio?.prazo || '—'} dias de prazo`}</small></div>
      <Link className="row-action" to={participation.data_entrega ? '/app/entregas' : `/app/desafios/${participation.desafio?.id}`} aria-label={`Ver ${participation.desafio?.titulo}`}><ArrowUpRight size={17} /></Link>
    </article>
  );
}

function SubmissionRow({ participation }) {
  return (
    <article className="progress-row">
      <span className="avatar student-avatar">{initials(participation.estudante?.nome)}</span>
      <div className="progress-main"><strong>{participation.estudante?.nome || 'Estudante'}</strong><span>{participation.desafio?.titulo} · entregue em {formatDate(participation.data_entrega)}</span></div>
      <StatusBadge>{participation.status}</StatusBadge>
      <Link className="row-action" to="/empresa/avaliacoes" aria-label="Avaliar entrega"><ArrowUpRight size={17} /></Link>
    </article>
  );
}

function CompanyChallengeList({ challenges }) {
  return <div className="company-challenge-list">{challenges.map((challenge) => (
    <article className="company-challenge-row" key={challenge.id}>
      <span className="challenge-list-icon"><Target size={19} /></span>
      <div><strong>{challenge.titulo}</strong><span>{challenge.area} · {challenge.prazo} dias · {challenge.nivel}</span></div>
      <StatusBadge>{challenge.status}</StatusBadge>
      <span className="challenge-applicants"><UsersRound size={15} /></span>
    </article>
  ))}</div>;
}

export function ChallengeListPage() {
  const [filters, setFilters] = useState({ q: '', area: '', nivel: '', prazo: '', tecnologia: '', empresa: '' });
  const { data, loading, error } = useResource('/challenges/');
  const allChallenges = data || [];
  const areas = useMemo(() => [...new Set(allChallenges.map((challenge) => challenge.area))], [allChallenges]);
  const levels = useMemo(() => [...new Set(allChallenges.map((challenge) => challenge.nivel))], [allChallenges]);
  const technologies = useMemo(() => [...new Set(allChallenges.flatMap((challenge) => challenge.tecnologias || []))], [allChallenges]);
  const companies = useMemo(() => [...new Set(allChallenges.map((challenge) => challenge.empresa?.razao_social).filter(Boolean))], [allChallenges]);
  const challenges = useMemo(() => {
    const query = filters.q.trim().toLocaleLowerCase('pt-BR');
    return allChallenges.filter((challenge) => {
      const searchable = [
        challenge.titulo,
        challenge.descricao,
        challenge.area,
        challenge.empresa?.razao_social,
        ...(challenge.tecnologias || []),
      ].join(' ').toLocaleLowerCase('pt-BR');
      return (!query || searchable.includes(query))
        && (!filters.area || challenge.area === filters.area)
        && (!filters.nivel || challenge.nivel === filters.nivel)
        && (!filters.prazo || String(challenge.prazo) === filters.prazo)
        && (!filters.tecnologia || (challenge.tecnologias || []).includes(filters.tecnologia))
        && (!filters.empresa || challenge.empresa?.razao_social === filters.empresa);
    });
  }, [allChallenges, filters]);
  const clearFilters = () => setFilters({ q: '', area: '', nivel: '', prazo: '', tecnologia: '', empresa: '' });

  return (
    <div className="page-stack">
      <SectionTitle eyebrow="OPORTUNIDADES REAIS" title="Encontre seu próximo desafio." description="Filtre por área, nível, tecnologia, prazo ou empresa." />
      <div className="filter-bar">
        <label className="search-field"><Search size={18} /><input placeholder="Busque por título, empresa ou tecnologia" value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} /><kbd>⌘ K</kbd></label>
        <div className="filter-options">
          <SelectField label="Área" aria-label="Filtrar por área" value={filters.area} onChange={(event) => setFilters({ ...filters, area: event.target.value })} options={[{ value: '', label: 'Todas as áreas' }, ...areas.map((area) => ({ value: area, label: area }))]} />
          <SelectField label="Nível" aria-label="Filtrar por nível" value={filters.nivel} onChange={(event) => setFilters({ ...filters, nivel: event.target.value })} options={[{ value: '', label: 'Todos os níveis' }, ...levels.map((level) => ({ value: level, label: level }))]} />
          <SelectField label="Prazo" aria-label="Filtrar por prazo" value={filters.prazo} onChange={(event) => setFilters({ ...filters, prazo: event.target.value })} options={[{ value: '', label: 'Qualquer prazo' }, ...[5, 7, 9, 10, 14, 21].map((days) => ({ value: String(days), label: `${days} dias` }))]} />
          <SelectField label="Tecnologia" aria-label="Filtrar por tecnologia" value={filters.tecnologia} onChange={(event) => setFilters({ ...filters, tecnologia: event.target.value })} options={[{ value: '', label: 'Todas as tecnologias' }, ...technologies.map((technology) => ({ value: technology, label: technology }))]} />
          <SelectField label="Empresa" aria-label="Filtrar por empresa" value={filters.empresa} onChange={(event) => setFilters({ ...filters, empresa: event.target.value })} options={[{ value: '', label: 'Todas as empresas' }, ...companies.map((company) => ({ value: company, label: company }))]} />
        </div>
      </div>
      <div className="result-summary"><span><strong>{loading ? '…' : challenges.length}</strong> desafios encontrados</span><button className="filter-clear" onClick={clearFilters}><Filter size={15} /> Limpar filtros</button></div>
      {loading ? <Loading label="Buscando desafios..." /> : error ? <PageLoadError error={error} /> : challenges.length ? (
        <div className="challenge-grid">{challenges.map((challenge) => <ChallengeCard key={challenge.id} challenge={challenge} />)}</div>
      ) : <EmptyState icon={Search} title="Nenhum desafio encontrado" description="Experimente remover alguns filtros ou buscar outra área." action={<Button variant="outline" onClick={clearFilters}>Limpar filtros</Button>} />}
    </div>
  );
}

export function ChallengeDetailPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const { data: challenge, loading, error } = useResource(`/challenges/${id}/`);
  const { data: participations } = useResource(user ? '/participations/' : null, token);
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const existing = participations?.find((item) => item.desafio?.id === id);
  if (loading) return <Loading label="Carregando desafio..." />;
  if (error) return <PageLoadError error={error} />;
  if (!challenge) return null;

  const participate = async () => {
    if (!user) {
      navigate('/login?next=desafios');
      return;
    }
    setBusy(true);
    setActionError('');
    try {
      await apiPost(`/challenges/${id}/participate/`, {}, token);
      navigate('/app/participacoes', { state: { message: 'Sua participação foi registrada.' } });
    } catch (reason) {
      setActionError(reason.message);
    } finally {
      setBusy(false);
    }
  };

  const companyView = user?.tipo_perfil === 'empresa';
  return (
    <div className="page-stack detail-page">
      <PageBack to={companyView ? '/empresa/desafios' : '/app/desafios'}>Voltar para os desafios</PageBack>
      <div className="detail-hero">
        <div><div className="detail-badges"><span className="level-badge">{challenge.nivel}</span><StatusBadge>{challenge.status}</StatusBadge></div><h1>{challenge.titulo}</h1><p>{challenge.descricao}</p><div className="detail-company"><span className="company-avatar">{initials(challenge.empresa?.razao_social)}</span><strong>{challenge.empresa?.razao_social}</strong><span>·</span><span>{challenge.area}</span></div></div>
        <div className="detail-quick-facts"><div><Clock3 size={17} /><span><small>Prazo</small><strong>{challenge.prazo} dias</strong></span></div><div><Building2 size={17} /><span><small>Empresa</small><strong>{challenge.empresa?.razao_social}</strong></span></div><div><Target size={17} /><span><small>Nível</small><strong>{challenge.nivel}</strong></span></div></div>
      </div>
      <div className="detail-columns">
        <div className="detail-copy">
          <DetailSection icon={Target} title="Objetivo" text={challenge.objetivo} />
          <DetailSection icon={ClipboardIcon} title="Requisitos" text={challenge.requisitos} />
          <DetailSection icon={FileText} title="Entregáveis" text={challenge.entregaveis} />
          <DetailSection icon={Star} title="Critérios de avaliação" text={challenge.criterios_avaliativos} />
        </div>
        <aside className="detail-sidebar">
          <div className="content-card"><span className="eyebrow">SOBRE O DESAFIO</span><h3>Prepare-se para construir.</h3><p>Leia as informações, organize suas ideias e mostre como você resolve problemas.</p><div className="detail-sidebar-facts"><span><Clock3 size={16} /> {challenge.prazo} dias para concluir</span><span><UsersRound size={16} /> Experiência prática</span></div><div className="detail-tech"><strong>Tecnologias</strong><div className="tag-list">{(challenge.tecnologias || []).map((technology) => <span className="tag" key={technology}>{technology}</span>)}</div></div>
            {companyView ? <LinkButton className="button-full" to="/empresa/participantes">Ver participantes <ArrowRight size={17} /></LinkButton>
              : existing ? <><StatusBadge>{existing.status}</StatusBadge><LinkButton className="button-full detail-submit-link" to="/app/participacoes">Ver minha participação <ArrowRight size={17} /></LinkButton></>
                : <Button className="button-full" onClick={participate} disabled={busy || challenge.status === 'Encerrado'}>{busy ? 'Registrando...' : 'Participar do desafio'} <ArrowRight size={17} /></Button>}
            <ErrorMessage>{actionError}</ErrorMessage>
          </div>
          <div className="trust-note"><ShieldCheck size={17} /><span>Seu trabalho e suas informações ficam associados apenas à sua conta.</span></div>
        </aside>
      </div>
    </div>
  );
}

function ClipboardIcon(props) {
  return <FileCheck2 {...props} />;
}

function DetailSection({ icon: Icon, title, text }) {
  return <section className="detail-section"><span className="detail-section-icon"><Icon size={19} /></span><div><h2>{title}</h2><p>{text || 'Informação não disponível.'}</p></div></section>;
}

export function ParticipationsPage({ deliveriesOnly = false }) {
  const { token } = useAuth();
  const { data, setData, loading, error } = useResource('/participations/', token);
  const items = (data || []).filter((item) => !deliveriesOnly || item.data_entrega);
  return (
    <div className="page-stack">
      <SectionTitle eyebrow={deliveriesOnly ? 'SEU PORTFÓLIO' : 'SEU PROGRESSO'} title={deliveriesOnly ? 'Suas entregas' : 'Minhas participações'} description={deliveriesOnly ? 'Soluções enviadas e o andamento de cada avaliação.' : 'Acompanhe o progresso de cada desafio e continue de onde parou.'} action={!deliveriesOnly && <LinkButton to="/app/desafios" variant="outline">Explorar desafios <ArrowRight size={16} /></LinkButton>} />
      {loading ? <Loading /> : error ? <PageLoadError error={error} /> : items.length ? (
        <div className="content-card progress-list-card">{items.map((item) => deliveriesOnly ? <DeliveryCard key={item.id} participation={item} /> : <ParticipationWorkCard key={item.id} participation={item} token={token} onUpdate={(updated) => setData((current) => current.map((participation) => participation.id === updated.id ? updated : participation))} />)}</div>
      ) : <EmptyState icon={deliveriesOnly ? FileText : Compass} title={deliveriesOnly ? 'Você ainda não enviou uma solução' : 'Você ainda não participa de um desafio'} description={deliveriesOnly ? 'Quando enviar sua primeira entrega, poderá acompanhar a avaliação por aqui.' : 'Encontre um desafio que combine com sua área de interesse.'} action={<LinkButton to="/app/desafios">Explorar desafios <ArrowRight size={16} /></LinkButton>} />}
    </div>
  );
}

function ParticipationWorkCard({ participation, token, onUpdate }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const updated = await apiPost(`/participations/${participation.id}/submit/`, { entrega_url: url }, token);
      onUpdate(updated);
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <article className="participation-work">
      <ParticipationRow participation={participation} />
      {participation.status === 'Inscrito' && !participation.data_entrega && <form className="inline-submission-form" onSubmit={submit}>
        <Field label="Link da sua solução" type="url" placeholder="https://github.com/seu-usuario/seu-projeto" required value={url} onChange={(event) => setUrl(event.target.value)} />
        <Button type="submit" disabled={busy}>{busy ? 'Enviando...' : 'Entregar solução'} <Send size={15} /></Button>
      </form>}
      {error && <div className="submission-error"><ErrorMessage>{error}</ErrorMessage></div>}
    </article>
  );
}

function DeliveryCard({ participation }) {
  const evaluation = participation.avaliacao;
  return (
    <article className="delivery-card">
      <div className="delivery-card-heading"><span className="delivery-icon"><FileCheck2 size={19} /></span><div><strong>{participation.desafio?.titulo}</strong><span>{participation.desafio?.empresa?.razao_social} · entregue em {formatDate(participation.data_entrega)}</span></div><StatusBadge>{participation.status}</StatusBadge></div>
      <a className="delivery-url" href={participation.entrega_url} target="_blank" rel="noreferrer"><ArrowUpRight size={15} /> Abrir solução enviada</a>
      {evaluation && <div className="evaluation-summary"><span className="evaluation-score"><Star size={16} /> {evaluation.nota}</span><p>{evaluation.feedback}</p></div>}
    </article>
  );
}

export function RecognitionsPage() {
  const { token } = useAuth();
  const { data, loading, error } = useResource('/recognitions/', token);
  const recognitions = data || [];
  const certificates = recognitions.filter((item) => item.tipo?.toLowerCase().includes('certificado'));
  const badges = recognitions.filter((item) => !item.tipo?.toLowerCase().includes('certificado'));
  return (
    <div className="page-stack">
      <SectionTitle eyebrow="CONQUISTAS QUE CONTAM" title="Seu talento reconhecido." description="Certificados, badges e competências que você demonstrou em desafios reais." />
      {loading ? <Loading /> : error ? <PageLoadError error={error} /> : <>
        <div className="recognition-summary">
          <MetricCard icon={Award} label="Badges" value={badges.length} tone="peach" />
          <MetricCard icon={FileCheck2} label="Certificados" value={certificates.length} tone="mint" />
          <MetricCard icon={Trophy} label="Desafios reconhecidos" value={new Set(recognitions.map((item) => item.desafio)).size} tone="lavender" />
          <MetricCard icon={Sparkles} label="Competências" value={new Set(recognitions.flatMap((item) => item.competencias || [])).size} tone="blue" />
        </div>
        {recognitions.length ? <>
          <section className="content-card"><div className="content-card-heading"><div><span className="eyebrow">SUAS CONQUISTAS</span><h2>Badges e certificados</h2><p>Reconhecimentos conquistados com suas entregas.</p></div></div><div className="recognition-grid">{recognitions.map((item) => <article className="recognition-card" key={item.id}><span className={`recognition-icon ${item.tipo?.toLowerCase().includes('certificado') ? 'recognition-certificate' : ''}`}>{item.tipo?.toLowerCase().includes('certificado') ? <FileCheck2 size={23} /> : <Award size={23} />}</span><span className="recognition-type">{item.tipo || 'Reconhecimento'}</span><h3>{item.desafio}</h3><p>{item.empresa} · {formatDate(item.data_emissao)}</p>{item.feedback && <blockquote>{item.feedback}</blockquote>}<div className="tag-list">{(item.competencias || []).map((skill) => <span className="tag" key={skill}>{skill}</span>)}</div></article>)}</div></section>
          <section className="content-card"><div className="content-card-heading"><div><span className="eyebrow">HABILIDADES DEMONSTRADAS</span><h2>Competências que você colocou em prática</h2></div></div><div className="skill-cloud">{[...new Set(recognitions.flatMap((item) => item.competencias || []))].map((skill) => <span className="skill-chip" key={skill}><Check size={15} />{skill}</span>)}</div></section>
        </> : <EmptyState icon={Trophy} title="Suas conquistas começam com uma entrega" description="Participe de um desafio e receba feedback e reconhecimento pelas competências que demonstrar." action={<LinkButton to="/app/desafios">Encontrar desafios <ArrowRight size={16} /></LinkButton>} />}
      </>}
    </div>
  );
}

export function OpportunitiesPage() {
  const { token, user } = useAuth();
  const company = user?.tipo_perfil === 'empresa';
  const { data, loading, error, setData } = useResource('/opportunities/', token);
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState('');
  const respond = async (item, answer) => {
    setBusy(item.id);
    setActionError('');
    try {
      const updated = await apiPost(`/opportunities/${item.id}/respond/`, { resposta: answer }, token);
      setData((current) => current.map((opportunity) => opportunity.id === item.id ? updated : opportunity));
    } catch (reason) {
      setActionError(reason.message);
    } finally {
      setBusy('');
    }
  };
  return (
    <div className="page-stack">
      <SectionTitle eyebrow={company ? 'CONEXÕES PROFISSIONAIS' : 'PORTAS ABERTAS'} title={company ? 'Talentos que chamaram atenção.' : 'Oportunidades para o próximo passo.'} description={company ? 'Acompanhe os convites e conexões feitos a partir dos seus desafios.' : 'Empresas que conheceram seu trabalho e querem conversar.'} />
      <ErrorMessage>{actionError}</ErrorMessage>
      {loading ? <Loading /> : error ? <PageLoadError error={error} /> : data?.length ? <div className="opportunity-list">{data.map((item) => (
        <article className="opportunity-card" key={item.id}>
          <span className="opportunity-mark"><BriefcaseBusiness size={21} /></span>
          <div className="opportunity-content"><div className="opportunity-title-row"><div><span className="eyebrow">{company ? 'CONVITE ENVIADO' : 'UMA EMPRESA QUER CONHECER VOCÊ'}</span><h2>{item.empresa?.razao_social || 'Empresa parceira'}</h2></div><StatusBadge>{item.status}</StatusBadge></div><p>{item.oportunidade}</p><div className="opportunity-meta"><span><Target size={15} /> {company ? `Participação ${item.participacao?.slice(0, 8)}` : 'Convite profissional'}</span><span><Clock3 size={15} /> {formatDate(item.data_envio)}</span></div>{!company && item.status === 'Novo convite' && <div className="opportunity-actions"><Button variant="outline" onClick={() => respond(item, 'Recusado')} disabled={busy === item.id}>Agora não</Button><Button onClick={() => respond(item, 'Aceito')} disabled={busy === item.id}>{busy === item.id ? 'Enviando...' : 'Aceitar contato'} <ArrowRight size={16} /></Button></div>}</div>
        </article>
      ))}</div> : <EmptyState icon={BriefcaseBusiness} title="Nenhuma oportunidade por enquanto" description={company ? 'Quando demonstrar interesse em participantes, seus convites aparecerão aqui.' : 'Continue participando de desafios. Empresas podem convidar você após conhecer suas entregas.'} />}
    </div>
  );
}

export function CompanyChallengesPage() {
  const { token } = useAuth();
  const { data, loading, error } = useResource('/dashboard/', token);
  const challenges = data?.desafios || [];
  return (
    <div className="page-stack">
      <SectionTitle eyebrow="SEUS PROJETOS" title="Desafios publicados." description="Acompanhe as oportunidades e as participações da sua empresa." action={<LinkButton to="/empresa/criar-desafio" icon={ArrowRight}>Criar desafio</LinkButton>} />
      {loading ? <Loading /> : error ? <PageLoadError error={error} /> : challenges.length ? <div className="content-card"><CompanyChallengeList challenges={challenges} /></div> : <EmptyState icon={Target} title="Nenhum desafio publicado ainda" description="Crie sua primeira oportunidade para receber soluções de estudantes." action={<LinkButton to="/empresa/criar-desafio">Publicar desafio <ArrowRight size={16} /></LinkButton>} />}
    </div>
  );
}

export function CreateChallengePage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ titulo: '', descricao: '', area: '', nivel: 'Intermediário', prazo: '7', tecnologias: '', objetivo: '', requisitos: '', entregaveis: '', criterios_avaliativos: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const change = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await apiPost('/challenges/', { ...form, prazo: Number(form.prazo), tecnologias: form.tecnologias.split(',').map((item) => item.trim()).filter(Boolean) }, token);
      navigate('/empresa/desafios', { state: { message: 'Seu desafio foi publicado.' } });
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="page-stack">
      <PageBack to="/empresa/desafios">Voltar para meus desafios</PageBack>
      <SectionTitle eyebrow="NOVA OPORTUNIDADE" title="Publique um desafio." description="Conte sobre uma demanda real do seu time e receba soluções de estudantes." />
      <form className="content-card editor-form" onSubmit={submit}>
        <FormSectionHeading number="01" title="O desafio" subtitle="Apresente o problema que os participantes vão resolver." />
        <Field label="Título do desafio" placeholder="Ex.: Dashboard de Indicadores de Vendas" required maxLength={200} value={form.titulo} onChange={(event) => change('titulo', event.target.value)} />
        <Field label="Descrição" as="textarea" rows={4} placeholder="Descreva o contexto e o problema a resolver." required value={form.descricao} onChange={(event) => change('descricao', event.target.value)} />
        <div className="form-row">
          <Field label="Área" placeholder="Ex.: Dados" required value={form.area} onChange={(event) => change('area', event.target.value)} />
          <SelectField label="Nível" value={form.nivel} onChange={(event) => change('nivel', event.target.value)} options={['Iniciante', 'Intermediário', 'Avançado'].map((value) => ({ value, label: value }))} />
          <SelectField label="Prazo" value={form.prazo} onChange={(event) => change('prazo', event.target.value)} options={[5, 7, 9, 10, 14, 21].map((value) => ({ value: String(value), label: `${value} dias` }))} />
        </div>
        <Field label="Tecnologias e ferramentas" placeholder="Python, SQL, Power BI" required value={form.tecnologias} onChange={(event) => change('tecnologias', event.target.value)} hint="Separe os itens por vírgula." />
        <FormSectionHeading number="02" title="O que esperamos" subtitle="Deixe claro como uma boa solução será reconhecida." />
        <Field label="Objetivo" as="textarea" rows={3} placeholder="O que deve ser alcançado?" required value={form.objetivo} onChange={(event) => change('objetivo', event.target.value)} />
        <Field label="Requisitos" as="textarea" rows={3} placeholder="Quais condições a solução precisa atender?" required value={form.requisitos} onChange={(event) => change('requisitos', event.target.value)} />
        <Field label="Entregáveis" as="textarea" rows={3} placeholder="O que os participantes devem enviar?" required value={form.entregaveis} onChange={(event) => change('entregaveis', event.target.value)} />
        <Field label="Critérios de avaliação" as="textarea" rows={3} placeholder="Quais aspectos serão considerados na avaliação?" required value={form.criterios_avaliativos} onChange={(event) => change('criterios_avaliativos', event.target.value)} />
        <ErrorMessage>{error}</ErrorMessage>
        <div className="editor-actions"><span><ShieldCheck size={16} /> Você poderá acompanhar as participações pelo painel.</span><Button type="submit" disabled={busy}>{busy ? 'Publicando...' : 'Publicar desafio'} <ArrowRight size={17} /></Button></div>
      </form>
    </div>
  );
}

function FormSectionHeading({ number, title, subtitle }) {
  return <div className="form-section-heading"><span>{number}</span><div><h2>{title}</h2><p>{subtitle}</p></div></div>;
}

export function CompanyReviewsPage({ talentsOnly = false }) {
  const { token } = useAuth();
  const { data, loading, error, setData } = useResource('/participations/', token);
  const items = (data || []).filter((item) => talentsOnly ? Boolean(item.avaliacao) : item.status === 'Submetido');
  const title = talentsOnly ? 'Talentos que você conheceu.' : 'Avalie entregas e compartilhe feedback.';
  const [actionError, setActionError] = useState('');
  return (
    <div className="page-stack">
      <SectionTitle eyebrow={talentsOnly ? 'POTENCIAL EM AÇÃO' : 'AVALIAÇÃO E FEEDBACK'} title={talentsOnly ? title : 'Entregas recebidas.'} description={talentsOnly ? 'Estudantes que demonstraram suas habilidades nas soluções.' : 'Analise as soluções dos participantes e ajude cada talento a crescer.'} />
      <ErrorMessage>{actionError}</ErrorMessage>
      {loading ? <Loading /> : error ? <PageLoadError error={error} /> : items.length ? <div className="talent-list">{items.map((item) => <TalentReviewCard key={item.id} participation={item} token={token} talentsOnly={talentsOnly} setData={setData} setActionError={setActionError} />)}</div>
        : <EmptyState icon={talentsOnly ? Sparkles : FileCheck2} title={talentsOnly ? 'Talentos avaliados aparecem aqui' : 'Nenhuma entrega para avaliar'} description={talentsOnly ? 'Depois de avaliar uma entrega, você poderá revisitar o perfil do participante.' : 'As entregas enviadas pelos estudantes serão listadas aqui.'} />}
    </div>
  );
}

function TalentReviewCard({ participation, token, talentsOnly, setData, setActionError }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nota: '', feedback: '', reconhecimento_tipo: '', competencias: '' });
  const [invite, setInvite] = useState(false);
  const [inviteText, setInviteText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const student = participation.estudante || {};
  const evaluation = participation.avaliacao;
  const submitEvaluation = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = { nota: form.nota, feedback: form.feedback };
      if (form.reconhecimento_tipo) {
        payload.reconhecimento_tipo = form.reconhecimento_tipo;
        payload.competencias = form.competencias.split(',').map((value) => value.trim()).filter(Boolean);
      }
      const updated = await apiPost(`/participations/${participation.id}/evaluate/`, payload, token);
      setData((items) => items.map((item) => item.id === updated.id ? updated : item));
      setShowForm(false);
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  };
  const submitInvite = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await apiPost(`/participations/${participation.id}/interest/`, { mensagem: inviteText }, token);
      setInvite(false);
      setInviteText('');
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <article className="talent-card">
      <div className="talent-card-top"><span className="avatar talent-avatar">{initials(student.nome)}</span><div className="talent-identity"><h2>{student.nome || 'Estudante'}</h2><p>{student.curso} · {student.instituicao}</p></div><StatusBadge>{participation.status}</StatusBadge></div>
      <div className="talent-project"><span className="eyebrow">DESAFIO</span><strong>{participation.desafio?.titulo}</strong><span>{participation.data_entrega ? `Entregue em ${formatDate(participation.data_entrega)}` : `Participação desde ${formatDate(participation.data_adesao)}`}</span></div>
      {participation.entrega_url && <a className="delivery-url" href={participation.entrega_url} target="_blank" rel="noreferrer"><ArrowUpRight size={15} /> Abrir solução enviada</a>}
      <div className="skill-cloud">{(student.competencias || []).map((skill) => <span className="skill-chip" key={skill}>{skill}</span>)}</div>
      {evaluation && <div className="evaluation-summary"><span className="evaluation-score"><Star size={16} /> {evaluation.nota}</span><p>{evaluation.feedback}</p></div>}
      <ErrorMessage>{error}</ErrorMessage>
      {!talentsOnly && !evaluation && <div className="talent-card-actions"><Button variant="outline" onClick={() => setShowForm(!showForm)}>{showForm ? 'Fechar avaliação' : 'Avaliar entrega'} <ArrowRight size={16} /></Button></div>}
      {talentsOnly && evaluation && <div className="talent-card-actions"><Button variant="outline" onClick={() => setInvite(!invite)}>{invite ? 'Cancelar' : 'Demonstrar interesse'} <HeartHandshake size={16} /></Button></div>}
      {showForm && <form className="inline-review-form" onSubmit={submitEvaluation}><div className="form-row"><Field label="Nota de 0 a 10" type="number" min="0" max="10" step="0.01" required value={form.nota} onChange={(event) => setForm({ ...form, nota: event.target.value })} /><SelectField label="Reconhecimento (opcional)" value={form.reconhecimento_tipo} onChange={(event) => setForm({ ...form, reconhecimento_tipo: event.target.value })} options={[{ value: '', label: 'Sem reconhecimento' }, { value: 'Badge', label: 'Badge' }, { value: 'Certificado', label: 'Certificado' }]} /></div><Field label="Feedback" as="textarea" rows={3} required placeholder="Compartilhe pontos fortes e oportunidades de melhoria." value={form.feedback} onChange={(event) => setForm({ ...form, feedback: event.target.value })} />{form.reconhecimento_tipo && <Field label="Competências reconhecidas" placeholder="Python, Análise de dados" value={form.competencias} onChange={(event) => setForm({ ...form, competencias: event.target.value })} />}<Button type="submit" disabled={busy}>{busy ? 'Salvando...' : 'Enviar avaliação'} <Send size={16} /></Button></form>}
      {invite && <form className="inline-review-form" onSubmit={submitInvite}><Field label="Mensagem do convite" as="textarea" rows={3} required placeholder="Conte ao estudante por que você gostaria de conversar." value={inviteText} onChange={(event) => setInviteText(event.target.value)} /><Button type="submit" disabled={busy}>{busy ? 'Enviando...' : 'Enviar convite'} <Send size={16} /></Button></form>}
    </article>
  );
}

export function ProfilePage() {
  const { token, user, refreshUser } = useAuth();
  const { data, loading, error } = useResource('/profile/', token);
  const navigate = useNavigate();
  const company = user?.tipo_perfil === 'empresa';
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  useEffect(() => {
    if (data) setForm({ ...data, competencias: (data.competencias || []).join(', ') });
  }, [data]);
  const fields = company
    ? [['area_atuacao', 'Área de atuação'], ['descricao', 'Sobre a empresa']]
    : [['curso', 'Curso'], ['instituicao', 'Instituição'], ['area_interesse', 'Área de interesse'], ['biografia', 'Sobre você'], ['competencias', 'Competências']];
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback('');
    const payload = { ...form };
    if (!company) payload.competencias = form.competencias.split(',').map((value) => value.trim()).filter(Boolean);
    try {
      await apiPatch('/profile/', payload, token);
      setFeedback('Perfil atualizado com sucesso.');
      await refreshUser();
    } catch (reason) {
      setFeedback(reason.message);
    } finally {
      setSaving(false);
    }
  };
  if (loading) return <Loading />;
  if (error) return <PageLoadError error={error} />;
  if (!form) return null;
  return (
    <div className="page-stack">
      <SectionTitle eyebrow={company ? 'IDENTIDADE DA EMPRESA' : 'SUA IDENTIDADE PROFISSIONAL'} title={company ? 'Perfil da empresa.' : 'Seu perfil.'} description={company ? 'Mantenha as informações da sua empresa atualizadas.' : 'Conte sobre você e as competências que está desenvolvendo.'} />
      <form className="content-card profile-card" onSubmit={save}>
        <div className="profile-heading"><span className={`avatar profile-avatar ${company ? 'avatar-company' : ''}`}>{company ? <Building2 size={23} /> : initials(user?.nome)}</span><span><strong>{company ? data.razao_social || user?.nome : user?.nome}</strong><small>{user?.email}</small></span></div>
        <div className="profile-fields">{fields.map(([key, label]) => <Field key={key} label={label} as={key === 'descricao' || key === 'biografia' ? 'textarea' : undefined} rows={key === 'descricao' || key === 'biografia' ? 4 : undefined} value={form[key] ?? ''} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />)}</div>
        <ErrorMessage>{feedback}</ErrorMessage>
        <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar alterações'} <Check size={16} /></Button>
      </form>
    </div>
  );
}

function PageLoadError({ error }) {
  return <div className="page-error" role="alert"><span><CircleHelp size={20} /></span><div><strong>Não foi possível carregar esta página.</strong><p>{error}</p></div></div>;
}
