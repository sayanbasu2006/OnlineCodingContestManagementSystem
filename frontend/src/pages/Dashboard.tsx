import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { fetchDashboardStats, fetchContests, fetchSubmissions, fetchLeaderboard } from "../api/api";
import { useAuth } from "../App";

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

interface Submission {
  submission_id: number;
  problem_title: string;
  contest_title: string;
  score: number;
  language: string;
  submission_time: string;
}

interface LeaderboardEntry {
  user_id: number;
  username: string;
  score: number;
}

function TimeLeft({ targetTime, prefix = "" }: { targetTime: string; prefix?: string }) {
  const [text, setText] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(targetTime).getTime() - Date.now();
      if (diff <= 0) { setText("Ended"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (h > 24) {
        setText(`${prefix}${Math.floor(h / 24)}d ${h % 24}h left`);
      } else {
        setText(`${prefix}${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`);
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetTime, prefix]);

  return <span>{text}</span>;
}

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [contests, setContests] = useState<Contest[]>([]);
  const [, setSubmissions] = useState<Submission[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const promises: Promise<any>[] = [
      fetchDashboardStats(),
      fetchContests(),
      fetchLeaderboard().catch(() => [])
    ];

    if (isAuthenticated && user) {
      promises.push(fetchSubmissions({ user_id: user.user_id }));
    }

    Promise.all(promises)
      .then(([statsData, contestsData, lbData, subsData]) => {
        setStats(statsData);
        setContests(contestsData);
        setLeaderboard(Array.isArray(lbData) ? lbData.slice(0, 5) : []);
        if (subsData) setSubmissions((subsData.data || subsData).slice(0, 5));
      })
      .catch(() => {})
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
          <motion.div className="featured-contest-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="featured-content">
              <span className="featured-badge">{featuredContest.status === 'ONGOING' ? 'LIVE NOW' : 'UPCOMING'}</span>
              <h1 className="featured-title">{featuredContest.title}</h1>
              <p className="featured-desc">{featuredContest.description || "Compete against thousands of developers globally."}</p>
              
              <div className="featured-meta">
                <div className="meta-item">
                  <span className="meta-label">Participants</span>
                  <span className="meta-value">{featuredContest.participant_count || 0}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Duration</span>
                  <span className="meta-value">{Math.floor(featuredContest.duration_minutes / 60)}h {featuredContest.duration_minutes % 60}m</span>
                </div>
                <div className="meta-item timer-item">
                  <span className="meta-label">{featuredContest.status === 'ONGOING' ? 'Ends In' : 'Starts In'}</span>
                  <span className="meta-value highlight-timer">
                    <TimeLeft targetTime={featuredContest.status === 'ONGOING' ? featuredContest.end_time : featuredContest.start_time} />
                  </span>
                </div>
              </div>

              <button className="btn-primary featured-btn" onClick={() => navigate(`/contests/${featuredContest.contest_id}`)}>
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
            <motion.div className="side-card secondary-contest" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <h3 className="side-card-title">Also {secondaryContest.status === 'ONGOING' ? 'Active' : 'Upcoming'}</h3>
              <h4 className="secondary-title">{secondaryContest.title}</h4>
              <div className="secondary-meta">
                <span><TimeLeft targetTime={secondaryContest.status === 'ONGOING' ? secondaryContest.end_time : secondaryContest.start_time} prefix={secondaryContest.status === 'ONGOING' ? 'Ends in ' : 'Starts in '} /></span>
                <span>👥 {secondaryContest.participant_count || 0}</span>
              </div>
              <button className="btn-secondary btn-sm full-width" onClick={() => navigate(`/contests/${secondaryContest.contest_id}`)}>View</button>
            </motion.div>
          )}

          <motion.div className="side-card top-performers" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="side-card-header">
              <h3 className="side-card-title">Top Performers</h3>
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
                  <span className="performer-score">{user.score}</span>
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
              <span className="stat-val">{stats.totalUsers * 100}+</span>
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
              <span className="stat-val">{stats.totalProblems * 10}+</span>
              <span className="stat-lbl">Problems</span>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon-wrapper orange"><span className="icon">🚀</span></div>
            <div className="stat-text">
              <span className="stat-val">{stats.totalSubmissions * 50}+</span>
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
