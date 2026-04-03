import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { Calendar } from 'lucide-react';

export default function Contests() {
  const [contests, setContests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await api.get('/contests');
        setContests(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  if (loading) return <div className="container page-wrapper">Loading contests...</div>;

  return (
    <div className="container page-wrapper">
      <h2 className="mb-8">All Contests</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {contests.length > 0 ? contests.map(c => (
          <div key={c.id} className="card flex-col justify-between">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>{c.title}</h3>
                <span className={`badge ${c.status === 'ONGOING' ? 'badge-success' : c.status === 'UPCOMING' ? 'badge-warning' : 'badge-danger'}`}>
                  {c.status}
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{c.description}</p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <Calendar size={14} />
                <span>Starts: {new Date(c.start_time).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <Calendar size={14} />
                <span>Ends: {new Date(c.end_time).toLocaleString()}</span>
              </div>
            </div>
            <Link to={`/contests/${c.id}`} className="btn btn-primary mt-4" style={{ width: '100%' }}>
              View Details
            </Link>
          </div>
        )) : (
          <p>No contests found.</p>
        )}
      </div>
    </div>
  );
}
