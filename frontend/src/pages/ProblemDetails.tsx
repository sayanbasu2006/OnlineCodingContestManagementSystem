import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';

export default function ProblemDetails() {
  const { id } = useParams();
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await api.get(`/problems/${id}`);
        setProblem(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id]);

  if (loading) return <div className="container page-wrapper">Loading problem...</div>;
  if (!problem) return <div className="container page-wrapper">Problem not found.</div>;

  return (
    <div className="container page-wrapper">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>{problem.title}</h2>
          <span className={`badge ${problem.difficulty === 'Easy' ? 'badge-success' : problem.difficulty === 'Medium' ? 'badge-warning' : 'badge-danger'}`}>
            {problem.difficulty}
          </span>
        </div>
        
        <div style={{ whiteSpace: 'pre-wrap', marginBottom: '2rem', lineHeight: 1.6 }}>
          {problem.description}
        </div>

        {problem.author_id && (
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Author ID: {problem.author_id}</p>
        )}

        <div className="mt-4 flex gap-4">
          <Link to={`/submit/${problem.id}`} className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}>
            Submit Solution
          </Link>
          <button className="btn" onClick={() => window.history.back()}>Back</button>
        </div>
      </div>
    </div>
  );
}
