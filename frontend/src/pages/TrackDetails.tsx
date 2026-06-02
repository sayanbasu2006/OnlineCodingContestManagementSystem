import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchTrackById, fetchTrackProgress } from "../api/api";
import { useAuth } from "../App";
import { motion, AnimatePresence } from "framer-motion";

interface Problem {
  problem_id: number;
  title: string;
  difficulty: string;
  max_score: number;
  sequence_order: number;
  editorial?: string;
}

interface Concept {
  concept_id: number;
  title: string;
  content: string;
  sequence_order: number;
  problems: Problem[];
}

interface Track {
  track_id: number;
  title: string;
  description: string;
  difficulty: string;
  concepts?: Concept[];
  problems: Problem[];
}

// Custom Markdown parser helper for premium educational tutorials
function SimpleMarkdown({ content }: { content: string }) {
  if (!content) return null;
  const parts = content.split(/(```[\s\S]*?```)/g);
  return (
    <div className="editorial-markdown" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          const match = part.match(/```(\w*)\n([\s\S]*?)```/);
          const lang = match ? match[1] : '';
          const code = match ? match[2] : part.slice(3, -3);
          return (
            <div key={index} className="code-block-container" style={{ margin: '14px 0', position: 'relative', width: '100%' }}>
              {lang && (
                <div style={{
                  position: 'absolute',
                  top: '0',
                  right: '16px',
                  background: 'var(--accent)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderBottomLeftRadius: '6px',
                  borderBottomRightRadius: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {lang}
                </div>
              )}
              <pre style={{
                background: 'rgba(15, 17, 23, 0.75)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '20px',
                overflowX: 'auto',
                fontSize: '13.5px',
                lineHeight: '1.6',
                fontFamily: '"Fira Code", "JetBrains Mono", monospace',
                color: '#e2e8f0',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4)'
              }}>
                <code style={{ fontFamily: 'inherit', color: 'inherit' }}>{code.trim()}</code>
              </pre>
            </div>
          );
        } else {
          const lines = part.split('\n');
          return lines.map((line, lIdx) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={lIdx} style={{ height: '4px' }} />;
            
            if (trimmed.startsWith('####')) {
              return <h5 key={lIdx} style={{ color: 'var(--text)', margin: '12px 0 6px', fontSize: '1rem', fontWeight: 600 }}>{trimmed.replace(/^####\s*/, '')}</h5>;
            }
            if (trimmed.startsWith('###')) {
              return <h4 key={lIdx} style={{ color: 'var(--accent)', margin: '18px 0 8px', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.3px' }}>{trimmed.replace(/^###\s*/, '')}</h4>;
            }
            if (trimmed.startsWith('##')) {
              return <h3 key={lIdx} style={{ color: 'var(--text)', margin: '22px 0 10px', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.4px' }}>{trimmed.replace(/^##\s*/, '')}</h3>;
            }
            if (trimmed.startsWith('#')) {
              return <h2 key={lIdx} style={{ color: 'var(--text)', margin: '26px 0 12px', fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.5px' }}>{trimmed.replace(/^#\s*/, '')}</h2>;
            }
            
            if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
              return (
                <li key={lIdx} style={{ marginLeft: '24px', listStyleType: 'disc', margin: '6px 0', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {parseInlineCode(trimmed.replace(/^[-*]\s*/, ''))}
                </li>
              );
            }
            if (/^\d+\.\s*/.test(trimmed)) {
              return (
                <li key={lIdx} style={{ marginLeft: '24px', listStyleType: 'decimal', margin: '6px 0', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {parseInlineCode(trimmed.replace(/^\d+\.\s*/, ''))}
                </li>
              );
            }
            
            return <p key={lIdx} style={{ margin: '6px 0', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{parseInlineCode(trimmed)}</p>;
          });
        }
      })}
    </div>
  );
}

function parseInlineCode(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.15)',
          padding: '2px 6px',
          borderRadius: '6px',
          fontFamily: '"Fira Code", monospace',
          fontSize: '0.85em',
          color: '#f43f5e',
          fontWeight: 500
        }}>
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export default function TrackDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [track, setTrack] = useState<Track | null>(null);
  const [solvedIds, setSolvedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeConceptIdx, setActiveConceptIdx] = useState(0);

  useEffect(() => {
    if (!id) return;
    const tid = parseInt(id);

    const promises: Promise<any>[] = [fetchTrackById(tid)];
    if (isAuthenticated) {
      promises.push(fetchTrackProgress(tid).catch(() => ({ solved_problem_ids: [] })));
    }

    Promise.all(promises)
      .then(([trackData, progressData]) => {
        setTrack(trackData);
        if (progressData) setSolvedIds(progressData.solved_problem_ids || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isAuthenticated]);

  if (loading) return <div className="skeleton-block" style={{ height: '400px', borderRadius: '24px' }} />;
  if (error) return <p className="red" style={{ textAlign: 'center', padding: '40px' }}>{error}</p>;
  if (!track) return <p style={{ textAlign: 'center', padding: '40px' }}>Track not found</p>;

  const totalProblemsCount = track.problems?.length || 0;
  const progressPercentage = totalProblemsCount > 0 
    ? Math.round((solvedIds.length / totalProblemsCount) * 100) 
    : 0;

  const diffBadge = (d: string) => d === "EASY" ? "badge-easy" : d === "MEDIUM" ? "badge-medium" : "badge-hard";
  
  const hasConcepts = track.concepts && track.concepts.length > 0;
  const activeConcept = hasConcepts ? track.concepts![activeConceptIdx] : null;

  return (
    <div className="track-details-page" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => navigate('/tracks')} className="btn-back">
          ← Back to Tracks
        </button>
        <span style={{ fontSize: '13px', color: 'var(--muted)', background: 'var(--surface-2)', padding: '6px 12px', borderRadius: '30px', border: '1px solid var(--border)', fontWeight: 600 }}>
          Difficulty: {track.difficulty}
        </span>
      </div>

      {/* Hero Welcome banner */}
      <div className="welcome-section" style={{ padding: '32px', background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)', border: '1px solid var(--border)', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 850, margin: '0 0 10px 0', background: 'linear-gradient(135deg, var(--text) 0%, var(--muted) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {track.title}
        </h1>
        <p style={{ margin: '0', color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6', maxWidth: '800px' }}>
          {track.description}
        </p>
        
        {isAuthenticated && (
          <div style={{ marginTop: '24px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: '15px' }}>Overall Track Completion</span>
              <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '16px' }}>{progressPercentage}%</span>
            </div>
            <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPercentage}%`, background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-2) 100%)', transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 0 12px rgba(59,130,246,0.5)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12.5px', color: 'var(--muted)' }}>
              <span>{solvedIds.length} modules completed</span>
              <span>{totalProblemsCount} total practice items</span>
            </div>
          </div>
        )}
      </div>

      {/* Concepts Interactive Stepper View */}
      {hasConcepts ? (
        <div style={{ display: 'grid', gridTemplateColumns: '290px 1fr', gap: '30px', alignItems: 'start' }} className="track-layout-grid">
          
          {/* Left Concepts Navigation Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'sticky', top: '100px' }} className="track-sidebar">
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 4px 8px' }}>
              Learning Syllabus
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--surface)', padding: '16px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
              {track.concepts!.map((concept, idx) => {
                const isActive = idx === activeConceptIdx;
                const totalProbs = concept.problems.length;
                const solvedProbs = concept.problems.filter(p => solvedIds.includes(p.problem_id)).length;
                const allSolved = totalProbs > 0 && solvedProbs === totalProbs;

                return (
                  <button
                    key={concept.concept_id}
                    onClick={() => setActiveConceptIdx(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: isActive 
                        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.04) 100%)' 
                        : 'transparent',
                      border: `1px solid ${isActive ? 'rgba(59, 130, 246, 0.35)' : 'transparent'}`,
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    className={`sidebar-concept-btn ${isActive ? 'active' : ''}`}
                  >
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '8px',
                      background: allSolved 
                        ? 'rgba(34, 197, 94, 0.15)' 
                        : isActive 
                          ? 'var(--accent)' 
                          : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${allSolved ? 'rgba(34, 197, 94, 0.3)' : 'transparent'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: allSolved ? '#4ade80' : isActive ? '#fff' : 'var(--muted)',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      {allSolved ? '✓' : idx + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '13.5px',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? 'var(--text)' : 'var(--text-secondary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {concept.title}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: isActive ? 'rgba(59, 130, 246, 0.8)' : 'var(--muted)',
                        marginTop: '2px',
                        fontWeight: 500
                      }}>
                        {solvedProbs} / {totalProbs} Practiced
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Concept Content Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }} className="track-content-pane">
            <AnimatePresence mode="wait">
              {activeConcept && (
                <motion.div
                  key={activeConcept.concept_id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
                >
                  
                  {/* Tutorial Reader Card */}
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '18px' }}>🎓</span>
                      <span style={{ fontSize: '12.5px', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Concept {activeConceptIdx + 1} Tutorial & Editorial
                      </span>
                    </div>
                    
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 20px 0', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
                      {activeConcept.title}
                    </h2>
                    
                    <div className="concept-tutorial-body" style={{ fontSize: '15px' }}>
                      <SimpleMarkdown content={activeConcept.content} />
                    </div>
                  </div>

                  {/* Practice Problems in this Concept */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                        Practice Problems
                      </h3>
                      <p style={{ color: 'var(--muted)', fontSize: '13.5px', margin: 0 }}>
                        Reinforce your knowledge of {activeConcept.title} with these problems from the problem bank.
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {activeConcept.problems.map((prob, idx) => {
                        const isSolved = solvedIds.includes(prob.problem_id);
                        // Sequence lock inside concept: previous problem must be solved to unlock current
                        const isLocked = !isSolved && idx > 0 && !solvedIds.includes(activeConcept.problems[idx - 1].problem_id);

                        return (
                          <motion.div 
                            key={prob.problem_id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            style={{
                              background: isSolved ? 'rgba(34, 197, 94, 0.06)' : 'var(--surface)',
                              border: `1px solid ${isSolved ? 'rgba(34, 197, 94, 0.25)' : 'var(--border)'}`,
                              padding: '18px 24px',
                              borderRadius: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '20px',
                              opacity: isLocked ? 0.55 : 1,
                              pointerEvents: isLocked ? 'none' : 'auto',
                              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                              transition: 'border-color 0.2s, background-color 0.2s'
                            }}
                            className={`practice-problem-row ${isSolved ? 'solved' : ''} ${isLocked ? 'locked' : ''}`}
                          >
                            <div style={{ 
                              width: '32px', height: '32px', borderRadius: '8px', 
                              background: isSolved ? 'rgba(34,197,94,0.15)' : 'var(--surface-2)', 
                              display: 'flex', alignItems: 'center', justifyContent: 'center', 
                              fontSize: '14px', fontWeight: 'bold', color: isSolved ? '#22c55e' : 'var(--muted)',
                              border: `1px solid ${isSolved ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`
                            }}>
                              {isSolved ? '✓' : prob.sequence_order}
                            </div>
                            
                            <div style={{ flex: 1 }}>
                              <h4 style={{ margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 650 }}>
                                {prob.title}
                                {isLocked && <span style={{ fontSize: '13px' }}>🔒</span>}
                              </h4>
                              <div style={{ display: 'flex', gap: '12px', fontSize: '13px', alignItems: 'center' }}>
                                <span className={`diff-badge ${diffBadge(prob.difficulty)}`} style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                                  {prob.difficulty}
                                </span>
                                <span style={{ color: 'var(--muted)' }}>Score: {prob.max_score} pts</span>
                              </div>
                            </div>

                            {!isLocked && (
                              <Link to={`/problems/${prob.problem_id}`} className={isSolved ? "btn-secondary btn-sm" : "btn-primary btn-sm"} style={{ borderRadius: '10px', padding: '8px 16px', fontSize: '13px' }}>
                                {isSolved ? "Review" : "Solve →"}
                              </Link>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      ) : (
        /* Fallback Legacy Flat Problem List if no Concepts exist */
        <div className="track-problems-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ marginBottom: '10px' }}>Problems in this Track</h2>
          {track.problems.map((prob, idx) => {
            const isSolved = solvedIds.includes(prob.problem_id);
            const isLocked = !isSolved && idx > 0 && !solvedIds.includes(track.problems[idx - 1].problem_id);

            return (
              <motion.div 
                key={prob.problem_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                style={{
                  background: isSolved ? 'rgba(34, 197, 94, 0.1)' : 'var(--surface)',
                  border: `1px solid ${isSolved ? 'rgba(34, 197, 94, 0.3)' : 'var(--border)'}`,
                  padding: '20px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  opacity: isLocked ? 0.6 : 1,
                  pointerEvents: isLocked ? 'none' : 'auto'
                }}
              >
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '50%', 
                  background: isSolved ? '#22c55e' : 'var(--surface-2)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: '18px', fontWeight: 'bold', color: isSolved ? '#fff' : 'var(--muted)'
                }}>
                  {isSolved ? '✓' : prob.sequence_order}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {prob.title}
                    {isLocked && <span style={{ fontSize: '14px' }}>🔒</span>}
                  </h3>
                  <div style={{ display: 'flex', gap: '10px', fontSize: '14px' }}>
                    <span className={`diff-badge ${diffBadge(prob.difficulty)}`}>{prob.difficulty}</span>
                    <span style={{ color: 'var(--muted)' }}>{prob.max_score} pts</span>
                  </div>
                </div>

                {!isLocked && (
                  <Link to={`/problems/${prob.problem_id}`} className={isSolved ? "btn-secondary" : "btn-primary"}>
                    {isSolved ? "Review" : "Solve →"}
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

