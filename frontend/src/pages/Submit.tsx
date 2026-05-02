import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { useSearchParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { fetchContests, fetchContestProblems, fetchProblems, submitSolution, fetchParticipations, getAiHint } from "../api/api";
import { useToast } from "../components/Toast";
import { useTheme } from "../App";

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
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Your solution here
    
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    // Your solution here
    
    return 0;
}`,
  java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Your solution here
        
    }
}`,
  python: `# Your solution here

def solve():
    pass

solve()`,
  javascript: `// Your solution here
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
    // Process input
});`,
};

export default function Submit() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { theme } = useTheme();

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

  const [aiHint, setAiHint] = useState<string | null>(null);
  const [askingAi, setAskingAi] = useState(false);

  // Load contests and participations on mount
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

  // Load problems when contest changes
  useEffect(() => {
    setLoadingProblems(true);
    setSelectedProblem(0);

    const fetchPromise = selectedContest === 0 
      ? fetchProblems()
      : fetchContestProblems(selectedContest);

    fetchPromise
      .then((data: any) => {
        // fetchProblems returns { data: Problem[], total: ... }
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

  // Set boilerplate when language changes
  useEffect(() => {
    if (!code || code === BOILERPLATE.cpp || code === BOILERPLATE.c || code === BOILERPLATE.java || code === BOILERPLATE.python || code === BOILERPLATE.javascript) {
      setCode(BOILERPLATE[language] || "");
    }
  }, [language]);

  const handleAskAi = async () => {
    if (!selectedProblem || !code.trim()) {
      showToast("Select a problem and write some code first", "warning");
      return;
    }
    setAskingAi(true);
    setAiHint(null);
    try {
      const res = await getAiHint(selectedProblem, code, language);
      setAiHint(res.hint);
    } catch (err: any) {
      showToast("Failed to get AI hint. API key might be missing.", "error");
    } finally {
      setAskingAi(false);
    }
  };

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

  if (loading) return <div className="skeleton-block" />;

  // const joinedContests = contests.filter((c) => participations.includes(c.contest_id));

  return (
    <div className="submit-page">
      <h1>🚀 Submit Solution</h1>

      {contests.length === 0 && (
        <div className="empty-state" style={{ marginBottom: 20 }}>
          There are no ongoing contests at the moment.{" "}
          <a href="/contests" style={{ color: "var(--accent)" }}>
            Go to Contests →
          </a>
        </div>
      )}

      <form onSubmit={handleSubmit} className="submit-form">

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="contest">Contest</label>
            <select
              id="contest"
              value={selectedContest}
              onChange={(e) => setSelectedContest(parseInt(e.target.value))}
              required
            >
              <option value={0}>Practice Area (No Contest)</option>
              {contests.map((c) => (
                <option key={c.contest_id} value={c.contest_id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="problem">Problem</label>
            <select
              id="problem"
              value={selectedProblem}
              onChange={(e) => setSelectedProblem(parseInt(e.target.value))}
              disabled={selectedContest === null || loadingProblems}
              required
            >
              <option value={0}>
                {selectedContest === null
                  ? "Select a contest or practice area"
                  : loadingProblems
                    ? "Loading problems..."
                    : "Select a problem"}
              </option>
              {problems.map((p) => (
                <option key={p.problem_id} value={p.problem_id}>
                  {p.title} • {p.difficulty} • {p.max_score} pts
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="language">Language</label>
            <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label htmlFor="code" style={{ margin: 0 }}>Code</label>
            <button 
              type="button" 
              onClick={handleAskAi} 
              disabled={askingAi || !selectedProblem}
              style={{ background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)', color: 'white', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}
            >
              ✨ {askingAi ? "Asking Mentor..." : "Ask AI Mentor"}
            </button>
          </div>
          {aiHint && (
            <div style={{ background: 'rgba(139, 92, 246, 0.1)', borderLeft: '4px solid #8b5cf6', padding: '12px', marginBottom: '12px', borderRadius: '0 4px 4px 0', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
              <strong>🤖 AI Mentor says:</strong><br />
              {aiHint}
            </div>
          )}
          <div className="monaco-editor-wrap">
            <Editor
              height="400px"
              language={LANGUAGE_MAP[language] || "plaintext"}
              value={code}
              onChange={(val) => setCode(val || "")}
              theme={theme === "dark" ? "vs-dark" : "light"}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 12 },
                lineNumbers: "on",
                roundedSelection: true,
                automaticLayout: true,
                tabSize: 4,
              }}
            />
          </div>
        </div>

        {result && (
          <div className={`submission-result ${result.score >= (problems.find(p => p.problem_id === selectedProblem)?.max_score || 100) * 0.8 ? 'result-success' : result.score >= (problems.find(p => p.problem_id === selectedProblem)?.max_score || 100) * 0.4 ? 'result-warning' : 'result-error'}`}>
            <div className="result-score">
              <span className="result-label">Score</span>
              <span className="result-value">{result.score}/{problems.find(p => p.problem_id === selectedProblem)?.max_score || '?'}</span>
            </div>
            {result.total_test_cases > 0 && (
              <div className="result-tests">
                <span className="result-label">Test Cases</span>
                <span className="result-value">{result.test_cases_passed}/{result.total_test_cases} passed</span>
              </div>
            )}
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting || selectedContest === null || !selectedProblem}
          >
            {submitting ? "Submitting..." : "Submit Solution"}
          </button>
        </div>
      </form>
    </div>
  );
}