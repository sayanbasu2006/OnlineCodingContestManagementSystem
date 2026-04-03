import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';

export default function Submit() {
  const { problemId } = useParams();
  const [code, setCode] = useState('// Write your solution here\n');
  const [language, setLanguage] = useState('python');
  const [problem, setProblem] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await api.get(`/problems/${problemId}`);
        setProblem(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProblem();
  }, [problemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/submissions', {
        problem_id: Number(problemId),
        code,
        language
      });
      alert('Solution submitted successfully!');
      navigate('/my-submissions');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit solution');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page-wrapper">
      <div className="card">
        <h2 className="mb-4">Submit Solution {problem && `- ${problem.title}`}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Language</label>
            <select 
              className="form-input" 
              value={language} 
              onChange={e => setLanguage(e.target.value)}
              style={{ maxWidth: '200px' }}
            >
              <option value="python">Python 3</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Source Code</label>
            <textarea 
              className="code-editor"
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck="false"
              required
            ></textarea>
          </div>

          <div className="flex gap-4">
            <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2rem' }} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Submissions'}
            </button>
            <button type="button" className="btn" onClick={() => window.history.back()}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
