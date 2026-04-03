import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Medal } from 'lucide-react';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/leaderboard');
        setLeaders(res.data.leaderboard);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return <div className="container page-wrapper">Loading leaderboard...</div>;

  return (
    <div className="container page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem' }}>
        <Medal size={32} color="var(--warning)" />
        <h2 style={{ margin: 0 }}>Global Leaderboard</h2>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Total Score</th>
            </tr>
          </thead>
          <tbody>
            {leaders.length > 0 ? leaders.map((leader, index) => (
              <tr key={leader.user_id}>
                <td style={{ fontWeight: 'bold', color: index < 3 ? 'var(--warning)' : 'inherit' }}>#{index + 1}</td>
                <td>{leader.username}</td>
                <td style={{ fontWeight: 'bold' }}>{leader.total_score}</td>
              </tr>
            )) : (
              <tr><td colSpan={3} className="text-center">No scores yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
