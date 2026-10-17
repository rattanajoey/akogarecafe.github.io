import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import { Link } from 'react-router-dom';
import { PROJECTS, SOURCES, METRICS, coverage, dateRange, chartSeries, format, compact, csv, finite, change, sumKnown } from './data';
import { loadWorkspace, googleConsent, listProperties, listStreams, fetchGoogle } from './api';
import './dashboard.css';

function Icon({ name, size = 20, ...props }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    trend: <><path d="m3 17 6-6 4 4 8-10"/><path d="M15 5h6v6"/></>,
    link: <><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2"/></>,
    refresh: <><path d="M20 7a9 9 0 1 0 1 9M20 3v5h-5"/></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6"/></>,
    external: <><path d="M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></>,
    youtube: <><rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z"/></>,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17 7h.01"/></>,
    web: <><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></>,
    ios: <><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 18h4M10 5h4"/></>,
    pinterest: <><circle cx="12" cy="12" r="9"/><path d="m9 21 3-12m-1 5c5 4 8-4 4-7-4-3-9 2-7 6"/></>,
    people: <><circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m1-16a3 3 0 0 1 0 6m2 3a6 6 0 0 1 3 5v2"/></>,
    close: <path d="m6 6 12 12M6 18 18 6"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    coffee: <><path d="M4 8h13v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8Zm13 1h2a3 3 0 1 1 0 6h-2M7 3v2m5-2v2M2 23h18"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.trend}</svg>;
}
const statusLabel = report => report?.stale ? 'Refresh failed' : ({ connected: 'Connected', partial: 'Limited access', unavailable: 'Needs connection', error: 'Needs attention' }[report?.status] || 'Not connected');

function ActivityChart({ sources, reports, metric }) {
  const rows = chartSeries(sources, reports, metric);
  const projects = PROJECTS.filter(p => sources.some(s => s.project === p.id));
  const max = Math.max(1, ...rows.flatMap(row => projects.map(p => row[p.id] || 0)));
  const points = (p) => rows.flatMap((r, i) => finite(r[p.id]) ? [{ x: 46 + i * 694 / Math.max(rows.length - 1, 1), y: 178 - r[p.id] / max * 150, date: r.date, value: r[p.id] }] : []);
  return <div className="ad-chart">
    <svg viewBox="0 0 780 218" role="img" aria-label={rows.length ? `${METRICS[metric].label} by project and date` : 'No activity report connected yet'}>
      {[0, 1, 2, 3].map(i => <g key={i}><line x1="46" x2="750" y1={28 + i * 50} y2={28 + i * 50} stroke="currentColor" strokeOpacity=".08" strokeDasharray="3 6"/>{rows.length > 0 && <text x="36" y={32 + i * 50} textAnchor="end">{compact(max * (3 - i) / 3)}</text>}</g>)}
      {projects.map(p => { const pts = points(p); return <g key={p.id}><polyline points={pts.map(v => `${v.x},${v.y}`).join(' ')} fill="none" stroke={p.color} strokeWidth="2.5" strokeLinejoin="round"/>{pts.map(v => <circle key={v.date} cx={v.x} cy={v.y} r="3" fill={p.color}><title>{p.name} · {v.date}: {format(v.value)}</title></circle>)}</g>; })}
      {rows.length > 0 && [0, Math.floor((rows.length - 1) / 2), rows.length - 1].filter((v, i, a) => a.indexOf(v) === i).map(i => <text key={i} x={46 + i * 694 / Math.max(rows.length - 1, 1)} y="208" textAnchor="middle">{new Date(`${rows[i].date}T12:00:00Z`).toLocaleDateString('en', { month: 'short', day: 'numeric', timeZone: 'UTC' })}</text>)}
    </svg>
    {!rows.length && <div className="ad-chart-empty"><span className="ad-empty-icon"><Icon name="trend" size={25}/></span><strong>Your growth story starts here</strong><span>Connect a reporting source to see daily performance.</span></div>}
  </div>;
}

export function DashboardWorkspace({ user, reports, products, busy, error, days, setDays, onRefresh, onLogin, onLogout, onConnect, lastUpdated }) {
  const [page, setPage] = useState('overview');
  const [project, setProject] = useState('all');
  const [metric, setMetric] = useState('views');
  const [platform, setPlatform] = useState('all');
  const sources = SOURCES.filter(s => (project === 'all' || s.project === project) && (platform === 'all' || s.kind === platform));
  const projects = PROJECTS.filter(p => project === 'all' || p.id === project);
  const connected = sources.filter(s => ['connected', 'partial'].includes(reports[s.id]?.status)).length;
  const anyData = sources.some(s => Object.values(reports[s.id]?.metrics || {}).some(finite));
  const range = dateRange(days);
  const exportData = () => {
    const blob = new Blob([csv(reports, sources, range)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `akogare-analytics-${range.start}-${range.end}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const pickProject = id => { setProject(id); setPlatform('all'); setPage('overview'); };
  return <div className="ad">
    <aside className="ad-sidebar" aria-label="Dashboard navigation">
      <Link className="ad-brand" to="/"><span className="ad-brand-icon"><Icon name="coffee" size={24}/></span><span>akogare<span className="ad-brand-sub">THE STUDIO</span></span></Link>
      <div className="ad-workspace-label">WORKSPACE <span>01</span></div>
      <nav className="ad-nav">
        <button className={page === 'overview' && project === 'all' ? 'active' : ''} onClick={() => pickProject('all')}><Icon name="grid"/>Overview<span className="ad-nav-arrow">↗</span></button>
        <button className={page === 'connections' ? 'active' : ''} onClick={() => setPage('connections')}><Icon name="link"/>Connections<span className="ad-nav-count">{SOURCES.length}</span></button>
      </nav>
      <div className="ad-workspace-label ad-project-label">YOUR PROJECTS <span>{PROJECTS.length.toString().padStart(2, '0')}</span></div>
      <nav className="ad-project-nav">{PROJECTS.map(p => <button key={p.id} className={project === p.id && page === 'overview' ? 'selected' : ''} onClick={() => pickProject(p.id)}><span className="ad-project-dot" style={{ background: p.color }}/>{p.name}</button>)}</nav>
      <div className="ad-sidebar-bottom"><div className="ad-private"><Icon name="lock" size={15}/><span>Private workspace<br/><small>For you and your invited team.</small></span></div><a href="https://akogarecafe.com" className="ad-return">Back to the cafe <Icon name="external" size={14}/></a></div>
    </aside>
    <div className="ad-body">
      <header className="ad-topbar"><div><span className="ad-breadcrumb">Workspace</span><span className="ad-slash">/</span>{page === 'connections' ? 'Connections' : project === 'all' ? 'Overview' : PROJECTS.find(p => p.id === project).name}</div><div className="ad-account"><span className="ad-private-tag"><Icon name="lock" size={12}/> Private</span>{user ? <button className="ad-account-button" onClick={onLogout} title="Sign out"><span className="ad-avatar">{(user.displayName || user.email || 'A').charAt(0)}</span><span>{user.displayName?.split(' ')[0] || 'Your account'}<small>Sign out</small></span></button> : <button className="ad-small-button" onClick={onLogin}>Sign in <Icon name="arrow" size={14}/></button>}</div></header>
      <nav className="ad-mobile-nav" aria-label="Mobile dashboard navigation"><button className={page === 'overview' ? 'active' : ''} onClick={() => pickProject('all')}>Overview</button><button className={page === 'connections' ? 'active' : ''} onClick={() => setPage('connections')}>Connections</button><select aria-label="Choose project" value={project} onChange={e => pickProject(e.target.value)}><option value="all">All projects</option>{PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></nav>
      <div className="ad-content">
        <section className="ad-heading"><div><div className="ad-eyebrow"><span/> THE BIG PICTURE</div><h1>{page === 'connections' ? 'Everything, connected.' : project === 'all' ? 'A view of everything.' : PROJECTS.find(p => p.id === project).name}</h1><p>{page === 'connections' ? 'Your accounts, your data. One place to bring it together.' : 'All your projects. Every channel. A little more perspective.'}</p></div><div className="ad-heading-actions"><label className="ad-period"><Icon name="grid" size={15}/><select aria-label="Reporting period" value={days} onChange={e => setDays(Number(e.target.value))}><option value={7}>Last 7 days</option><option value={28}>Last 28 days</option><option value={90}>Last 90 days</option></select></label><button className="ad-icon-button" onClick={onRefresh} disabled={!user || busy} aria-label="Refresh analytics"><Icon name="refresh" className={busy ? 'ad-spin' : ''}/></button><button className="ad-small-button ad-export" onClick={exportData} disabled={!anyData}><Icon name="download" size={16}/>Export</button></div></section>
        {error && <div className="ad-error" role="alert">{error}<button onClick={onRefresh} disabled={busy || !user}>Try again</button></div>}
        {!user && <div className="ad-welcome"><span className="ad-welcome-icon"><Icon name="lock" size={20}/></span><div><strong>A private home for your numbers.</strong><p>Sign in with your admin account to load your projects’ analytics.</p></div><button className="ad-primary" onClick={onLogin}>Open my workspace <Icon name="arrow" size={16}/></button></div>}
        {page === 'overview' ? <>
          <div className="ad-summary">{['followers', coverage(sources, reports, 'views').known ? 'views' : 'lifetimeViews', 'sessions', 'activeUsers'].map((key, i) => { const m = METRICS[key];
            const c = coverage(sources, reports, key);
            const eligible = sources.filter(s => m.kinds.includes(s.kind));
            const comparable = eligible.filter(s => finite(reports[s.id]?.metrics?.[key]) && finite(reports[s.id]?.previous?.[key]));
            const delta = comparable.length === eligible.length && comparable.length ? change(c.value, comparable.reduce((sum, s) => sum + reports[s.id].previous[key], 0)) : null;
            return <article className="ad-stat" key={key}><div className="ad-stat-label">{m.label}<Icon name={['people', 'youtube', 'web', 'ios'][i]} size={17}/></div><div className="ad-stat-value">{format(c.value)}{delta !== null && <span className={delta >= 0 ? 'ad-positive' : 'ad-negative'}>{delta > 0 ? '+' : ''}{delta.toFixed(1)}%</span>}</div><div className="ad-stat-description">{m.detail}</div><div className="ad-coverage"><span style={{ width: `${c.total ? c.known / c.total * 100 : 0}%` }}/></div><div className="ad-stat-foot">{c.total ? `${c.known} of ${c.total} sources reporting${c.known && c.known < c.total ? ' · partial total' : ''}` : 'No sources in this filter'}</div></article>;
          })}</div>
          <section className="ad-panel ad-activity"><div className="ad-panel-head"><div><h2>Across the studio</h2><p>{range.start} — {range.end} <span>· completed days</span></p></div><select aria-label="Chart metric" value={metric} onChange={e => setMetric(e.target.value)}><option value="views">Content views</option><option value="sessions">Website sessions</option><option value="activeUsers">App active users</option></select></div><ActivityChart sources={sources} reports={reports} metric={metric}/><div className="ad-chart-legend">{projects.map(p => <span key={p.id}><i style={{ background: p.color }}/>{p.name}</span>)}<small>{metric === 'activeUsers' ? 'Daily users · not additive across days' : 'Source reporting timezones may differ'}</small></div></section>
          <section className="ad-project-section"><div className="ad-section-head"><div><h2>Your projects <span>{projects.length.toString().padStart(2, '0')}</span></h2><p>Different ideas. One shared view.</p></div>{project !== 'all' && <button className="ad-text-button" onClick={() => pickProject('all')}>All projects <Icon name="arrow" size={16}/></button>}</div><div className="ad-project-grid">{projects.map(p => {
            const own = sources.filter(s => s.project === p.id);
            const c = own.filter(s => ['connected', 'partial'].includes(reports[s.id]?.status)).length;
            const audience = coverage(own, reports, 'followers');
            const views = coverage(own, reports, 'views');
            const sessions = coverage(own, reports, 'sessions');
            const lifetime = sumKnown(own.filter(s => s.kind === 'youtube').map(s => reports[s.id]?.metrics?.lifetimeViews));
            const product = products?.[p.id];
            const productProject = ['pindo', 'cine'].includes(p.id);
            return <article className="ad-project-card" key={p.id}><div className="ad-project-card-top"><span className="ad-monogram" style={{ background: p.color }}>{p.short}</span><a href={p.url} target="_blank" rel="noreferrer" aria-label={`Open ${p.name}`}><Icon name="external" size={16}/></a></div><button className="ad-project-name" onClick={() => pickProject(p.id)}>{p.name}<Icon name="arrow" size={15}/></button><p className="ad-category">{p.category}</p><div className="ad-project-platforms">{SOURCES.filter(s => s.project === p.id).map(s => <span key={s.id} title={`${s.label}: ${statusLabel(reports[s.id])}`} className={reports[s.id]?.metrics && Object.values(reports[s.id].metrics).some(finite) ? 'is-connected' : ''}><Icon name={s.kind} size={15}/></span>)}</div><div className="ad-project-numbers"><div><strong>{format(productProject ? product?.registeredUsers : audience.value)}</strong><span>{productProject ? 'registered accounts' : 'audience · current'}</span></div><div><strong>{format(productProject ? sessions.value : views.known ? views.value : lifetime)}</strong><span>{productProject ? 'website sessions' : views.known ? 'content views · period' : 'YouTube views · lifetime'}</span></div></div><div className="ad-project-card-foot"><span className={`ad-status-dot ${c ? 'on' : ''}`}/>{c} / {own.length} sources reporting<button onClick={() => { setProject(p.id); setPage('connections'); }}>Manage <Icon name="arrow" size={13}/></button></div></article>;
          })}</div></section>
        </> : <div className="ad-connection-intro"><Icon name="link" size={22}/><div><strong>{SOURCES.filter(s => ['connected', 'partial'].includes(reports[s.id]?.status)).length} / {SOURCES.length} sources reporting</strong><p>Counts are current snapshots. Views and traffic use the selected reporting period. Limited access means only some metrics are available.</p></div></div>}
        <section className="ad-panel ad-sources"><div className="ad-panel-head"><div><h2>{page === 'connections' ? 'Your connected world' : 'Channel breakdown'}</h2><p>{connected} of {sources.length} sources reporting{lastUpdated && ` · Refreshed ${new Date(lastUpdated).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}`}</p></div><label className="ad-source-filter"><span className="ad-sr-only">Filter by platform</span><select value={platform} onChange={e => setPlatform(e.target.value)}><option value="all">All platforms</option><option value="youtube">YouTube</option><option value="instagram">Instagram</option><option value="web">Website</option><option value="ios">iOS</option><option value="pinterest">Pinterest</option></select></label></div>
          <div className="ad-table-wrap"><table><thead><tr><th>PROJECT / CHANNEL</th><th>AUDIENCE <small>current</small></th><th>CONTENT VIEWS <small>period / lifetime</small></th><th>ACTIVITY <small>period</small></th><th>CONNECTION</th><th><span className="ad-sr-only">Actions</span></th></tr></thead><tbody>{sources.map(s => {
            const r = reports[s.id]; const p = PROJECTS.find(p => p.id === s.project);
            const activityKey = s.kind === 'web' ? 'sessions' : s.kind === 'ios' ? 'activeUsers' : s.kind === 'pinterest' ? 'outboundClicks' : 'likes';
            return <React.Fragment key={s.id}><tr><td><div className="ad-source-name"><span className={`ad-platform-icon ${s.kind}`}><Icon name={s.kind} size={18}/></span><div><strong>{p.name} <span>· {s.label}</span></strong>{s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.account} ↗</a> : <small>{s.account}</small>}</div></div></td><td className="ad-number">{format(r?.metrics?.followers)}</td><td className="ad-number">{format(r?.metrics?.views ?? r?.metrics?.lifetimeViews)}<small>{finite(r?.metrics?.views) ? 'selected period' : finite(r?.metrics?.lifetimeViews) ? 'YouTube · lifetime' : ''}</small></td><td className="ad-number">{format(r?.metrics?.[activityKey])}<small>{s.kind === 'web' ? 'sessions' : s.kind === 'ios' ? 'active users' : s.kind === 'pinterest' ? 'outbound clicks' : 'likes'}</small></td><td><span className={`ad-status ${r?.stale ? 'stale' : r?.status || 'unavailable'}`}><i/>{statusLabel(r)}</span></td><td><button className="ad-connect-button" onClick={() => onConnect(s)}>{r?.status === 'connected' ? 'Details' : 'Set up'}<Icon name="arrow" size={13}/></button></td></tr>{(r?.error || r?.stale) && <tr className="ad-source-error"><td colSpan="6">{r.error || 'The last refresh failed. Showing the previous report.'}</td></tr>}</React.Fragment>;
          })}</tbody></table>{!sources.length && <p className="ad-table-empty">No channels match these filters.</p>}</div>
        </section>
        {user && products && <section className="ad-product-stats"><div className="ad-section-head"><div><h2>Inside the products</h2><p>Firebase account totals · shared across web and iOS.</p></div></div><div className="ad-product-grid">{Object.entries(products).map(([id, product]) => <article key={id} className="ad-product-card"><span className="ad-project-dot" style={{ background: PROJECTS.find(p => p.id === id)?.color }}/><div><h3>{PROJECTS.find(p => p.id === id)?.name}</h3><p>{product.error || `${format(product.registeredUsers)} registered accounts · ${format(product.signedInUsers)} signed in during this period`}</p><small>{product.note || 'Sign-ins count authentication activity, rather than all product usage.'}</small></div></article>)}</div></section>}
        <footer className="ad-footer"><span>AKOGARE <span className="ad-footer-star">✳</span> BUILT WITH INTENTION.</span><span>Audience totals aren’t unique people. Missing reports stay unknown.</span></footer>
      </div>
    </div>
  </div>;
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState({});
  const [products, setProducts] = useState(null);
  const [days, setDays] = useState(28);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginBusy, setLoginBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [source, setSource] = useState(null);
  const [sourceBusy, setSourceBusy] = useState(false);
  const [sourceError, setSourceError] = useState('');
  const [sourceToken, setSourceToken] = useState(null);
  const [properties, setProperties] = useState([]);
  const [streams, setStreams] = useState([]);
  const [mapping, setMapping] = useState({ propertyId: '', streamId: '' });
  const sessions = useRef({});
  const generation = useRef(0);
  const identity = useRef(null);
  const request = useRef(null);
  const cancelRequests = useCallback(() => { generation.current++; request.current?.abort(); }, []);
  useEffect(() => {
    let unsubscribe, mounted = true;
    import('../../config/firebase').then(async ({ auth }) => {
      const { onAuthStateChanged } = await import('firebase/auth');
      if (!mounted) return;
      unsubscribe = onAuthStateChanged(auth, next => {
        generation.current++; request.current?.abort(); sessions.current = {}; identity.current = next?.uid || null;
        setReports({}); setProducts(null); setLastUpdated(null); setSource(null); setSourceToken(null); setProperties([]); setStreams([]); setError(''); setUser(next);
      });
    }).catch(() => mounted && setError('Sign-in is not configured in this environment. The dashboard is available on the live website.'));
    return () => { mounted = false; unsubscribe?.(); cancelRequests(); };
  }, [cancelRequests]);
  const refresh = useCallback(async () => {
    if (!user) return;
    const version = ++generation.current;
    request.current?.abort(); const controller = new AbortController(); request.current = controller;
    setBusy(true); setError('');
    try {
      const data = await loadWorkspace(user, days, controller.signal);
      if (version !== generation.current) return;
      const next = { ...data.sources };
      await Promise.all(Object.entries(sessions.current).map(async ([id, session]) => {
        try { next[id] = { ...next[id], ...await fetchGoogle(SOURCES.find(s => s.id === id), session.token, days, session.mapping) }; }
        catch (err) { next[id] = { ...next[id], error: err.message, status: Object.values(next[id]?.metrics || {}).some(finite) ? 'partial' : 'error' }; }
      }));
      if (version !== generation.current) return;
      setReports(old => Object.fromEntries(Object.entries(next).map(([id, report]) => [id, report.error && Object.values(old[id]?.metrics || {}).some(finite) ? { ...old[id], stale: true, error: report.error } : report])));
      setProducts(data.products || null); setLastUpdated(data.fetchedAt);
    } catch (err) {
      if (version !== generation.current || err.name === 'AbortError') return;
      setError(err.message); setReports(old => Object.fromEntries(Object.entries(old).map(([id, r]) => [id, { ...r, stale: true }])));
    } finally { if (version === generation.current) setBusy(false); }
  }, [user, days]);
  useEffect(() => { setReports({}); setProducts(null); setLastUpdated(null); refresh(); }, [refresh]);
  useEffect(() => { const interval = setInterval(() => { if (document.visibilityState === 'visible') refresh(); }, 300000); return () => clearInterval(interval); }, [refresh]);
  const login = async (event, google = false) => {
    event?.preventDefault(); setLoginBusy(true); setError('');
    try {
      const [{ auth }, sdk] = await Promise.all([import('../../config/firebase'), import('firebase/auth')]);
      if (google) { const provider = new sdk.GoogleAuthProvider(); provider.setCustomParameters({ prompt: 'select_account' }); await sdk.signInWithPopup(auth, provider); }
      else await sdk.signInWithEmailAndPassword(auth, email.trim(), password);
      setPassword(''); setLoginOpen(false);
    } catch (err) { setError(err.code === 'auth/popup-closed-by-user' ? 'Sign-in was closed. Try again when ready.' : 'Sign-in failed. Check your account details or try Google sign-in.'); }
    finally { setLoginBusy(false); }
  };
  const logout = async () => { generation.current++; identity.current = null; request.current?.abort(); sessions.current = {}; setReports({}); setProducts(null); setUser(null); setSource(null); setSourceToken(null); const { auth } = await import('../../config/firebase'); const { signOut } = await import('firebase/auth'); await signOut(auth); };
  const connect = selected => { if (!user) { setLoginOpen(true); return; } setSource(selected); setSourceError(''); setSourceToken(null); setProperties([]); setStreams([]); setMapping({ propertyId: '', streamId: '' }); };
  const consent = async () => {
    if (!source || !user) return;
    const uid = user.uid; const selected = source; setSourceBusy(true); setSourceError('');
    try {
      const token = await googleConsent(selected.kind);
      if (identity.current !== uid) return;
      if (selected.kind === 'youtube') {
        const report = await fetchGoogle(selected, token, days);
        if (identity.current !== uid) return;
        sessions.current[selected.id] = { token }; setReports(old => ({ ...old, [selected.id]: report })); setSource(null);
      } else { const available = await listProperties(token); if (identity.current !== uid) return; setSourceToken(token); setProperties(available); }
    } catch (err) { if (identity.current === uid) setSourceError(err.message); }
    finally { setSourceBusy(false); }
  };
  const propertyChange = async propertyId => {
    const uid = identity.current;
    setMapping({ propertyId, streamId: '' }); setStreams([]); if (!propertyId) return;
    setSourceBusy(true); setSourceError('');
    try { const available = (await listStreams(sourceToken, propertyId)).filter(s => s.type === (source.kind === 'ios' ? 'IOS_APP_DATA_STREAM' : 'WEB_DATA_STREAM')); if (identity.current === uid) setStreams(available); }
    catch (err) { setSourceError(err.message); } finally { setSourceBusy(false); }
  };
  const saveGoogle = async () => {
    const uid = user?.uid; setSourceBusy(true); setSourceError('');
    try { const report = await fetchGoogle(source, sourceToken, days, mapping); if (identity.current !== uid) return; sessions.current[source.id] = { token: sourceToken, mapping }; setReports(old => ({ ...old, [source.id]: report })); setSource(null); setSourceToken(null); }
    catch (err) { setSourceError(err.message); } finally { setSourceBusy(false); }
  };
  const sourceReport = source && reports[source.id];
  return <><DashboardWorkspace user={user} reports={reports} products={products} busy={busy} error={error} days={days} setDays={setDays} onRefresh={refresh} onLogin={() => { setError(''); setLoginOpen(true); }} onLogout={logout} onConnect={connect} lastUpdated={lastUpdated}/>
    <Dialog open={loginOpen} onClose={() => !loginBusy && setLoginOpen(false)} maxWidth="xs" fullWidth classes={{ paper: 'ad-dialog' }}><DialogTitle><span className="ad-dialog-title">Welcome to your studio<button className="ad-icon-button" onClick={() => setLoginOpen(false)} aria-label="Close sign-in"><Icon name="close"/></button></span></DialogTitle><DialogContent><p className="ad-dialog-description">Use your Akogare admin account. Reports are available only to approved workspace members.</p><button className="ad-primary ad-full" disabled={loginBusy} onClick={e => login(e, true)}>Continue with Google</button><div className="ad-or">or use your existing email login</div><form onSubmit={login} className="ad-form"><label>Email<input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)}/></label><label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)}/></label>{error && <p role="alert" className="ad-form-error">{error}</p>}<button className="ad-primary ad-full" disabled={loginBusy}>{loginBusy ? 'Signing in…' : 'Sign in to workspace'}</button></form></DialogContent></Dialog>
    <Dialog open={Boolean(source)} onClose={() => !sourceBusy && setSource(null)} maxWidth="sm" fullWidth classes={{ paper: 'ad-dialog' }}><DialogTitle><span className="ad-dialog-title">{source?.label} · {source?.account}<button className="ad-icon-button" onClick={() => setSource(null)} aria-label="Close source details"><Icon name="close"/></button></span></DialogTitle><DialogContent>
      {sourceReport?.metrics && <div className="ad-source-metrics">{Object.entries(sourceReport.metrics).filter(([, value]) => finite(value)).map(([key, value]) => <div key={key}><span>{({ lifetimeViews: 'Lifetime views', followers: 'Subscribers / followers · current', publishedItems: 'Published items · current', views: 'Views · selected period', watchHours: 'Watch hours · selected period', activeUsers: 'Active users · selected period', sessions: 'Sessions · selected period', downloads: 'App downloads · selected period', impressions: 'Impressions · selected period' }[key] || key.replace(/([A-Z])/g, ' $1'))}</span><strong>{format(value)}</strong></div>)}</div>}
      <p className="ad-dialog-description">{sourceReport?.note || sourceReport?.error || 'Connect this account to bring its reporting into your dashboard.'}</p>
      {source && ['youtube', 'web', 'ios'].includes(source.kind) ? <>
        <p className="ad-dialog-description">Google access is read-only. Choose the account that owns this {source.kind === 'youtube' ? 'YouTube channel' : 'Analytics property'}. Reporting access lasts for this browser session; reconnect when it expires.</p>
        <button className="ad-primary" disabled={sourceBusy} onClick={consent}>{sourceBusy ? 'Connecting…' : source.kind === 'youtube' ? 'Connect YouTube Analytics' : 'Connect Google Analytics'}<Icon name="arrow" size={16}/></button>
        {sourceToken && <div className="ad-form ad-stream-form"><label>Analytics property<select value={mapping.propertyId} onChange={e => propertyChange(e.target.value)} disabled={sourceBusy}><option value="">Choose a property</option>{properties.map(p => <option key={p.id} value={p.id}>{p.name} · {p.id}</option>)}</select></label>{!properties.length && <p>No Analytics properties are available to this Google account.</p>}<label>{source.kind === 'ios' ? 'iOS' : 'Web'} data stream<select value={mapping.streamId} disabled={!streams.length || sourceBusy} onChange={e => setMapping(old => ({ ...old, streamId: e.target.value }))}><option value="">Choose a stream</option>{streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label><button className="ad-primary" disabled={!mapping.streamId || sourceBusy} onClick={saveGoogle}>Use this stream <Icon name="check" size={16}/></button></div>}
      </> : <div className="ad-setup-note"><Icon name="lock" size={18}/><p>{source?.kind === 'pinterest' ? 'Pinterest needs its own read-only account authorization before automatic reporting can begin. Your signed-in Pinterest browser session does not grant API access.' : 'Basic account metrics use the saved server connection. Views, reach and saves require Instagram Insights permission. If those are missing, the account needs renewed consent.'}</p></div>}
      {source?.kind === 'ios' && <p className="ad-dialog-description">App usage comes from Firebase/GA4. Download and sales reports need a separate App Store Connect reporting key.</p>}
      {sourceError && <p className="ad-form-error" role="alert">{sourceError}</p>}
    </DialogContent></Dialog>
  </>;
}
