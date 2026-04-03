import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Activity, Trophy, Code2 } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  let user: any = {};
  try {
    const userStr = localStorage.getItem('user');
    user = userStr && userStr !== 'undefined' ? JSON.parse(userStr) : {};
  } catch (e) {}

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="container" style={{ marginTop: '2rem' }}>Loading dashboard...</div>;

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>Dashboard</h2>
      <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>Welcome back, {user.username} ({user.role})</p>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '1rem', borderRadius: '50%' }}>
              <Activity color="var(--primary)" size={24} />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.users_count}</div>
              <div style={{ color: 'var(--text-muted)' }}>Active Users</div>
            </div>
          </div>
          
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(34, 211, 238, 0.2)', padding: '1rem', borderRadius: '50%' }}>
              <Trophy color="var(--accent)" size={24} />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.contests_count}</div>
              <div style={{ color: 'var(--text-muted)' }}>Contests Hosted</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '50%' }}>
              <Code2 color="var(--success)" size={24} />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.submissions_count}</div>
              <div style={{ color: 'var(--text-muted)' }}>Total Submissions</div>
            </div>
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '2rem' }}>
        <a href="/my-submissions" className="btn btn-primary">View My Submissions</a>
      </div>
    </div>
  );
}
