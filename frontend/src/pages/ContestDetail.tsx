import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/api';

export default function ContestDetail() {
  const { id } = useParams();
  const [contest, setContest] = useState<any>(null);
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          api.get(`/contests/${id}`),
          api.get(`/contests/${id}/problems`).catch(() => ({ data: [] }))
        ]);
        setContest(cRes.data);
        setProblems(pRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleJoin = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setJoining(true);
    try {
      await api.post(`/submissions/participations`, { contest_id: Number(id) });
      setJoined(true);
      alert('Successfully joined the contest!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to join');
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <div className="container page-wrapper">Loading contest...</div>;
  if (!contest) return <div className="container page-wrapper">Contest not found.</div>;

  return (
    <div className="container page-wrapper">
      <div className="card mb-8">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2>{contest.title}</h2>
            <p>{contest.description}</p>
          </div>
          <span className={`badge ${contest.status === 'ONGOING' ? 'badge-success' : contest.status === 'UPCOMING' ? 'badge-warning' : 'badge-danger'}`}>
            {contest.status}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
          <div><strong>Starts:</strong> {new Date(contest.start_time).toLocaleString()}</div>
          <div><strong>Ends:</strong> {new Date(contest.end_time).toLocaleString()}</div>
        </div>
        <div style={{ marginTop: '1.5rem' }}>
          <button className="btn btn-primary" onClick={handleJoin} disabled={joining || joined || contest.status === 'ENDED'}>
            {joined ? 'Joined' : 'Join Contest'}
          </button>
        </div>
      </div>

      <h3>Contest Problems</h3>
      <div className="table-wrapper mt-4">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Difficulty</th>
              <th>Max Score</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {problems.length > 0 ? problems.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.title}</td>
                <td>
                  <span className={`badge ${p.difficulty === 'Easy' ? 'badge-success' : p.difficulty === 'Medium' ? 'badge-warning' : 'badge-danger'}`}>
                    {p.difficulty}
                  </span>
                </td>
                <td>{p.max_score}</td>
                <td>
                  <Link to={`/problems/${p.id}`} className="btn">Solve</Link>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="text-center">No problems found or you haven't joined yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
