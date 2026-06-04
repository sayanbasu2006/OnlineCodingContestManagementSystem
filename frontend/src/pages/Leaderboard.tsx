import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { fetchLeaderboard, fetchContests } from "../api/api";
import { useAuth } from "../App";

interface LeaderboardEntry { rank: number; user_id: number; username: string; total_score: number; submissions: number; rating?: number; avatar_url?: string; }
interface Contest { contest_id: number; title: string; status: string; }

const getRatingBadge = (rating?: number) => {
  if (!rating) return null;
  if (rating >= 2000) return <span className="badge" style={{background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444'}}>Grandmaster</span>;
  if (rating >= 1800) return <span className="badge" style={{background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444'}}>Master</span>;
  if (rating >= 1600) return <span className="badge" style={{background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6'}}>Expert</span>;
  if (rating >= 1400) return <span className="badge" style={{background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E'}}>Specialist</span>;
  return <span className="badge badge-ended">Novice</span>;
};

const PAGE_SIZE = 25;

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContest, setSelectedContest] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => { fetchContests().then(setContests).catch(() => {}); }, []);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setSearch("");
    fetchLeaderboard(selectedContest).then(setLeaderboard).catch(() => setLeaderboard([])).finally(() => setLoading(false));
  }, [selectedContest]);

  const filtered = useMemo(() => {
    if (!search) return leaderboard;
    return leaderboard.filter((e) => e.username.toLowerCase().includes(search.toLowerCase()));
  }, [leaderboard, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  if (loading) return <div className="skeleton-block" style={{height: "600px"}} />;

  const top3 = filtered.slice(0, 3);
  const rest = paginated;

  return (
    <div className="leaderboard-layout">
      <div className="leaderboard-header-section">
        <div className="header-text">
          <h1 className="hero-title">{selectedContest ? "Contest Rankings" : "Global Leaderboard"}</h1>
          <p className="hero-subtitle">See where you stand among the best developers in the arena.</p>
        </div>
        <div className="leaderboard-controls">
          <select className="styled-select" value={selectedContest || ""} onChange={(e) => setSelectedContest(e.target.value ? parseInt(e.target.value) : undefined)}>
            <option value="">🌍 Global Rankings</option>
            {contests.map((c) => <option key={c.contest_id} value={c.contest_id}>{c.title}</option>)}
          </select>
          <div className="search-bar-mock">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search by username..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>
      </div>

      {page === 1 && top3.length > 0 && (
        <div className="podium-section">
          {top3[1] && (
            <motion.div className="podium-card silver" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="podium-rank">2</div>
              {top3[1].avatar_url ? (
                <img src={top3[1].avatar_url} alt={top3[1].username} className="podium-avatar" style={{ objectFit: 'cover' }} />
              ) : (
                <div className="podium-avatar">{top3[1].username.charAt(0).toUpperCase()}</div>
              )}
              <h3 className="podium-name">{top3[1].username}</h3>
              <span className="podium-score">{top3[1].total_score} pts</span>
            </motion.div>
          )}
          {top3[0] && (
            <motion.div className="podium-card gold" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}>
              <div className="podium-rank">1</div>
              {top3[0].avatar_url ? (
                <img src={top3[0].avatar_url} alt={top3[0].username} className="podium-avatar" style={{ objectFit: 'cover' }} />
              ) : (
                <div className="podium-avatar">{top3[0].username.charAt(0).toUpperCase()}</div>
              )}
              <h3 className="podium-name">{top3[0].username}</h3>
              <span className="podium-score">{top3[0].total_score} pts</span>
            </motion.div>
          )}
          {top3[2] && (
            <motion.div className="podium-card bronze" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="podium-rank">3</div>
              {top3[2].avatar_url ? (
                <img src={top3[2].avatar_url} alt={top3[2].username} className="podium-avatar" style={{ objectFit: 'cover' }} />
              ) : (
                <div className="podium-avatar">{top3[2].username.charAt(0).toUpperCase()}</div>
              )}
              <h3 className="podium-name">{top3[2].username}</h3>
              <span className="podium-score">{top3[2].total_score} pts</span>
            </motion.div>
          )}
        </div>
      )}

      <div className="premium-table-wrapper leaderboard-table">
        <table className="premium-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              {!selectedContest && <th>Rating</th>}
              <th>Score</th>
              <th>Submissions</th>
            </tr>
          </thead>
          <tbody>
            {rest.length === 0 ? <tr><td colSpan={selectedContest ? 4 : 5} className="muted-text text-center">No results found.</td></tr> :
              rest.map((entry, idx) => (
                <motion.tr 
                  key={entry.user_id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className={`${entry.user_id === user?.user_id ? "current-user-row" : ""}`}
                >
                  <td className="font-semibold">
                    <div className="rank-indicator">
                      {entry.rank <= 3 ? <span className={`rank-badge rank-${entry.rank}`}>{entry.rank}</span> : <span className="muted-text">#{entry.rank}</span>}
                    </div>
                  </td>
                  <td>
                    <div className="user-info-cell">
                      {entry.avatar_url ? (
                        <img src={entry.avatar_url} alt={entry.username} className="performer-avatar sm" style={{ objectFit: 'cover' }} />
                      ) : (
                        <div className="performer-avatar sm">{entry.username.charAt(0).toUpperCase()}</div>
                      )}
                      <span className="font-semibold">{entry.username}</span>
                      {entry.user_id === user?.user_id && <span className="badge badge-ongoing">You</span>}
                    </div>
                  </td>
                  {!selectedContest && <td><span className="font-semibold">{entry.rating}</span> <span className="ml-2">{getRatingBadge(entry.rating)}</span></td>}
                  <td className="score-cell">{entry.total_score}</td>
                  <td className="muted-text">{entry.submissions}</td>
                </motion.tr>
              ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</button>
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2).map((p, idx, arr) => (
              <span key={p}>
                {idx > 0 && arr[idx - 1] !== p - 1 && <span className="muted-text mx-2">…</span>}
                <button className={`btn-secondary btn-sm ${p === page ? "active-page" : ""}`} onClick={() => setPage(p)}>{p}</button>
              </span>
            ))}
          </div>
          <button className="btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
