import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { fetchContests, joinContest, fetchParticipations } from "../api/api";
import { useAuth } from "../App";
import { useToast } from "../components/Toast";
import { motion } from "framer-motion";
import TimeLeft from "../components/TimeLeft";

interface Contest { contest_id: number; title: string; description: string; start_time: string; end_time: string; status: "UPCOMING" | "ONGOING" | "ENDED"; participant_count?: number; duration_minutes: number; }



export default function Contests() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [participations, setParticipations] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<number | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    Promise.all([fetchContests(), isAuthenticated ? fetchParticipations({ user_id: user?.user_id }) : Promise.resolve([])])
      .then(([c, p]) => { setContests(c); setParticipations(p.map((x: any) => x.contest_id)); })
      .catch(() => setContests([])).finally(() => setLoading(false));
  }, [isAuthenticated, user?.user_id]);

  const handleJoin = async (contestId: number) => {
    if (!isAuthenticated) { showToast("Please login to join", "warning"); return; }
    setJoining(contestId);
    try { await joinContest(contestId); setParticipations([...participations, contestId]); showToast("Joined contest!", "success"); }
    catch (err: any) { showToast(err.message, "error"); }
    finally { setJoining(null); }
  };

  const filtered = useMemo(() => {
    return contests.filter((c) => {
      if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
      return true;
    });
  }, [contests, search, statusFilter]);

  const statusTabs = ["ALL", "ONGOING", "UPCOMING", "ENDED"];

  if (loading) return <div className="skeleton-block" style={{ height: '600px' }} />;

  return (
    <div className="contests-page">
      <div className="page-header">
        <div className="header-text">
          <h1 className="hero-title">Contests Arena</h1>
          <p className="hero-subtitle">Discover and compete in upcoming coding challenges.</p>
        </div>
      </div>

      <div className="filter-controls">
        <div className="search-bar-mock">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search contests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="tab-pills">
          {statusTabs.map((s) => (
            <button
              key={s}
              className={`tab-pill ${statusFilter === s ? "active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="contest-grid">
        {filtered.length === 0 ? (
          <div className="empty-state">No contests match your filters.</div>
        ) : (
          filtered.map((c, idx) => {
            const isJoined = participations.includes(c.contest_id);
            const isOngoing = c.status === "ONGOING";
            const isUpcoming = c.status === "UPCOMING";
            const isEnded = c.status === "ENDED";

            return (
              <motion.div 
                className={`contest-card ${isOngoing ? "ongoing" : ""}`} 
                key={c.contest_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="contest-card-header">
                  <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span>
                  {isJoined && <span className="badge" style={{background: 'var(--surface-3)', color: 'var(--text)'}}>Registered</span>}
                </div>
                
                <h3 className="contest-card-title">{c.title}</h3>
                <p className="contest-card-desc">{c.description || "A competitive programming contest to test your algorithmic skills."}</p>
                
                <div className="contest-meta-grid">
                  <div className="meta-box">
                    <span className="meta-lbl">Duration</span>
                    <span className="meta-val">{Math.floor((c.duration_minutes || 120) / 60)}h {(c.duration_minutes || 120) % 60}m</span>
                  </div>
                  <div className="meta-box">
                    <span className="meta-lbl">Participants</span>
                    <span className="meta-val">{c.participant_count || 0}</span>
                  </div>
                  <div className="meta-box timer-box">
                    <span className="meta-lbl">{isOngoing ? "Ends In" : isUpcoming ? "Starts In" : "Ended On"}</span>
                    <div className="meta-value">
                      {isEnded ? new Date(c.end_time).toLocaleDateString() : <TimeLeft targetTime={isOngoing ? c.end_time : c.start_time} className="highlight-timer" />}
                    </div>
                  </div>
                </div>

                <div className="contest-card-actions">
                  {isJoined ? (
                    <Link to={`/contests/${c.contest_id}`} className="btn-primary full-width text-center" style={{ textDecoration: 'none' }}>
                      {isOngoing ? "Enter Contest" : "View Details"}
                    </Link>
                  ) : isEnded ? (
                    <Link to={`/contests/${c.contest_id}`} className="btn-secondary full-width text-center">
                      View Results
                    </Link>
                  ) : (
                    <button 
                      onClick={() => handleJoin(c.contest_id)} 
                      disabled={joining === c.contest_id} 
                      className="btn-primary full-width"
                    >
                      {joining === c.contest_id ? "Joining..." : "Register Now"}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
