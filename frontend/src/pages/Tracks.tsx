import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchTracks } from "../api/api";
import { motion } from "framer-motion";

interface Track {
  track_id: number;
  title: string;
  description: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
}

export default function Tracks() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTracks()
      .then(setTracks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const difficultyBadge = (diff: string) => {
    if (diff === "BEGINNER") return "badge-easy";
    if (diff === "INTERMEDIATE") return "badge-medium";
    return "badge-hard";
  };

  if (loading) return <div className="skeleton-block" />;

  return (
    <div className="tracks-page">
      <div className="welcome-section">
        <h1>🗺️ Learning Tracks</h1>
        <p>Follow a structured path to master algorithms and data structures.</p>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {tracks.length === 0 ? (
          <p className="empty-text">No tracks available yet.</p>
        ) : (
          tracks.map((track, idx) => (
            <motion.div
              key={track.track_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="dashboard-section"
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{track.title}</h2>
                <span className={`diff-badge ${difficultyBadge(track.difficulty)}`}>{track.difficulty}</span>
              </div>
              <p style={{ color: 'var(--muted)', margin: 0, flex: 1 }}>{track.description}</p>
              <Link to={`/tracks/${track.track_id}`} className="btn-primary" style={{ textAlign: 'center', marginTop: 'auto' }}>
                Start Track →
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
