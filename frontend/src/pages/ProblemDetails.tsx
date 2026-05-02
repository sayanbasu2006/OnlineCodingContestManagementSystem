import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProblemById, fetchTestCases, fetchComments, postComment } from "../api/api";
import { useAuth } from "../App";
import { useToast } from "../components/Toast";
interface Problem {
  problem_id: number;
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  max_score: number;
  tags: string[];
  editorial?: string;
}

interface TestCase {
  test_case_id: number;
  input: string;
  expected_output: string;
  is_sample: boolean;
}

export default function ProblemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<'description' | 'editorial' | 'discussions'>('description');
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    if (!id) return;
    const pid = parseInt(id);

    Promise.all([
      fetchProblemById(pid), 
      fetchTestCases(pid).catch(() => []),
      fetchComments(pid).catch(() => [])
    ])
      .then(([prob, tc, comms]) => { 
        setProblem(prob); 
        setTestCases(tc); 
        setComments(comms);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !problem) return;
    setPostingComment(true);
    try {
      await postComment(problem.problem_id, newComment);
      setNewComment("");
      const updatedComments = await fetchComments(problem.problem_id);
      setComments(updatedComments);
      showToast("Comment posted!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to post comment", "error");
    } finally {
      setPostingComment(false);
    }
  };

  const diffBadge = (d: string) => d === "EASY" ? "badge-easy" : d === "MEDIUM" ? "badge-medium" : "badge-hard";

  if (loading) return <div className="skeleton-block" />;
  if (error) return <p className="red">{error}</p>;
  if (!problem) return <p>Problem not found</p>;

  return (
    <div className="problem-details">
      <div className="problem-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          ← Back
        </button>
        <h1>{problem.title}</h1>
        <div className="problem-meta">
          <span className={`diff-badge ${diffBadge(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
          <span className="max-score">Max Score: {problem.max_score}</span>
          {problem.tags?.length > 0 && (
            <div className="tag-list">
              {problem.tags.map((t) => (
                <span key={t} className="tag-badge">{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="problem-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <button className={`admin-tab ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>Description</button>
        {problem.editorial && <button className={`admin-tab ${activeTab === 'editorial' ? 'active' : ''}`} onClick={() => setActiveTab('editorial')}>💡 Editorial</button>}
        <button className={`admin-tab ${activeTab === 'discussions' ? 'active' : ''}`} onClick={() => setActiveTab('discussions')}>💬 Discussions</button>
      </div>

      {activeTab === 'description' && (
        <>
          <div className="problem-body">
            <h2>Problem Statement</h2>
            <div className="problem-description">
              {problem.description.split("\n").map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          </div>

          {testCases.length > 0 && (
            <div className="test-cases-section">
              <h2>📋 Sample Test Cases</h2>
              <div className="test-cases-list">
                {testCases.map((tc, idx) => (
                  <div key={tc.test_case_id} className="test-case-card">
                    <div className="test-case-header"><span className="test-case-label">Example {idx + 1}</span></div>
                    <div className="test-case-body">
                      <div className="test-case-io">
                        <div className="test-case-input"><label>Input</label><pre>{tc.input}</pre></div>
                        <div className="test-case-output"><label>Expected Output</label><pre>{tc.expected_output}</pre></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'editorial' && problem.editorial && (
        <div className="problem-editorial" style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid var(--border)', borderRadius: '12px'}}>
          <h2 style={{color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px'}}>💡 Problem Editorial / Solution</h2>
          <div className="problem-description" style={{marginTop: '15px'}}>
            {problem.editorial.split("\n").map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'discussions' && (
        <div className="problem-discussions" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3>Community Discussions</h3>
          {isAuthenticated ? (
            <form onSubmit={handlePostComment} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <textarea 
                value={newComment} 
                onChange={(e) => setNewComment(e.target.value)} 
                placeholder="Ask a question or share your thoughts..."
                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', minHeight: '80px', resize: 'vertical' }}
              />
              <button type="submit" disabled={postingComment} className="btn-primary" style={{ alignSelf: 'flex-end' }}>
                {postingComment ? "Posting..." : "Post Comment"}
              </button>
            </form>
          ) : (
            <p className="muted-text">Please log in to participate in the discussion.</p>
          )}

          <div className="comments-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
            {comments.length === 0 ? <p className="muted-text">No comments yet. Be the first to start the discussion!</p> :
              comments.map((comment: any) => (
                <div key={comment.comment_id} style={{ padding: '16px', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{comment.username}</span>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{new Date(comment.created_at).toLocaleString()}</span>
                  </div>
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{comment.content}</p>
                </div>
              ))
            }
          </div>
        </div>
      )}

      <div className="problem-actions" style={{ marginTop: '30px' }}>
        <button onClick={() => navigate(`/submit?problem=${problem.problem_id}`)} className="btn-primary">
          Submit Solution
        </button>
      </div>
    </div>
  );
}