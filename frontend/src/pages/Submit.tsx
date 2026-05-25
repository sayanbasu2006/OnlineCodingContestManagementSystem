import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { useSearchParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { fetchContests, fetchContestProblems, fetchProblems, submitSolution, fetchParticipations } from "../api/api";
import { useToast } from "../components/Toast";
import { useTheme } from "../App";
import { motion } from "framer-motion";

interface Problem {
  problem_id: number;
  title: string;
  difficulty: string;
  max_score: number;
}

interface Contest {
  contest_id: number;
  title: string;
  status: string;
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

export default function Submit() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { } = useTheme();

  const [contests, setContests] = useState<Contest[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [, setParticipations] = useState<number[]>([]);

  const [selectedContest, setSelectedContest] = useState<number>(0);
  const [selectedProblem, setSelectedProblem] = useState<number>(0);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("cpp");

  const [loading, setLoading] = useState(true);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);



  useEffect(() => {
    const contestId = searchParams.get("contest");

    Promise.all([fetchContests(), fetchParticipations()])
      .then(([contestsData, participationsData]) => {
        const ongoingContests = contestsData.filter((c: Contest) => c.status === "ONGOING");
        setContests(ongoingContests);

        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const userParticipations = participationsData
          .filter((p: any) => p.user_id === user.user_id && p.status === 'STARTED')
          .map((p: any) => p.contest_id);
        setParticipations(userParticipations);

        if (contestId) {
          const cid = parseInt(contestId);
          setSelectedContest(cid);
        }
      })
      .catch(() => showToast("Failed to load data", "error"))
      .finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    setLoadingProblems(true);
    setSelectedProblem(0);

    const fetchPromise = selectedContest === 0 ? fetchProblems() : fetchContestProblems(selectedContest);

    fetchPromise
      .then((data: any) => {
        const problemList = data.data ? data.data : data; 
        setProblems(problemList);
        const problemParam = searchParams.get("problem");
        if (problemParam) {
          const pid = parseInt(problemParam);
          if (problemList.some((p: Problem) => p.problem_id === pid)) {
            setSelectedProblem(pid);
          }
        }
      })
      .catch(() => setProblems([]))
      .finally(() => setLoadingProblems(false));
  }, [selectedContest, searchParams]);

  useEffect(() => {
    if (!code || code === BOILERPLATE.cpp || code === BOILERPLATE.c || code === BOILERPLATE.java || code === BOILERPLATE.python || code === BOILERPLATE.javascript) {
      setCode(BOILERPLATE[language] || "");
    }
  }, [language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedContest === null || !selectedProblem) {
      showToast("Please select a problem", "warning");
      return;
    }

    if (!code.trim()) {
      showToast("Please enter your code", "warning");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      showToast("You must be logged in to submit", "error");
      navigate("/login");
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const res = await submitSolution(selectedContest, selectedProblem, code, language);
      setResult(res);
      showToast(`Solution submitted! Score: ${res.score}`, "success");
      
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

  if (loading) return <div className="skeleton-block" style={{ height: '600px' }} />;

  const currentProblem = problems.find(p => p.problem_id === selectedProblem);

  return (
    <div className="ide-layout">
      <div className="ide-header">
        <h1 className="hero-title">Code Editor</h1>
        {contests.length === 0 && (
          <div className="ide-warning">
            No ongoing contests. <a href="/contests">Go to Contests →</a>
          </div>
        )}
      </div>

      <div className="ide-workspace">
        <form onSubmit={handleSubmit} className="ide-form">
          <div className="ide-toolbar">
            <div className="toolbar-group">
              <div className="toolbar-item">
                <label>Contest / Practice</label>
                <select className="styled-select" value={selectedContest} onChange={(e) => setSelectedContest(parseInt(e.target.value))} required>
                  <option value={0}>General Practice (No Contest)</option>
                  {contests.map((c) => <option key={c.contest_id} value={c.contest_id}>{c.title}</option>)}
                </select>
              </div>

              <div className="toolbar-item">
                <label>Problem</label>
                <select className="styled-select" value={selectedProblem} onChange={(e) => setSelectedProblem(parseInt(e.target.value))} disabled={selectedContest === null || loadingProblems} required>
                  <option value={0}>{selectedContest === null ? "Select mode first" : loadingProblems ? "Loading..." : "Select a problem"}</option>
                  {problems.map((p) => <option key={p.problem_id} value={p.problem_id}>{p.title} ({p.difficulty})</option>)}
                </select>
              </div>

              <div className="toolbar-item">
                <label>Language</label>
                <select className="styled-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>
            </div>
          </div>

          <div className="ide-editor-area">
            <div className="monaco-wrapper">
              <Editor
                height="500px"
                language={LANGUAGE_MAP[language] || "plaintext"}
                value={code}
                onChange={(val) => setCode(val || "")}
                theme="vs-dark" // Force dark theme for editor for premium feel
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
                  wordWrap: "on"
                }}
              />
            </div>
          </div>

          {result && (
            <motion.div className={`result-panel ${result.score >= (currentProblem?.max_score || 100) * 0.8 ? 'success' : result.score >= (currentProblem?.max_score || 100) * 0.4 ? 'warning' : 'error'}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="result-metric">
                <span className="metric-label">Score</span>
                <span className="metric-value">{result.score}/{currentProblem?.max_score || '?'} pts</span>
              </div>
              {result.total_test_cases > 0 && (
                <div className="result-metric">
                  <span className="metric-label">Test Cases</span>
                  <span className="metric-value">{result.test_cases_passed}/{result.total_test_cases} passed</span>
                </div>
              )}
            </motion.div>
          )}

          <div className="ide-footer">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting || selectedContest === null || !selectedProblem}>
              {submitting ? "Compiling..." : "Submit Code"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}