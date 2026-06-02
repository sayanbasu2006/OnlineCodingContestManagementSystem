import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { fetchDashboardStats, fetchContests, fetchLeaderboard } from "../api/api";
import { useAuth } from "../App";
import TimeLeft from "../components/TimeLeft";

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
  status: string;
  end_time: string;
  start_time: string;
  duration_minutes: number;
  participant_count?: number;
}



interface LeaderboardEntry {
  user_id: number;
  username: string;
  total_score: number;
}



export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [contests, setContests] = useState<Contest[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const promises: Promise<any>[] = [
      fetchDashboardStats(),
      fetchContests(),
      fetchLeaderboard().catch(() => [])
    ];

    Promise.all(promises)
      .then(([statsData, contestsData, lbData]) => {
        setStats(statsData);
        setContests(contestsData);
        setLeaderboard(Array.isArray(lbData) ? lbData.slice(0, 5) : []);
      })
      .catch((err) => console.error("Failed to load dashboard statistics/contests:", err))
      .finally(() => setLoading(false));
  }, [isAuthenticated, user]);

  if (loading) return <div className="skeleton-block" style={{height: "400px"}} />;

  const ongoingContests = contests.filter((c) => c.status === "ONGOING");
  const upcomingContests = contests.filter((c) => c.status === "UPCOMING");
  
  const featuredContest = ongoingContests[0] || upcomingContests[0];
  const secondaryContest = ongoingContests[1] || upcomingContests[1] || (featuredContest === upcomingContests[0] ? ongoingContests[0] : upcomingContests[0]);

  return (
    <div className="dashboard-layout">
      {/* Hero / Featured Contest Area */}
      <div className="dashboard-hero-grid">
        {featuredContest ? (
          <motion.div className="featured-contest-card premium-featured-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="featured-content">
              <span className="featured-badge neon-teal-badge">{featuredContest.status === 'ONGOING' ? 'LIVE NOW' : 'UPCOMING'}</span>
              <h1 className="featured-title">{featuredContest.title}</h1>
              <p className="featured-desc">{featuredContest.description || "Compete against thousands of developers globally."}</p>
              
              <div className="featured-meta">
                <div className="meta-item">
                  <span className="meta-label">Participants</span>
                  <span className="meta-value">👥 {featuredContest.participant_count || 0}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Duration</span>
                  <span className="meta-value">⏱️ {Math.floor(featuredContest.duration_minutes / 60)}h {featuredContest.duration_minutes % 60}m</span>
                </div>
                <div className="meta-item timer-item">
                  <span className="meta-label">{featuredContest.status === 'ONGOING' ? 'Ends in' : 'Starts in'}</span>
                  <span className="meta-value highlight-timer">
                    🕒 <TimeLeft targetTime={featuredContest.status === 'ONGOING' ? featuredContest.end_time : featuredContest.start_time} showSeconds={true} />
                  </span>
                </div>
              </div>

              <button className="btn-primary featured-btn glow-button" onClick={() => navigate(`/contests/${featuredContest.contest_id}`)}>
                {featuredContest.status === 'ONGOING' ? 'Enter Arena' : 'View Details'}
              </button>
            </div>
            <div className="featured-graphic">
               <div className="graphic-circle"></div>
               <span className="graphic-icon">🚀</span>
            </div>
          </motion.div>
        ) : (
          <motion.div className="welcome-banner" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="hero-title">Compete. Code. Conquer.</h1>
            <p className="hero-subtitle">Join thousands of developers in exciting coding contests. Solve problems, improve your skills, and climb the leaderboard.</p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => navigate('/contests')}>Explore Contests →</button>
              <button className="btn-secondary" onClick={() => navigate('/problems')}>Practice Problems &lt;/&gt;</button>
            </div>
          </motion.div>
        )}

        <div className="dashboard-side-grid">
          {secondaryContest && (
            <motion.div className="side-card current-challenges-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div className="side-card-header">
                <h3 className="side-card-title">CURRENT CHALLENGES</h3>
              </div>
              <div className="challenge-title-row">
                <h4 className="secondary-title">{secondaryContest.title}</h4>
                <span className="challenge-timer-badge">
                  <TimeLeft targetTime={secondaryContest.status === 'ONGOING' ? secondaryContest.end_time : secondaryContest.start_time} showSeconds={true} />
                </span>
              </div>
              <p className="challenge-desc">
                {secondaryContest.description || "A fast-paced contest to test your analytical speed and skill accuracy."}
              </p>
              <button className="btn-challenge-view" onClick={() => navigate(`/contests/${secondaryContest.contest_id}`)}>View</button>
            </motion.div>
          )}

          <motion.div className="side-card global-leaderboard-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="side-card-header">
              <h3 className="side-card-title">GLOBAL LEADERBOARD</h3>
              <Link to="/leaderboard" className="view-all-link">View All</Link>
            </div>
            <div className="performer-list">
              {leaderboard.map((user, idx) => (
                <div key={user.user_id} className="performer-row">
                  <span className={`rank-badge rank-${idx + 1}`}>{idx + 1}</span>
                  <div className="performer-info">
                    <span className="performer-avatar">{user.username.charAt(0).toUpperCase()}</span>
                    <span className="performer-name">{user.username}</span>
                  </div>
                  <span className="performer-score">{user.total_score}</span>
                </div>
              ))}
              {leaderboard.length === 0 && <span className="muted-text">No data yet.</span>}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Platform Stats */}
      {stats && (
        <div className="platform-stats-section">
          <div className="stat-box">
            <div className="stat-icon-wrapper blue"><span className="icon">👥</span></div>
            <div className="stat-text">
              <span className="stat-val">{stats.totalUsers}</span>
              <span className="stat-lbl">Developers</span>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon-wrapper purple"><span className="icon">🏆</span></div>
            <div className="stat-text">
              <span className="stat-val">{stats.totalContests}</span>
              <span className="stat-lbl">Contests</span>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon-wrapper green"><span className="icon">&lt;&gt;</span></div>
            <div className="stat-text">
              <span className="stat-val">{stats.totalProblems}</span>
              <span className="stat-lbl">Problems</span>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon-wrapper orange"><span className="icon">🚀</span></div>
            <div className="stat-text">
              <span className="stat-val">{stats.totalSubmissions}</span>
              <span className="stat-lbl">Submissions</span>
            </div>
          </div>
        </div>
      )}

      {/* List all contests table */}
      <div className="contests-table-section">
        <h2 className="section-heading">All Contests</h2>
        <div className="premium-table-wrapper">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Contest Name</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Participants</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {contests.slice(0, 5).map(c => (
                <tr key={c.contest_id}>
                  <td className="font-semibold">{c.title}</td>
                  <td>
                    <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span>
                  </td>
                  <td className="muted-text">{Math.floor(c.duration_minutes / 60)}h {c.duration_minutes % 60}m</td>
                  <td className="muted-text">{c.participant_count || 0}</td>
                  <td>
                    <Link to={`/contests/${c.contest_id}`} className="action-link">View Details</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
