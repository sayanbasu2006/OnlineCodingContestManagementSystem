import { useState } from "react";
import Editor from "@monaco-editor/react";
import { runPlaygroundCode } from "../api/api";
import { useToast } from "../components/Toast";
import { useTheme } from "../App";
import { motion } from "framer-motion";

const LANGUAGE_MAP: Record<string, string> = {
  cpp: "cpp",
  c: "c",
  java: "java",
  python: "python",
  javascript: "javascript",
};

const BOILERPLATE: Record<string, string> = {
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, CodeArena Playground!";\n    return 0;\n}`,
  python: `print("Hello, CodeArena Playground!")`,
  javascript: `console.log("Hello, CodeArena Playground!");`,
  java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, CodeArena Playground!");\n    }\n}`,
  c: `#include <stdio.h>\n\nint main() {\n    printf("Hello, CodeArena Playground!");\n    return 0;\n}`
};

export default function Playground() {
  const { theme } = useTheme();
  const { showToast } = useToast();

  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(BOILERPLATE.javascript);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(BOILERPLATE[lang] || "");
  };

  const handleRun = async () => {
    if (!code.trim()) {
      showToast("Code cannot be empty", "warning");
      return;
    }
    setRunning(true);
    setOutput("");
    setError(null);
    try {
      const res = await runPlaygroundCode(code, language, input);
      if (res.error) {
        setError(res.error);
      } else {
        setOutput(res.output);
      }
    } catch (err: any) {
      setError(err.message || "Failed to run code");
    } finally {
      setRunning(false);
    }
  };

  return (
    <motion.div 
      className="playground-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px', height: 'calc(100vh - 120px)' }}
    >
      <div className="editor-section" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>💻 Code Playground</h2>
          <select value={language} onChange={handleLanguageChange} style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="c">C</option>
          </select>
        </div>
        <div className="monaco-editor-wrap" style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <Editor
            height="100%"
            language={LANGUAGE_MAP[language]}
            value={code}
            onChange={(val) => setCode(val || "")}
            theme={theme === "dark" ? "vs-dark" : "light"}
            options={{ fontSize: 14, minimap: { enabled: false }, padding: { top: 16 } }}
          />
        </div>
      </div>

      <div className="io-section" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '15px' }}>Custom Input (stdin)</h3>
          <textarea 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Provide input here..."
            style={{ flex: 1, width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', color: 'var(--text)', fontFamily: 'monospace', resize: 'none' }}
          />
        </div>

        <button 
          onClick={handleRun} 
          disabled={running}
          className="btn-primary"
          style={{ width: '100%', padding: '16px', fontSize: '16px', display: 'flex', justifyContent: 'center', gap: '8px' }}
        >
          {running ? "⏳ Running..." : "▶ Run Code"}
        </button>

        <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', flex: 1.5, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '15px' }}>Output (stdout/stderr)</h3>
          <div style={{ flex: 1, background: '#000', borderRadius: '8px', padding: '16px', overflowY: 'auto', fontFamily: 'monospace', color: error ? '#ef4444' : '#22c55e', border: '1px solid var(--border)' }}>
            {running ? <span style={{color: 'var(--muted)'}}>Executing...</span> : error ? error : output || <span style={{color: 'var(--muted)'}}>Output will appear here.</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
