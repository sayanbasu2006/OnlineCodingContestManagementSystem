import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth, useTheme } from "../App";
import { fetchProblemById, submitSolution } from "../api/api";
import Editor from "@monaco-editor/react";
import { motion } from "framer-motion";
import { useToast } from "../components/Toast";
import confetti from "canvas-confetti";

let socket: Socket;

const BOILERPLATE = `function solve() {\n  // Your solution here\n  return 0;\n}`;

export default function BattleArena() {
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();

  const [status, setStatus] = useState<"IDLE" | "SEARCHING" | "BATTLE" | "FINISHED">("IDLE");
  const [roomId, setRoomId] = useState("");
  const [opponent, setOpponent] = useState("");
  const [problem, setProblem] = useState<any>(null);
  
  const [code, setCode] = useState(BOILERPLATE);
  const [language, setLanguage] = useState("javascript");
  const [submitting, setSubmitting] = useState(false);
  const [winner, setWinner] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;

    socket = io("http://localhost:5001");

    socket.on("waiting_for_match", () => setStatus("SEARCHING"));

    socket.on("match_found", async (data: any) => {
      setRoomId(data.roomId);
      setOpponent(data.opponent.p1 === user?.username ? data.opponent.p2 : data.opponent.p1);
      
      try {
        const prob = await fetchProblemById(data.problemId);
        setProblem(prob);
        setStatus("BATTLE");
        showToast("Match found! Let the battle begin!", "success");
      } catch (e) {
        showToast("Error loading problem", "error");
      }
    });

    socket.on("battle_over", (data: any) => {
      setWinner(data.winner);
      setStatus("FINISHED");
      if (data.winner === user?.username) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        showToast("You won the battle!", "success");
      } else {
        showToast(`${data.winner} won the battle!`, "warning");
      }
    });

    return () => { socket.disconnect(); };
  }, [isAuthenticated]);

  const findMatch = () => {
    if (!isAuthenticated) { showToast("Must be logged in to battle", "error"); return; }
    socket.emit("find_match", { username: user?.username });
  };

  const handleSubmit = async () => {
    if (!problem) return;
    setSubmitting(true);
    try {
      const res = await submitSolution(0, problem.problem_id, code, language);
      if (res.score > 0) {
        socket.emit("submit_battle_code", { roomId, score: res.score, username: user?.username });
      } else {
        showToast("Tests failed. Keep trying!", "error");
      }
    } catch (e) {
      showToast("Submission failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <div className="battle-page"><h1>1v1 Live Code Battles</h1><p>Please log in to participate.</p></div>;
  }

  return (
    <div className="battle-page" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {status === "IDLE" && (
        <div style={{ margin: 'auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>⚔️ Code Battle Arena</h1>
          <p style={{ color: 'var(--muted)', marginBottom: '30px', fontSize: '1.2rem' }}>Compete head-to-head in real-time coding challenges.</p>
          <button onClick={findMatch} className="btn-primary" style={{ fontSize: '1.2rem', padding: '16px 32px' }}>
            Find Match
          </button>
        </div>
      )}

      {status === "SEARCHING" && (
        <div style={{ margin: 'auto', textAlign: 'center' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} style={{ fontSize: '4rem', marginBottom: '20px' }}>
            ⏳
          </motion.div>
          <h2>Searching for opponent...</h2>
          <p style={{ color: 'var(--muted)' }}>Matching you with a player of similar skill.</p>
        </div>
      )}

      {status === "BATTLE" && problem && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', height: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-2)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="user-avatar">{user?.username[0].toUpperCase()}</span>
                <span style={{ fontWeight: 600 }}>{user?.username} (You)</span>
              </div>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)' }}>VS</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 600 }}>{opponent}</span>
                <span className="user-avatar" style={{ background: '#ef4444' }}>{opponent[0].toUpperCase()}</span>
              </div>
            </div>

            <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', flex: 1, overflowY: 'auto' }}>
              <h2>{problem.title}</h2>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', marginTop: '16px' }}>{problem.description}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ padding: '8px', borderRadius: '8px', background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
              </select>
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
                {submitting ? "Submitting..." : "Submit Solution"}
              </button>
            </div>
            
            <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <Editor
                height="100%"
                language={language}
                value={code}
                onChange={(val) => setCode(val || "")}
                theme={theme === "dark" ? "vs-dark" : "light"}
                options={{ fontSize: 14, minimap: { enabled: false } }}
              />
            </div>
          </div>
        </div>
      )}

      {status === "FINISHED" && (
        <div style={{ margin: 'auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>
            {winner === user?.username ? "🏆 You Won!" : "💀 You Lost"}
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
            {winner === user?.username ? "Great job, your solution passed all tests first." : `${winner} solved the problem faster.`}
          </p>
          <button onClick={() => { setStatus("IDLE"); setCode(BOILERPLATE); }} className="btn-primary" style={{ padding: '12px 24px' }}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
