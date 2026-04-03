import React, { useEffect, useState } from 'react';
import api from '../api/api';

export default function MySubmissions() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await api.get('/submissions');
        setSubmissions(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  if (loading) return <div className="container page-wrapper">Loading submissions...</div>;

  return (
    <div className="container page-wrapper">
      <h2 className="mb-8">My Submissions</h2>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Problem ID</th>
              <th>Language</th>
              <th>Status</th>
              <th>Score</th>
              <th>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map(s => (
              <tr key={s.id}>
                <td>#{s.id}</td>
                <td>{s.problem_id}</td>
                <td style={{ textTransform: 'capitalize' }}>{s.language}</td>
                <td>
                  <span className={`badge ${
                    s.status === 'Accepted' ? 'badge-success' : 
                    s.status === 'Evaluating' ? 'badge-warning' : 
                    'badge-danger'
                  }`}>
                    {s.status}
                  </span>
                </td>
                <td>{s.score}</td>
                <td>{new Date(s.timestamp).toLocaleString()}</td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr><td colSpan={6} className="text-center">You haven't made any submissions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
