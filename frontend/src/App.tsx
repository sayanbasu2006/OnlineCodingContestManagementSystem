import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';

// Lazy loading pages or import them directly
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Contests from './pages/Contests';
import ContestDetail from './pages/ContestDetail';
import Problems from './pages/Problems';
import ProblemDetails from './pages/ProblemDetails';
import Submit from './pages/Submit';
import MySubmissions from './pages/MySubmissions';

const Home = () => {
  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '10vh' }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem', background: 'linear-gradient(to right, #6366f1, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Welcome to CodeArena
      </h1>
      <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
        The ultimate platform for competitive programming. Compete in contests, solve algorithmic problems, and climb the global leaderboard.
      </p>
      <div className="flex" style={{ gap: '1rem', justifyContent: 'center' }}>
        <a href="/contests" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}>View Contests</a>
        <a href="/problems" className="btn" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}>Practice Problems</a>
      </div>
    </div>
  );
};

// Simple PrivateRoute wrapper
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Navbar />
      <div className="page-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          
          <Route path="/contests" element={<Contests />} />
          <Route path="/contests/:id" element={<ContestDetail />} />
          
          <Route path="/problems" element={<Problems />} />
          <Route path="/problems/:id" element={<ProblemDetails />} />
          
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/submit/:problemId" element={<PrivateRoute><Submit /></PrivateRoute>} />
          <Route path="/my-submissions" element={<PrivateRoute><MySubmissions /></PrivateRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
