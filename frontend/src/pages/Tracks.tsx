import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchTracks } from "../api/api";
import { motion } from "framer-motion";

interface Track {
  track_id: number;
  title: string;
  description: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  total_problems?: number;
  solved_problems?: number;
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

  const getTrackMetadata = (title: string) => {
    switch (title) {
      case "Algorithms 101":
        return {
          estTime: "12 Hrs",
          completed: 3,
          total: 15,
          prereq: "Basic coding",
          icon: "🌱",
        };
      case "Data Structures Mastery":
        return {
          estTime: "20 Hrs",
          completed: 0,
          total: 18,
          prereq: "Algorithms 101",
          icon: "🚀",
        };
      case "Advanced Graph Theory":
        return {
          estTime: "25 Hrs",
          completed: 0,
          total: 20,
          prereq: "Data Structures Mastery",
          icon: "⚡",
        };
      default:
        return {
          estTime: "10 Hrs",
          completed: 0,
          total: 10,
          prereq: "None",
          icon: "📚",
        };
    }
  };

  const getDifficultyClass = (diff: string) => {
    switch (diff) {
      case "BEGINNER":
        return "beginner";
      case "INTERMEDIATE":
        return "intermediate";
      case "ADVANCED":
        return "advanced";
      default:
        return "intermediate";
    }
  };

  if (loading) return <div className="skeleton-block" style={{ height: "400px" }} />;

  return (
    <div className="tracks-page" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div className="page-header" style={{ paddingBottom: "24px", borderBottom: "1px solid var(--border)" }}>
        <div className="header-text">
          <h1 className="hero-title" style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "8px" }}>Learning Tracks</h1>
          <p className="hero-subtitle" style={{ color: "var(--muted)", fontSize: "1.1rem" }}>Follow a structured path to master algorithms and data structures.</p>
        </div>
      </div>

      <div className="tracks-list-container">
        {tracks.length === 0 ? (
          <div className="empty-state" style={{ textAlign: "center", padding: "60px", background: "var(--surface-2)", borderRadius: "20px", border: "1px dashed var(--border)" }}>
            No tracks available yet.
          </div>
        ) : (
          tracks.map((track, idx) => {
            const metadata = getTrackMetadata(track.title);
            const diffClass = getDifficultyClass(track.difficulty);
            
            const totalProblems = track.total_problems !== undefined ? track.total_problems : metadata.total;
            const solvedProblems = track.solved_problems !== undefined ? track.solved_problems : metadata.completed;
            const completionPercent = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

            return (
              <motion.div
                key={track.track_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`track-row-card track-glow-${diffClass}`}
              >
                <div className="track-row-main">
                  <div className="track-row-left">
                    <div className={`track-icon-glow-wrapper track-icon-${diffClass}`}>
                      {metadata.icon}
                    </div>
                    <div className="track-details-text">
                      <h2 style={{ margin: "0 0 4px 0", fontSize: "1.4rem", fontWeight: 700, color: "var(--text)" }}>
                        {track.title}
                      </h2>
                      <p style={{ color: "var(--muted)", margin: 0, lineHeight: 1.6, fontSize: "14.5px", maxWidth: "650px" }}>
                        {track.description}
                      </p>
                    </div>
                  </div>

                  <div className="track-row-right">
                    <span className={`badge badge-${diffClass === "beginner" ? "easy" : diffClass === "intermediate" ? "medium" : "hard"}`}>
                      {track.difficulty}
                    </span>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", fontSize: "0.9rem" }}>
                        <span className="track-metric-item">
                          Est. Time: <span className="track-metric-highlight">{metadata.estTime}</span>
                        </span>
                        <span className="track-metric-item">
                          <span className="track-metric-highlight">{solvedProblems}/{totalProblems}</span> modules
                        </span>
                      </div>

                      <div className="track-progress-info">
                        <div className="track-progress-bar-bg">
                          <div
                            className={`track-progress-bar-fill track-progress-fill-${diffClass}`}
                            style={{ width: `${completionPercent}%` }}
                          />
                        </div>
                      </div>

                      <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                        Prerequisites: <span className="track-prereq-value">{metadata.prereq}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Link to={`/tracks/${track.track_id}`} className="track-btn-full">
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
