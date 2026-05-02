import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { fetchSubmissions, fetchSubmissionById } from "../api/api";
import { useAuth, useTheme } from "../App";

interface Submission {
  submission_id: number;
  problem_title: string;
  contest_title: string;
  score: number;
  language: string;
  submission_time: string;
  contest_id: number;
  problem_id: number;
  code?: string;
}

export default function MySubmissions() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Code view modal
  const [viewingCode, setViewingCode] = useState<Submission | null>(null);
  const [loadingCode, setLoadingCode] = useState(false);

  const loadSubmissions = (p: number) => {
    if (!user) return;
    setLoading(true);
    fetchSubmissions({ user_id: user.user_id, page: p, limit: 15 })
      .then((res) => {
        setSubmissions(res.data || []);
        setTotalPages(res.totalPages || 1);
        setTotal(res.total || 0);
        setPage(res.page || 1);
      })
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadSubmissions(1); }, [user]);

  const handleViewCode = async (s: Submission) => {
    setLoadingCode(true);
    setViewingCode(s);
    try {
      const full = await fetchSubmissionById(s.submission_id);
      setViewingCode(full);
    } catch {
      setViewingCode({ ...s, code: "// Failed to load code" });
    }
    setLoadingCode(false);
  };

  const formatTime = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    });

  if (loading && submissions.length === 0) return <div className="skeleton-block" />;

  return (
    <div>
      <div className="page-header-row">
        <h2>📋 My Submissions</h2>
        <span className="page-count">{total} total submissions</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Problem</th>
              <th>Contest</th>
              <th>Language</th>
              <th>Score</th>
              <th>Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  No submissions yet.{" "}
                  <Link to="/contests" style={{ color: "var(--accent)" }}>Join a contest</Link> to get started!
                </td>
              </tr>
            ) : (
              submissions.map((s) => (
                <tr key={s.submission_id}>
                  <td>{s.submission_id}</td>
                  <td>
                    <Link to={`/problems/${s.problem_id}`} className="table-link">
                      {s.problem_title}
                    </Link>
                  </td>
                  <td>
                    <Link to={`/contests/${s.contest_id}`} className="table-link">
                      {s.contest_title}
                    </Link>
                  </td>
                  <td><span className="lang-badge">{s.language}</span></td>
                  <td className={s.score > 0 ? "green" : "red"}>{s.score}</td>
                  <td>{formatTime(s.submission_time)}</td>
                  <td>
                    <button className="btn-small btn-outline" onClick={() => handleViewCode(s)}>
                      👁️ View Code
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={page <= 1}
            onClick={() => loadSubmissions(page - 1)}
          >
            ← Previous
          </button>
          <div className="pagination-pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .map((p, idx, arr) => (
                <span key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span className="pagination-ellipsis">…</span>}
                  <button
                    className={`pagination-page ${p === page ? "active" : ""}`}
                    onClick={() => loadSubmissions(p)}
                  >
                    {p}
                  </button>
                </span>
              ))}
          </div>
          <button
            className="pagination-btn"
            disabled={page >= totalPages}
            onClick={() => loadSubmissions(page + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {/* Code View Modal */}
      {viewingCode && (
        <div className="admin-form-overlay" onClick={() => setViewingCode(null)}>
          <div className="admin-form-card admin-form-wide" onClick={(e) => e.stopPropagation()}>
            <div className="admin-form-header">
              <h3>
                👁️ Submission #{viewingCode.submission_id} — {viewingCode.problem_title}
              </h3>
              <button className="admin-form-close" onClick={() => setViewingCode(null)}>×</button>
            </div>
            <div className="code-view-meta">
              <span className="lang-badge">{viewingCode.language}</span>
              <span className={`submission-score ${viewingCode.score > 0 ? "green" : "red"}`}>
                Score: {viewingCode.score}
              </span>
              <span className="code-view-time">{formatTime(viewingCode.submission_time)}</span>
            </div>
            {loadingCode ? (
              <div className="skeleton-block" style={{ height: 300 }} />
            ) : (
              <div className="monaco-editor-wrap">
                <Editor
                  height="400px"
                  language={viewingCode.language === "cpp" ? "cpp" : viewingCode.language}
                  value={viewingCode.code || "// No code available"}
                  theme={theme === "dark" ? "vs-dark" : "light"}
                  options={{
                    readOnly: true,
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    padding: { top: 12 },
                    lineNumbers: "on",
                    automaticLayout: true,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
