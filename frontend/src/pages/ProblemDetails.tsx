import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { fetchProblemById, fetchTestCases, submitSolution, fetchContestProblem, fetchContestProblems } from "../api/api";
import { useAuth } from "../App";
import { useToast } from "../components/Toast";
import { motion } from "framer-motion";

const fetchComments = async (id: number) => [];
const postComment = async (id: number, content: string) => {};

import Editor, { loader } from "@monaco-editor/react";
import confetti from "canvas-confetti";

loader.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.55.1/min/vs' } });

interface Problem {
  problem_id: number;
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  max_score: number;
  tags: string[];
  editorial?: string;
  sequence_order?: number;
  contest_index?: string;
}

interface ContestProblem extends Problem {
  sequence_order: number;
  contest_index: string;
}

interface TestCase {
  test_case_id: number;
  input: string;
  expected_output: string;
  is_sample: boolean;
}

const LANGUAGE_MAP: Record<string, string> = {
  cpp: "cpp",
  c: "c",
  java: "java",
  python: "python",
  javascript: "javascript",
};

const BOILERPLATE: Record<string, string> = {
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your solution here\n    \n    return 0;\n}`,
  c: `#include <stdio.h>\n\nint main() {\n    // Your solution here\n    \n    return 0;\n}`,
  java: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Your solution here\n        \n    }\n}`,
  python: `# Your solution here\n\ndef solve():\n    pass\n\nsolve()`,
  javascript: `// Your solution here\nconst readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin });\n\nrl.on('line', (line) => {\n    // Process input\n});`,
};

export default function ProblemDetails() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const contestId = parseInt(searchParams.get("contest") || "0");

  const [problem, setProblem] = useState<Problem | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<'description' | 'editorial' | 'submissions' | 'discussions'>('description');
  const [activeConsoleTab, setActiveConsoleTab] = useState<'testcase' | 'result'>('testcase');
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  // Editor State
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const [contestProblems, setContestProblems] = useState<ContestProblem[]>([]);

  const currentContestIndex = contestProblems.findIndex((p) => p.problem_id === problem?.problem_id);
  const previousContestProblem = currentContestIndex > 0 ? contestProblems[currentContestIndex - 1] : null;
  const nextContestProblem = currentContestIndex >= 0 && currentContestIndex < contestProblems.length - 1
    ? contestProblems[currentContestIndex + 1]
    : null;
  const isContestMode = contestId > 0;

  const navigateToProblem = (target: ContestProblem | null) => {
    if (!target) return;
    navigate(`/problems/${target.problem_id}?contest=${contestId}`);
  };

  useEffect(() => {
    if (!id) return;
    const pid = parseInt(id);

    const problemRequest = isContestMode ? fetchContestProblem(contestId, pid) : fetchProblemById(pid);
    Promise.all([
      problemRequest,
      isContestMode ? fetchContestProblems(contestId) : Promise.resolve([]),
      fetchTestCases(pid).catch(() => []),
      fetchComments(pid).catch(() => [])
    ])
      .then(([prob, contestProblemList, tc, comms]) => { 
        setProblem(prob); 
        setContestProblems(contestProblemList);
        setTestCases(tc); 
        setComments(comms);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, contestId, isContestMode]);

  useEffect(() => {
    if (!code || code === BOILERPLATE.cpp || code === BOILERPLATE.c || code === BOILERPLATE.java || code === BOILERPLATE.python || code === BOILERPLATE.javascript) {
      setCode(BOILERPLATE[language] || "");
    }
  }, [language]);

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



  const handleSubmit = async () => {
    if (!problem) return;
    if (!code.trim()) {
      showToast("Please enter your code", "warning");
      return;
    }
    if (!isAuthenticated) {
      showToast("You must be logged in to submit", "error");
      navigate("/login");
      return;
    }

    setSubmitting(true);
    setResult(null);
    setActiveConsoleTab('result');

    try {
      const res = await submitSolution(contestId, problem.problem_id, code, language);
      setResult(res);
      showToast(`Solution submitted! Score: ${res.score}`, "success");
      
      window.dispatchEvent(new Event('submission-success'));

      if (res.score > 0) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#22c55e', '#ffffff']
        });
      }
    } catch (err: any) {
      showToast(err.message || "Submission failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const diffBadge = (d: string) => d === "EASY" ? "badge-easy" : d === "MEDIUM" ? "badge-medium" : "badge-hard";

  if (loading) return <div className="skeleton-block" style={{ height: 'calc(100vh - 72px)' }} />;
  if (error) return <div className="ide-warning">{error}</div>;
  if (!problem) return <div className="empty-state">Problem not found</div>;

  return (
    <div className={`workspace-layout ${isContestMode ? "contest-workspace" : ""}`}>
      {/* LEFT PANE */}
      <div className="workspace-left">
        <div className="workspace-tabs">
          <button className={`workspace-tab ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>📝 Description</button>
          {problem.editorial && <button className={`workspace-tab ${activeTab === 'editorial' ? 'active' : ''}`} onClick={() => setActiveTab('editorial')}>💡 Editorial</button>}
          <button className={`workspace-tab ${activeTab === 'discussions' ? 'active' : ''}`} onClick={() => setActiveTab('discussions')}>💬 Discussions</button>
          <button className={`workspace-tab ${activeTab === 'submissions' ? 'active' : ''}`} onClick={() => setActiveTab('submissions')}>🕒 Submissions</button>
        </div>

        <div className="workspace-content">
          {activeTab === 'description' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h1 style={{ fontSize: '24px', margin: 0 }}>{problem.problem_id}. {problem.title}</h1>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <span className={`badge ${diffBadge(problem.difficulty)}`}>{problem.difficulty}</span>
                {problem.tags?.map(t => <span key={t} className="tag-chip">{t}</span>)}
              </div>
              
              <div className="prose-content">
                {(problem.description || "").split("\\n").map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>

              {testCases.length > 0 && (
                <div className="test-cases-section" style={{ marginTop: '32px' }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Sample Test Cases</h3>
                  <div className="test-cases-grid">
                    {testCases.map((tc, idx) => (
                      <div key={tc.test_case_id} className="test-case-block">
                        <div className="tc-header">Example {idx + 1}</div>
                        <div className="tc-io">
                          <div className="tc-part">
                            <span className="tc-label">Input</span>
                            <pre className="tc-pre">{tc.input}</pre>
                          </div>
                          <div className="tc-part">
                            <span className="tc-label">Output</span>
                            <pre className="tc-pre">{tc.expected_output}</pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'editorial' && problem.editorial && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="prose-content editorial-prose">
                {problem.editorial.split("\\n").map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'discussions' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="discussion-area">
                {isAuthenticated ? (
                  <form onSubmit={handlePostComment} className="comment-form">
                    <textarea 
                      value={newComment} 
                      onChange={(e) => setNewComment(e.target.value)} 
                      placeholder="Share your approach, ask questions, or provide hints..."
                      className="comment-input"
                    />
                    <div className="comment-form-actions">
                      <button type="submit" disabled={postingComment || !newComment.trim()} className="btn-primary btn-sm">
                        {postingComment ? "Posting..." : "Post Comment"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="login-prompt-banner">
                    <p>Please log in to participate in the discussion.</p>
                    <button onClick={() => navigate('/login')} className="btn-secondary btn-sm">Log In</button>
                  </div>
                )}

                <div className="comments-feed">
                  {comments.length === 0 ? (
                    <div className="empty-state" style={{ padding: '40px' }}>No discussions yet. Be the first!</div>
                  ) : (
                    comments.map((comment: any) => (
                      <div key={comment.comment_id} className="comment-card">
                        <div className="comment-header">
                          <div className="comment-author">
                            <div className="comment-avatar">{comment.username.charAt(0).toUpperCase()}</div>
                            <span className="author-name">{comment.username}</span>
                          </div>
                          <span className="comment-time">{new Date(comment.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="comment-body">{comment.content}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'submissions' && (
            <div className="empty-state">
              Log in to see your previous submissions.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANE */}
      <div className="workspace-right">
        <div className="editor-container">
          <div className="editor-toolbar">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>&lt;/&gt; Code</span>
              <select className="styled-select" value={language} onChange={(e) => setLanguage(e.target.value)} style={{ padding: '4px 8px', fontSize: '13px', marginLeft: '12px' }}>
                <option value="cpp">C++</option>
                <option value="c">C</option>
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>
            <div className="editor-actions">
              {/* AI Mentor Removed */}
            </div>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>

            <Editor
              height="100%"
              language={LANGUAGE_MAP[language] || "plaintext"}
              value={code}
              onChange={(val) => setCode(val || "")}
              theme="vs-dark"
              options={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16 },
                lineNumbers: "on",
                roundedSelection: true,
                automaticLayout: true,
                tabSize: 4,
              }}
            />
          </div>
        </div>

        <div className="console-panel">
          <div className="console-header">
            <div style={{ display: 'flex', gap: '16px' }}>
              <button 
                onClick={() => setActiveConsoleTab('testcase')}
                style={{ background: 'none', border: 'none', color: activeConsoleTab === 'testcase' ? 'var(--text)' : 'var(--muted)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                <span style={{ color: '#3b82f6', marginRight: '6px' }}>&lt;/&gt;</span> Testcase
              </button>
              <button 
                onClick={() => setActiveConsoleTab('result')}
                style={{ background: 'none', border: 'none', color: activeConsoleTab === 'result' ? 'var(--text)' : 'var(--muted)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                <span style={{ color: '#22c55e', marginRight: '6px' }}>☑</span> Test Result
              </button>
            </div>
            <div className="editor-actions">
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary btn-sm">
                {submitting ? "Submitting..." : "Submit Code"}
              </button>
              {result && result.score > 0 && (
                <button
                  onClick={() => isContestMode ? navigateToProblem(nextContestProblem) : navigate(`/problems/${problem.problem_id + 1}`)}
                  disabled={isContestMode && !nextContestProblem}
                  className="btn-accent btn-sm"
                >
                  {isContestMode ? (nextContestProblem ? "Next Problem" : "Contest Complete") : "Next Question →"}
                </button>
              )}
            </div>
          </div>
          <div className="console-content">
            {activeConsoleTab === 'testcase' && (
              <div>
                {testCases.map((tc, idx) => (
                  <div key={tc.test_case_id} style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>Case {idx + 1} Input:</div>
                    <pre style={{ background: 'var(--surface-2)', padding: '8px', borderRadius: '4px', margin: 0, fontFamily: '"JetBrains Mono", monospace', fontSize: '13px' }}>{tc.input}</pre>
                  </div>
                ))}
                {testCases.length === 0 && <div style={{ color: 'var(--muted)' }}>No test cases available.</div>}
              </div>
            )}

            {activeConsoleTab === 'result' && (
              <>
                {!result && !submitting && (
                  <div style={{ color: 'var(--muted)', textAlign: 'center', marginTop: '32px' }}>
                    You must submit your code first to see results.
                  </div>
                )}
            {submitting && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}>
                <div className="spinner" style={{ width: '16px', height: '16px', borderTopColor: 'var(--accent-2)' }} />
                Running against test cases...
              </div>
            )}
            {result && (
              <div>
                <h3 style={{ margin: '0 0 16px 0', color: result.score > 0 ? '#10b981' : '#ef4444' }}>
                  {result.score > 0 ? 'Accepted' : 'Failed'}
                </h3>
                <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Score</div>
                    <div style={{ fontWeight: 600 }}>{result.score} / {problem.max_score}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Time</div>
                    <div style={{ fontWeight: 600 }}>{result.execution_time}ms</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Memory</div>
                    <div style={{ fontWeight: 600 }}>{(result.memory_used / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                </div>
                {result.error && (
                  <div className="test-result-box" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#991b1b' }}>
                    <strong>Error:</strong>
                    <pre style={{ background: '#fee2e2', color: '#991b1b' }}>{result.error}</pre>
                  </div>
                )}
                {result.compiler_output && (
                  <div className="test-result-box">
                    <strong>Compiler Output:</strong>
                    <pre>{result.compiler_output}</pre>
                  </div>
                )}
              </div>
            )}
            </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}