import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback, lazy, Suspense } from "react";

import { useTheme, ThemeProvider } from "./contexts/ThemeContext";
import { useAuth, AuthProvider } from "./contexts/AuthContext";
export { useTheme, ThemeProvider, useAuth, AuthProvider };

// Lazy loading route components
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Contests = lazy(() => import("./pages/Contests"));
const ContestDetail = lazy(() => import("./pages/ContestDetail"));
const Problems = lazy(() => import("./pages/Problems"));
const ProblemDetails = lazy(() => import("./pages/ProblemDetails"));
const Submit = lazy(() => import("./pages/Submit"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const MySubmissions = lazy(() => import("./pages/MySubmissions"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const Profile = lazy(() => import("./pages/Profile"));
const Tracks = lazy(() => import("./pages/Tracks"));
const TrackDetails = lazy(() => import("./pages/TrackDetails"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));

import ErrorBoundary from "./components/ErrorBoundary";

import { ToastProvider, useToast } from "./components/Toast";
import ConfirmDialog from "./components/ConfirmDialog";
import NotificationBell from "./components/NotificationBell";
import "./index.css";

// ─── Timer Hook ───
function useContestTimer(startTime: string, durationMinutes: number) {
  const [text, setText] = useState("");
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    const update = () => {
      if (!startTime || !durationMinutes) return;
      const end = new Date(startTime).getTime() + durationMinutes * 60000;
      const diff = end - Date.now();
      if (diff <= 0) { setText("00:00:00"); setExpired(true); return; }
      const h = Math.floor(diff / 3600000); const m = Math.floor((diff % 3600000) / 60000); const s = Math.floor((diff % 60000) / 1000);
      setText(`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`);
    };
    update(); const id = setInterval(update, 1000); return () => clearInterval(id);
  }, [startTime, durationMinutes]);
  return { text, expired };
}

// ─── Layout ───
function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated, activeContest, refreshActiveContest } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const timer = useContestTimer(activeContest?.start_time || "", activeContest?.duration_minutes || 0);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [examStats, setExamStats] = useState({ solved: 0, total: 0 });

  const fetchStats = useCallback(async () => {
    if (!activeContest || !user) return;
    try {
      const api = await import("./api/api");
      const [problems, submissionsRes] = await Promise.all([
        api.fetchContestProblems(activeContest.active_contest_id),
        api.fetchSubmissions({ user_id: user.user_id, contest_id: activeContest.active_contest_id, limit: 300 })
      ]);
      const subs = submissionsRes.data || [];
      let solved = 0;
      problems.forEach((p: any) => {
        const maxScore = subs.filter((s: any) => s.problem_id === p.problem_id).reduce((max: number, s: any) => Math.max(max, s.score), 0);
        if (maxScore > 0) solved++;
      });
      setExamStats({ solved, total: problems.length });
    } catch (e) {
      console.error(e);
    }
  }, [activeContest, user]);

  useEffect(() => {
    fetchStats();
    const handleSubmission = () => fetchStats();
    window.addEventListener('submission-success', handleSubmission);
    return () => window.removeEventListener('submission-success', handleSubmission);
  }, [fetchStats]);

  const handleLogout = () => { logout(); navigate("/login"); };

  const handleFinishExam = async () => {
    if (!activeContest) return;
    try { 
      const api = await import("./api/api");
      await api.finishContest(activeContest.active_contest_id); 
      await refreshActiveContest(); 
      showToast("Exam finished!", "success"); 
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      navigate(`/contests/${activeContest.active_contest_id}`); 
    }
    catch { showToast("Failed to finish exam", "error"); }
    setShowFinishConfirm(false);
  };

  useEffect(() => {
    if (timer.expired && activeContest) {
      showToast("⏰ Time is up! Exam auto-finished.", "warning", 6000);
      import("./api/api").then(m => m.finishContest(activeContest.active_contest_id)).then(() => refreshActiveContest()).then(() => {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        navigate(`/contests/${activeContest.active_contest_id}`);
      });
    }
  }, [timer.expired]);

  useEffect(() => {
    if (activeContest) {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    }
  }, [activeContest]);

  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  const isLocked = !!activeContest;

  return (
    <div className="layout">
      {isLocked ? (
        <header className="navbar locked-navbar">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="locked-warning">
              <span className="secure-badge-dot" />
              <span>EXAM IN PROGRESS</span>
            </div>
            <div className="exam-stats">
              <span className="exam-stat-item">Solved: {examStats.solved} / {examStats.total}</span>
              <span className="exam-stat-item">Remaining: {examStats.total - examStats.solved}</span>
            </div>
          </div>
          <div className="timer-display">
            <span className="timer-label">Time Remaining</span>
            <span className="timer-value">{timer.text}</span>
          </div>
          <button onClick={() => setShowFinishConfirm(true)} className="btn-finish-exam">Finish Exam</button>
        </header>
      ) : (
        <header className="top-navbar">
          <div className="top-navbar-container">
            <div className="top-navbar-left">
              <div className="brand">
                <span className="brand-title">CodeArena</span>
              </div>
              <nav className="top-nav-links">
                <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>Dashboard</NavLink>
                <NavLink to="/contests" className={({ isActive }) => isActive ? "active" : ""}>Contests</NavLink>
                <NavLink to="/problems" className={({ isActive }) => isActive ? "active" : ""}>Problems</NavLink>
                <NavLink to="/tracks" className={({ isActive }) => isActive ? "active" : ""}>Tracks</NavLink>
                <NavLink to="/leaderboard" className={({ isActive }) => isActive ? "active" : ""}>Leaderboard</NavLink>
                {isAuthenticated && user?.role === "ADMIN" && (
                  <NavLink to="/admin" className={({ isActive }) => isActive ? "active" : ""}>Admin</NavLink>
                )}
              </nav>
            </div>
            <div className="top-navbar-right">

              <button 
                 className={`premium-theme-toggle ${theme}`} 
                 onClick={toggleTheme} 
                 aria-label="Toggle theme" 
                 title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
               >
                 <div className="toggle-track">
                   <div className="toggle-icon-sun">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                       <circle cx="12" cy="12" r="5" />
                       <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                     </svg>
                   </div>
                   <div className="toggle-icon-moon">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                       <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                     </svg>
                   </div>
                   <div className="toggle-thumb">
                     {theme === 'light' ? (
                       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="thumb-sun-icon">
                         <circle cx="12" cy="12" r="5" />
                         <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                       </svg>
                     ) : (
                       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="thumb-moon-icon">
                         <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                       </svg>
                     )}
                   </div>
                 </div>
               </button>
              {isAuthenticated && <NotificationBell />}
              {isAuthenticated ? (
                <div className="user-menu-group">
                  <NavLink to="/profile" className="user-badge">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt="Profile" className="user-avatar-img" />
                    ) : (
                      <span className="user-avatar">{(user?.display_name || user?.username)?.charAt(0).toUpperCase()}</span>
                    )}
                    <span className="user-name-display">{user?.display_name || user?.username}</span>
                  </NavLink>
                  <button onClick={handleLogout} className="btn-logout">Logout</button>
                </div>
              ) : (
                <div className="auth-buttons">
                  <NavLink to="/login" className="btn-secondary btn-sm">Login</NavLink>
                  <NavLink to="/register" className="btn-primary btn-sm">Sign Up</NavLink>
                </div>
              )}
              <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">{mobileMenuOpen ? "✕" : "☰"}</button>
            </div>
          </div>
        </header>
      )}

      <main className="main-content">
        <div className="content-container">{children}</div>
      </main>

      {mobileMenuOpen && !isLocked && (
        <div className="mobile-dropdown-nav">
          <nav>
            <NavLink to="/" end onClick={() => setMobileMenuOpen(false)}>Dashboard</NavLink>
            <NavLink to="/contests" onClick={() => setMobileMenuOpen(false)}>Contests</NavLink>
            <NavLink to="/problems" onClick={() => setMobileMenuOpen(false)}>Problems</NavLink>
            <NavLink to="/tracks" onClick={() => setMobileMenuOpen(false)}>Tracks</NavLink>
            <NavLink to="/leaderboard" onClick={() => setMobileMenuOpen(false)}>Leaderboard</NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/submit" onClick={() => setMobileMenuOpen(false)}>Submit</NavLink>
                <NavLink to="/submissions" onClick={() => setMobileMenuOpen(false)}>My Submissions</NavLink>
                <NavLink to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</NavLink>
              </>
            )}
            {isAuthenticated && user?.role === "ADMIN" && (
              <NavLink to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin Panel</NavLink>
            )}

            {/* Mobile-only login/signup or logout links */}
            {!isAuthenticated ? (
              <>
                <NavLink to="/login" onClick={() => setMobileMenuOpen(false)} className="mobile-login-link">Login</NavLink>
                <NavLink to="/register" onClick={() => setMobileMenuOpen(false)} className="mobile-signup-link">Sign Up</NavLink>
              </>
            ) : (
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="mobile-logout-link">Logout</button>
            )}
          </nav>
        </div>
      )}
      
      {mobileMenuOpen && <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />}
      <ConfirmDialog open={showFinishConfirm} title="Finish Exam Early" message="Are you sure? You cannot undo this." confirmText="Finish Exam" variant="warning" onConfirm={handleFinishExam} onCancel={() => setShowFinishConfirm(false)} />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, activeContest } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (activeContest) {
    const p = window.location.pathname;
    if (!p.startsWith('/contests') && !p.startsWith('/problems') && !p.startsWith('/submit')) return <Navigate to={`/contests/${activeContest.active_contest_id}`} replace />;
  }
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, activeContest } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "ADMIN") return <Navigate to="/" replace />;
  if (activeContest) {
    const p = window.location.pathname;
    if (!p.startsWith('/contests') && !p.startsWith('/problems') && !p.startsWith('/submit')) return <Navigate to={`/contests/${activeContest.active_contest_id}`} replace />;
  }
  return <>{children}</>;
}

import { AnimatePresence, motion } from "framer-motion";

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{ width: "100%" }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<Layout><PageTransition><Dashboard /></PageTransition></Layout>} />
        <Route path="/contests" element={<Layout><PageTransition><Contests /></PageTransition></Layout>} />
        <Route path="/contests/:id" element={<Layout><PageTransition><ContestDetail /></PageTransition></Layout>} />
        <Route path="/problems" element={<Layout><PageTransition><Problems /></PageTransition></Layout>} />
        <Route path="/problems/:id" element={<Layout><PageTransition><ProblemDetails /></PageTransition></Layout>} />
        <Route path="/tracks" element={<Layout><PageTransition><Tracks /></PageTransition></Layout>} />
        <Route path="/tracks/:id" element={<Layout><PageTransition><TrackDetails /></PageTransition></Layout>} />
        <Route path="/leaderboard" element={<Layout><PageTransition><Leaderboard /></PageTransition></Layout>} />

        <Route path="/submit" element={<ProtectedRoute><Layout><PageTransition><Submit /></PageTransition></Layout></ProtectedRoute>} />
        <Route path="/submissions" element={<ProtectedRoute><Layout><PageTransition><MySubmissions /></PageTransition></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><PageTransition><Profile /></PageTransition></Layout></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><Layout><PageTransition><AdminPanel /></PageTransition></Layout></AdminRoute>} />
        <Route path="*" element={<Layout><PageTransition><NotFound /></PageTransition></Layout>} />
      </Routes>
    </AnimatePresence>
  );
}

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 200px)' }}>
    <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--accent-2)' }} />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <Suspense fallback={<PageLoader />}>
                <AnimatedRoutes />
              </Suspense>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
