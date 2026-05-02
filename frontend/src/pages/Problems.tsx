import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProblems } from "../api/api";

interface Problem {
  problem_id: number;
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  max_score: number;
  tags: string[];
}

export default function Problems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Filters
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState<string>("ALL");
  const [tagFilter, setTagFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchProblems()
      .then(setProblems)
      .catch(() => setProblems([]))
      .finally(() => setLoading(false));
  }, []);

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    problems.forEach((p) => p.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [problems]);

  // Filtered problems
  const filtered = useMemo(() => {
    return problems.filter((p) => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (diffFilter !== "ALL" && p.difficulty !== diffFilter) return false;
      if (tagFilter !== "ALL" && (!p.tags || !p.tags.includes(tagFilter))) return false;
      return true;
    });
  }, [problems, search, diffFilter, tagFilter]);

  const diffBadge = (d: string) => d === "EASY" ? "badge-easy" : d === "MEDIUM" ? "badge-medium" : "badge-hard";

  if (loading) return <div className="skeleton-block" />;

  return (
    <div>
      <div className="page-header-row">
        <h2>📝 Problems</h2>
        <span className="page-count">{filtered.length} of {problems.length} problems</span>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-search">
          <input
            type="text"
            placeholder="🔍 Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <select value={diffFilter} onChange={(e) => setDiffFilter(e.target.value)} className="filter-select">
            <option value="ALL">All Difficulty</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
          {allTags.length > 0 && (
            <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="filter-select">
              <option value="ALL">All Tags</option>
              {allTags.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Tags</th>
              <th>Difficulty</th>
              <th>Max Score</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>No problems match your filters.</td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.problem_id}>
                  <td>{p.problem_id}</td>
                  <td className="table-title-cell">{p.title}</td>
                  <td>
                    <div className="tag-list">
                      {p.tags?.map((t) => (
                        <span key={t} className="tag-badge" onClick={() => setTagFilter(t)}>{t}</span>
                      ))}
                    </div>
                  </td>
                  <td><span className={`diff-badge ${diffBadge(p.difficulty)}`}>{p.difficulty}</span></td>
                  <td>{p.max_score}</td>
                  <td>
                    <button
                      onClick={() => navigate(`/problems/${p.problem_id}`)}
                      className="btn-small btn-outline"
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
