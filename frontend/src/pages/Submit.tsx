import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchProblems, fetchContests, submitSolution, fetchParticipations } from '../api/api';

interface Problem {
  problem_id: number;
  title: string;
  difficulty: string;
}

interface Contest {
  contest_id: number;
  title: string;
  status: string;
}

export default function Submit() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [problems, setProblems] = useState<Problem[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [participations, setParticipations] = useState<number[]>([]);
  
  const [selectedContest, setSelectedContest] = useState<number>(0);
  const [selectedProblem, setSelectedProblem] = useState<number>(0);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const problemId = searchParams.get('problem');
    const contestId = searchParams.get('contest');

    Promise.all([
      fetchProblems(),
      fetchContests(),
      fetchParticipations()
    ])
      .then(([problemsData, contestsData, participationsData]) => {
        setProblems(problemsData);
        // Only show ONGOING contests
        const ongoingContests = contestsData.filter((c: Contest) => c.status === 'ONGOING');
        setContests(ongoingContests);
        
        // Extract contest IDs that user has joined
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userParticipations = participationsData
          .filter((p: any) => p.user_id === user.user_id)
          .map((p: any) => p.contest_id);
        setParticipations(userParticipations);

        if (problemId) setSelectedProblem(parseInt(problemId));
        if (contestId) setSelectedContest(parseInt(contestId));
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedContest || !selectedProblem) {
      setError('Please select both a contest and a problem');
      return;
    }

    if (!code.trim()) {
      setError('Please enter your code');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to submit');
      navigate('/login');
      return;
    }

    setSubmitting(true);

    try {
      const result = await submitSolution(selectedContest, selectedProblem, code, language);
      setSuccess(`Solution submitted successfully! Score: ${result.score}`);
      setCode('');
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="content"><p>Loading...</p></div>;

  const joinedContests = contests.filter(c => participations.includes(c.contest_id));

  return (
    <div className="submit-page">
      <h1>Submit Solution</h1>

      <form onSubmit={handleSubmit} className="submit-form">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="contest">Contest</label>
            <select
              id="contest"
              value={selectedContest}
              onChange={(e) => setSelectedContest(parseInt(e.target.value))}
              required
            >
              <option value={0}>Select a contest</option>
              {joinedContests.length === 0 ? (
                <option disabled>No joined contests available</option>
              ) : (
                joinedContests.map((c) => (
                  <option key={c.contest_id} value={c.contest_id}>
                    {c.title}
                  </option>
                ))
              )}
            </select>
            {joinedContests.length === 0 && (
              <small className="hint">You must join a contest first</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="problem">Problem</label>
            <select
              id="problem"
              value={selectedProblem}
              onChange={(e) => setSelectedProblem(parseInt(e.target.value))}
              required
            >
              <option value={0}>Select a problem</option>
              {problems.map((p) => (
                <option key={p.problem_id} value={p.problem_id}>
                  {p.title} ({p.difficulty})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="language">Language</label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="code">Code</label>
          <textarea
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            rows={20}
            required
          />
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            className="btn-secondary"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Solution'}
          </button>
        </div>
      </form>
    </div>
  );
}