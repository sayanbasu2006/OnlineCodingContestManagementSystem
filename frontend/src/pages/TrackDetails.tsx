import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchTrackById, fetchTrackProgress } from "../api/api";
import { useAuth } from "../App";
import { motion } from "framer-motion";

interface Problem {
  problem_id: number;
  title: string;
  difficulty: string;
  max_score: number;
  sequence_order: number;
}

interface Track {
  track_id: number;
  title: string;
  description: string;
  difficulty: string;
  problems: Problem[];
}

export default function TrackDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [track, setTrack] = useState<Track | null>(null);
  const [solvedIds, setSolvedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) return <div className="skeleton-block" />;
  if (error) return <p className="red">{error}</p>;
  if (!track) return <p>Track not found</p>;

  const progressPercentage = track.problems.length > 0 
    ? Math.round((solvedIds.length / track.problems.length) * 100) 
    : 0;

  const diffBadge = (d: string) => d === "EASY" ? "badge-easy" : d === "MEDIUM" ? "badge-medium" : "badge-hard";

  return (
    <div className="track-details-page">
      <button onClick={() => navigate('/tracks')} className="btn-back" style={{ marginBottom: '20px' }}>
        ← Back to Tracks
      </button>

      <div className="welcome-section">
        <h1>{track.title}</h1>
        <p>{track.description}</p>
        
        {isAuthenticated && (
          <div style={{ marginTop: '20px', background: 'var(--surface-2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600 }}>Your Progress</span>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{progressPercentage}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPercentage}%`, background: 'var(--accent)', transition: 'width 0.5s ease' }} />
            </div>
          </div>
        )}
      </div>

      <div className="track-problems-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '30px' }}>
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
    </div>
  );
}
