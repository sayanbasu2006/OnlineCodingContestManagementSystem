import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProblemById } from '../api/api';

interface Problem {
  problem_id: number;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  max_score: number;
}

export default function ProblemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    
    fetchProblemById(parseInt(id))
      .then(setProblem)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const difficultyClass = (d: string) => {
    if (d === 'EASY') return 'green';
    if (d === 'MEDIUM') return 'blue';
    return 'red';
  };

  if (loading) return <div className="content"><p>Loading problem...</p></div>;
  if (error) return <div className="content"><p className="red">{error}</p></div>;
  if (!problem) return <div className="content"><p>Problem not found</p></div>;

  return (
    <div className="problem-details">
      <div className="problem-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          ← Back
        </button>
        <h1>{problem.title}</h1>
        <div className="problem-meta">
          <span className={`badge ${difficultyClass(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
          <span className="max-score">Max Score: {problem.max_score}</span>
        </div>
      </div>

      <div className="problem-body">
        <h2>Problem Statement</h2>
        <div className="problem-description">
          {problem.description.split('\n').map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>
      </div>

      <div className="problem-actions">
        <button 
          onClick={() => navigate(`/submit?problem=${problem.problem_id}`)}
          className="btn-primary"
        >
          Submit Solution
        </button>
      </div>
    </div>
  );
}