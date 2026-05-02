import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { fetchContests, joinContest, fetchParticipations } from "../api/api";
import { useAuth } from "../App";
import { useToast } from "../components/Toast";

interface Contest { contest_id: number; title: string; description: string; start_time: string; end_time: string; status: "UPCOMING" | "ONGOING" | "ENDED"; participant_count?: number; }

function TimeLeft({ endTime, startTime, status }: { endTime: string; startTime: string; status: string }) {
  const [text, setText] = useState("");
  useEffect(() => {
    const targetTime = status === "UPCOMING" ? startTime : endTime;
    const update = () => {
      const diff = new Date(targetTime).getTime() - Date.now();
      if (diff <= 0) { setText(status === "UPCOMING" ? "Starting..." : "Ended"); return; }
      const h = Math.floor(diff / 3600000); const m = Math.floor((diff % 3600000) / 60000);
      if (h > 24) setText(`${Math.floor(h / 24)}d ${h % 24}h`); else setText(`${h}h ${m}m`);
    };
    update(); const id = setInterval(update, 60000); return () => clearInterval(id);
  }, [endTime, startTime, status]);
  if (!text) return null;
  return <span className="countdown-inline">{text}</span>;
}

export default function Contests() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [participations, setParticipations] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<number | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  // Filters
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

  const statusBadge = (s: string) => s === "ONGOING" ? "badge-ongoing" : s === "UPCOMING" ? "badge-upcoming" : "badge-ended";
  if (loading) return <div className="skeleton-block" />;

  const statusTabs = ["ALL", "ONGOING", "UPCOMING", "ENDED"];

  return (
    <div>
      <div className="page-header-row">
        <h2>🏆 Contests</h2>
        <span className="page-count">{filtered.length} contests</span>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-search">
          <input
            type="text"
            placeholder="🔍 Search contests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-input"
          />
        </div>
        <div className="filter-tabs">
          {statusTabs.map((s) => (
            <button
              key={s}
              className={`filter-tab ${statusFilter === s ? "active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Status</th><th>Participants</th><th>Time</th><th>Start</th><th>End</th><th>Action</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={7}>No contests match your filters.</td></tr> :
              filtered.map((c) => (
                <tr key={c.contest_id}>
                  <td><Link to={`/contests/${c.contest_id}`} className="table-link">{c.title}</Link></td>
                  <td><span className={`status-badge ${statusBadge(c.status)}`}>{c.status}</span></td>
                  <td><span className="participant-count">👥 {c.participant_count || 0}</span></td>
                  <td>{c.status !== "ENDED" ? <TimeLeft endTime={c.end_time} startTime={c.start_time} status={c.status} /> : <span className="muted-text">—</span>}</td>
                  <td>{new Date(c.start_time).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td>{new Date(c.end_time).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td>
                    {participations.includes(c.contest_id) ? <Link to={`/contests/${c.contest_id}`} className="btn-small btn-accent">Enter →</Link>
                    : c.status !== "ENDED" ? <button onClick={() => handleJoin(c.contest_id)} disabled={joining === c.contest_id} className="btn-small">{joining === c.contest_id ? "Joining..." : "Join"}</button>
                    : <span className="muted-text">Ended</span>}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
