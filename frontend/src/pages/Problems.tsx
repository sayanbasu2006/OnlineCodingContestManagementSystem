import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

export default function Problems() {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await api.get('/problems');
        setProblems(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  if (loading) return <div className="container page-wrapper">Loading problems...</div>;

  return (
    <div className="container page-wrapper">
      <h2 className="mb-8">Practice Problems</h2>

      <div className="table-wrapper">
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
            {problems.map(p => (
              <tr key={p.id}>
                <td>#{p.id}</td>
                <td style={{ fontWeight: 500 }}>{p.title}</td>
                <td>
                  <span className={`badge ${p.difficulty === 'Easy' ? 'badge-success' : p.difficulty === 'Medium' ? 'badge-warning' : 'badge-danger'}`}>
                    {p.difficulty}
                  </span>
                </td>
                <td>{p.max_score}</td>
                <td>
                  <Link to={`/problems/${p.id}`} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem' }}>View</Link>
                </td>
              </tr>
            ))}
            {problems.length === 0 && (
              <tr><td colSpan={5} className="text-center">No problems found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
