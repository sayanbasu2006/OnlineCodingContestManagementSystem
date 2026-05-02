import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { fetchLeaderboard, fetchContests } from "../api/api";
import { useAuth } from "../App";

interface LeaderboardEntry { rank: number; user_id: number; username: string; total_score: number; submissions: number; rating?: number; }
interface Contest { contest_id: number; title: string; status: string; }

const rankEmoji = (rank: number) => { if (rank === 1) return "🥇"; if (rank === 2) return "🥈"; if (rank === 3) return "🥉"; return `#${rank}`; };

const getRatingBadge = (rating?: number) => {
  if (!rating) return null;
  if (rating >= 2000) return <span className="diff-badge badge-hard">Grandmaster</span>;
  if (rating >= 1800) return <span className="diff-badge badge-hard">Master</span>;
  if (rating >= 1600) return <span className="diff-badge badge-medium">Expert</span>;
  if (rating >= 1400) return <span className="diff-badge badge-easy">Specialist</span>;
  return <span className="diff-badge" style={{background: 'var(--bg-card)', color: 'var(--text)'}}>Novice</span>;
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

  // Filter by search
  const filtered = useMemo(() => {
    if (!search) return leaderboard;
    return leaderboard.filter((e) => e.username.toLowerCase().includes(search.toLowerCase()));
  }, [leaderboard, search]);

  // Paginate
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  if (loading) return <div className="skeleton-block" />;

  return (
    <div>
      <div className="leaderboard-header">
        <h2>🏆 {selectedContest ? "Contest" : "Global"} Leaderboard</h2>
        <div className="leaderboard-filter">
          <select value={selectedContest || ""} onChange={(e) => setSelectedContest(e.target.value ? parseInt(e.target.value) : undefined)}>
            <option value="">🌍 Global (All Contests)</option>
            {contests.map((c) => <option key={c.contest_id} value={c.contest_id}>{c.title} ({c.status})</option>)}
          </select>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-search">
          <input
            type="text"
            placeholder="🔍 Search username..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="filter-input"
          />
        </div>
        <span className="page-count">{filtered.length} participants</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Rank</th><th>User</th>{!selectedContest && <th>Rating</th>}<th>Score</th><th>Submissions</th></tr></thead>
          <tbody>
            {paginated.length === 0 ? <tr><td colSpan={selectedContest ? 4 : 5}>No results found.</td></tr> :
              paginated.map((entry, idx) => (
                <motion.tr 
                  key={entry.user_id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  className={`${entry.rank <= 3 ? "top-rank" : ""} ${entry.user_id === user?.user_id ? "current-user-row" : ""}`}
                >
                  <td><span className={`rank-cell ${entry.rank <= 3 ? `rank-${entry.rank}` : ""}`}>{rankEmoji(entry.rank)}</span></td>
                  <td>
                    <span className="leaderboard-user">{entry.username}{entry.user_id === user?.user_id && <span className="you-badge">You</span>}</span>
                  </td>
                  {!selectedContest && <td><span style={{fontWeight: 600, marginRight: '8px'}}>{entry.rating}</span> {getRatingBadge(entry.rating)}</td>}
                  <td className="green">{entry.total_score}</td>
                  <td>{entry.submissions}</td>
                </motion.tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            ← Previous
          </button>
          <div className="pagination-pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .map((p, idx, arr) => (
                <span key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span className="pagination-ellipsis">…</span>}
                  <button className={`pagination-page ${p === page ? "active" : ""}`} onClick={() => setPage(p)}>
                    {p}
                  </button>
                </span>
              ))}
          </div>
          <button className="pagination-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
