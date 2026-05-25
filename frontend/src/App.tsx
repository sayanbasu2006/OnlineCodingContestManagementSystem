import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useState, createContext, useContext, useEffect } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Contests from "./pages/Contests";
import ContestDetail from "./pages/ContestDetail";
import Problems from "./pages/Problems";
import ProblemDetails from "./pages/ProblemDetails";
import Leaderboard from "./pages/Leaderboard";
import MySubmissions from "./pages/MySubmissions";
import AdminPanel from "./pages/AdminPanel";
import Profile from "./pages/Profile";
import Tracks from "./pages/Tracks";
import TrackDetails from "./pages/TrackDetails";

import { fetchActiveParticipation, finishContest } from "./api/api";
import { ToastProvider, useToast } from "./components/Toast";
import ConfirmDialog from "./components/ConfirmDialog";
import NotificationBell from "./components/NotificationBell";
import "./index.css";

// ─── Theme Context ───
interface ThemeContextType { theme: string; toggleTheme: () => void; }
const ThemeContext = createContext<ThemeContextType>({ theme: "dark", toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

// ─── Auth Context ───
interface User { user_id: number; username: string; email: string; role: string; }
interface ActiveContest { active_contest_id: number; start_time: string; duration_minutes: number; }
interface AuthContextType { user: User | null; activeContest: ActiveContest | null; login: (user: User, token: string) => void; logout: () => void; refreshActiveContest: () => Promise<void>; isAuthenticated: boolean; }

const AuthContext = createContext<AuthContextType | null>(null);
export const useAuth = () => { const c = useContext(AuthContext); if (!c) throw new Error("useAuth must be used within AuthProvider"); return c; };

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => { const s = localStorage.getItem("user"); return s ? JSON.parse(s) : null; });
  const [activeContest, setActiveContest] = useState<ActiveContest | null>(null);

  const refreshActiveContest = async () => {
    if (!user) { setActiveContest(null); return; }
    try { const res = await fetchActiveParticipation(); setActiveContest(res.active_contest_id ? res : null); } catch { setActiveContest(null); }
  };

  useEffect(() => { refreshActiveContest(); }, [user]);

  const login = (u: User, token: string) => { localStorage.setItem("token", token); localStorage.setItem("user", JSON.stringify(u)); setUser(u); };
  const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); setUser(null); setActiveContest(null); };

  return <AuthContext.Provider value={{ user, activeContest, login, logout, refreshActiveContest, isAuthenticated: !!user }}>{children}</AuthContext.Provider>;
}

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

  const handleLogout = () => { logout(); navigate("/login"); };

  const handleFinishExam = async () => {
    if (!activeContest) return;
    try { await finishContest(activeContest.active_contest_id); await refreshActiveContest(); showToast("Exam finished!", "success"); navigate(`/contests/${activeContest.active_contest_id}`); }
    catch { showToast("Failed to finish exam", "error"); }
    setShowFinishConfirm(false);
  };

  useEffect(() => {
    if (timer.expired && activeContest) {
      showToast("⏰ Time is up! Exam auto-finished.", "warning", 6000);
      finishContest(activeContest.active_contest_id).then(() => refreshActiveContest()).then(() => navigate(`/contests/${activeContest.active_contest_id}`));
    }
  }, [timer.expired]);

  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  const isLocked = !!activeContest;

  return (
    <div className="layout">
      {isLocked ? (
        <header className="navbar locked-navbar">
          <div className="locked-warning"><span className="locked-icon">⚠️</span><span>Exam in Progress</span></div>
          <div className="timer-display"><span className="timer-label">Time Remaining</span><span className="timer-value">{timer.text}</span></div>
          <button onClick={() => setShowFinishConfirm(true)} className="btn-finish-exam">Finish Exam</button>
        </header>
      ) : (
        <header className="top-navbar">
          <div className="top-navbar-container">
            <div className="top-navbar-left">
              <div className="brand">
                <div className="brand-mark" />
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

              <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
              {isAuthenticated && <NotificationBell />}
              {isAuthenticated ? (
                <div className="user-menu-group">
                  <NavLink to="/profile" className="user-badge">
                    <span className="user-avatar">{user?.username?.charAt(0).toUpperCase()}</span>
                    <span className="user-name-display">{user?.username}</span>
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
        <Route path="/" element={<Layout><PageTransition><Dashboard /></PageTransition></Layout>} />
        <Route path="/contests" element={<Layout><PageTransition><Contests /></PageTransition></Layout>} />
        <Route path="/contests/:id" element={<Layout><PageTransition><ContestDetail /></PageTransition></Layout>} />
        <Route path="/problems" element={<Layout><PageTransition><Problems /></PageTransition></Layout>} />
        <Route path="/problems/:id" element={<Layout><PageTransition><ProblemDetails /></PageTransition></Layout>} />
        <Route path="/tracks" element={<Layout><PageTransition><Tracks /></PageTransition></Layout>} />
        <Route path="/tracks/:id" element={<Layout><PageTransition><TrackDetails /></PageTransition></Layout>} />
        <Route path="/leaderboard" element={<Layout><PageTransition><Leaderboard /></PageTransition></Layout>} />

        <Route path="/submissions" element={<ProtectedRoute><Layout><PageTransition><MySubmissions /></PageTransition></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><PageTransition><Profile /></PageTransition></Layout></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Layout><PageTransition><AdminPanel /></PageTransition></Layout></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AnimatedRoutes />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
