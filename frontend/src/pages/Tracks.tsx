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

  const getTrackStyling = (diff: string) => {
    switch (diff) {
      case "BEGINNER":
        return {
          badge: "badge-easy",
          icon: "🌱",
          gradient: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, var(--surface) 100%)",
          borderColor: "rgba(34, 197, 94, 0.4)"
        };
      case "INTERMEDIATE":
        return {
          badge: "badge-medium",
          icon: "🚀",
          gradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, var(--surface) 100%)",
          borderColor: "rgba(59, 130, 246, 0.4)"
        };
      case "ADVANCED":
        return {
          badge: "badge-hard",
          icon: "⚡",
          gradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, var(--surface) 100%)",
          borderColor: "rgba(239, 68, 68, 0.4)"
        };
      default:
        return {
          badge: "badge-medium",
          icon: "📚",
          gradient: "var(--surface)",
          borderColor: "var(--border)"
        };
    }
  };

  if (loading) return <div className="skeleton-block" style={{ height: '400px' }} />;

  return (
    <div className="tracks-page" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="page-header" style={{ paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
        <div className="header-text">
          <h1 className="hero-title">Learning Tracks</h1>
          <p className="hero-subtitle">Follow a structured path to master algorithms and data structures.</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {tracks.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: 'var(--surface-2)', borderRadius: '20px', border: '1px dashed var(--border)' }}>
            No tracks available yet.
          </div>
        ) : (
          tracks.map((track, idx) => {
            const styling = getTrackStyling(track.difficulty);
            return (
              <motion.div
                key={track.track_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="dashboard-section"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '20px',
                  background: styling.gradient,
                  border: `1px solid ${styling.borderColor}`,
                  borderRadius: '20px',
                  padding: '28px',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                whileHover={{ transform: 'translateY(-4px)', boxShadow: 'var(--shadow)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '12px', 
                    background: 'var(--surface)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '24px',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    {styling.icon}
                  </div>
                  <span className={`badge ${styling.badge}`}>{track.difficulty}</span>
                </div>
                
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: 'var(--text)' }}>{track.title}</h2>
                  <p style={{ color: 'var(--muted)', margin: 0, lineHeight: 1.6, fontSize: '14px' }}>{track.description}</p>
                </div>

                <Link to={`/tracks/${track.track_id}`} className="btn-primary" style={{ textAlign: 'center', marginTop: 'auto', width: '100%' }}>
                  Start Track →
                </Link>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
