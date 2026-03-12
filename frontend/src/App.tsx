import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import { fetchDashboardStats, fetchContests, fetchProblems, fetchLeaderboard, joinContest, fetchParticipations } from "./api/api";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProblemDetails from "./pages/ProblemDetails";
import Submit from "./pages/Submit";

import "./index.css";

// Auth Context
interface User {
  user_id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (user: User, token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

interface DashboardStats {
  totalContests: number;
  totalProblems: number;
  totalSubmissions: number;
  totalUsers: number;
}

interface Contest {
  contest_id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  status: "UPCOMING" | "ONGOING" | "ENDED";
}

interface Problem {
  problem_id: number;
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  max_score: number;
}

interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  total_score: number;
  submissions: number;
}

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!stats) return <p>Failed to load dashboard data. Is the backend running?</p>;

  return (
    <div className="cards">
      <div className="card">
        <h3>Total Contests</h3>
        <p>{stats.totalContests}</p>
      </div>
      <div className="card">
        <h3>Total Problems</h3>
        <p>{stats.totalProblems}</p>
      </div>
      <div className="card">
        <h3>Total Submissions</h3>
        <p>{stats.totalSubmissions}</p>
      </div>
      <div className="card">
        <h3>Total Users</h3>
        <p>{stats.totalUsers}</p>
      </div>
    </div>
  );
}

function Contests() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [participations, setParticipations] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<number | null>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    Promise.all([fetchContests(), isAuthenticated ? fetchParticipations({ user_id: user?.user_id }) : Promise.resolve([])])
      .then(([contestsData, participationsData]) => {
        setContests(contestsData);
        setParticipations(participationsData.map((p: any) => p.contest_id));
      })
      .catch(() => setContests([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated, user?.user_id]);

  const handleJoin = async (contestId: number) => {
    if (!isAuthenticated) {
      alert("Please login to join contests");
      return;
    }
    setJoining(contestId);
    try {
      await joinContest(contestId);
      setParticipations([...participations, contestId]);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setJoining(null);
    }
  };

  const statusClass = (s: string) => {
    if (s === "ONGOING") return "blue";
    if (s === "ENDED") return "green";
    return "";
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (loading) return <p>Loading contests...</p>;

  return (
    <div>
      <h2>Contests</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {contests.length === 0 ? (
              <tr>
                <td colSpan={5}>No contests found.</td>
              </tr>
            ) : (
              contests.map((c) => (
                <tr key={c.contest_id}>
                  <td>{c.title}</td>
                  <td className={statusClass(c.status)}>{c.status}</td>
                  <td>{formatDate(c.start_time)}</td>
                  <td>{formatDate(c.end_time)}</td>
                  <td>
                    {participations.includes(c.contest_id) ? (
                      <span className="green">Joined</span>
                    ) : c.status !== "ENDED" ? (
                      <button
                        onClick={() => handleJoin(c.contest_id)}
                        disabled={joining === c.contest_id}
                        className="btn-small"
                      >
                        {joining === c.contest_id ? "Joining..." : "Join"}
                      </button>
                    ) : (
                      <span className="gray">Ended</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Problems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProblems()
      .then(setProblems)
      .catch(() => setProblems([]))
      .finally(() => setLoading(false));
  }, []);

  const difficultyClass = (d: string) => {
    if (d === "EASY") return "green";
    if (d === "MEDIUM") return "blue";
    return "red";
  };

  if (loading) return <p>Loading problems...</p>;

  return (
    <div>
      <h2>Problems</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Difficulty</th>
              <th>Max Score</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {problems.length === 0 ? (
              <tr>
                <td colSpan={5}>No problems found.</td>
              </tr>
            ) : (
              problems.map((p) => (
                <tr key={p.problem_id}>
                  <td>{p.problem_id}</td>
                  <td>{p.title}</td>
                  <td className={difficultyClass(p.difficulty)}>{p.difficulty}</td>
                  <td>{p.max_score}</td>
                  <td>
                    <button
                      onClick={() => navigate(`/problems/${p.problem_id}`)}
                      className="btn-small"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard()
      .then(setLeaderboard)
      .catch(() => setLeaderboard([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading leaderboard...</p>;

  return (
    <div>
      <h2>Leaderboard</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>Score</th>
              <th>Submissions</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan={4}>No submissions yet.</td>
              </tr>
            ) : (
              leaderboard.map((entry) => (
                <tr key={entry.user_id}>
                  <td>{entry.rank}</td>
                  <td>{entry.username}</td>
                  <td className="green">{entry.total_score}</td>
                  <td>{entry.submissions}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark" />
          <div className="brand-text">
            <span className="brand-title">CodeArena</span>
            <span className="brand-subtitle">Coding Contest</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/contests"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Contests
          </NavLink>
          <NavLink
            to="/problems"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Problems
          </NavLink>
          <NavLink
            to="/leaderboard"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Leaderboard
          </NavLink>
          {isAuthenticated && (
            <NavLink
              to="/submit"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Submit
            </NavLink>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="status-dot" />
          <span>System Healthy</span>
        </div>
      </aside>
      <div className="main">
        <header className="navbar">
          <h2>CodeArena</h2>
          <div className="profile">
            {isAuthenticated ? (
              <>
                <span>{user?.username}</span>
                <button onClick={handleLogout} className="btn-logout">Logout</button>
              </>
            ) : (
              <NavLink to="/login" className="btn-login">Login</NavLink>
            )}
          </div>
        </header>

        <div className="content">{children}</div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected layout routes */}
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/contests" element={<Layout><Contests /></Layout>} />
          <Route path="/problems" element={<Layout><Problems /></Layout>} />
          <Route path="/problems/:id" element={<Layout><ProblemDetails /></Layout>} />
          <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />
          
          {/* Protected routes (require login) */}
          <Route path="/submit" element={
            <ProtectedRoute>
              <Layout><Submit /></Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
