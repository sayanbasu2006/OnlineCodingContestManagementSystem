import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { loginUser, fetchDashboardStats } from "../api/api";
import { useAuth } from "../App";
import { useToast } from "../components/Toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalContests: 0, totalUsers: 0, totalProblems: 0 });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (searchParams.get("expired") === "1") {
      showToast("Your session has expired. Please log in again.", "warning", 6000);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchDashboardStats()
      .then((res) => {
        if (res) {
          setStats({
            totalContests: res.totalContests || 0,
            totalUsers: res.totalUsers || 0,
            totalProblems: res.totalProblems || 0,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await loginUser(email, password);
      login(
        {
          user_id: data.user_id,
          username: data.username,
          email: data.email,
          role: data.role,
        },
        data.token
      );
      showToast(`Welcome back, ${data.username}!`, "success");
      navigate("/");
    } catch (err: any) {
      showToast(err.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* Dynamic/Atmospheric Code Background in top left */}
      <div className="login-bg-code">
        <pre>{`#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    while (contest_running) {
        solve();
        submit();
        climb_leaderboard();
    }
    
    return 0;
}`}
        </pre>
      </div>

      <div className="login-content-container">
        {/* Left column: Marketing and Stats */}
        <div className="login-marketing-side">
          <div className="login-brand-meta">
            <img src="/logo.png" alt="CodeArena" className="marketing-logo" />
            <div className="marketing-brand-text">
              <h2>CodeArena</h2>
              <span>CODE • COMPETE • CONQUER</span>
            </div>
          </div>

          <div className="marketing-headline-block">
            <h1>Step in. Code hard.</h1>
            <h1 className="highlight-text">Rise above all.</h1>
            <p>
              Join thousands of coders, compete in contests, solve challenges and climb the leaderboard.
            </p>
          </div>

          <div className="marketing-stats-grid">
            <div className="stat-item-box">
              <span className="stat-emoji">🏆</span>
              <h3>{stats.totalContests}+</h3>
              <p>Contests Every Month</p>
            </div>
            <div className="stat-item-box">
              <span className="stat-emoji">👥</span>
              <h3>{stats.totalUsers}+</h3>
              <p>Coders Competing</p>
            </div>
            <div className="stat-item-box">
              <span className="stat-emoji">⚡</span>
              <h3>{stats.totalProblems}+</h3>
              <p>Problems Available</p>
            </div>
          </div>

        </div>

        {/* Right column: Auth Card Form */}
        <div className="login-form-side">
          <div className="premium-auth-card">
            <div className="form-brand-header">
              <div className="form-logo-box">
                <img src="/logo.png" alt="Logo" className="form-inner-logo" />
              </div>
              <h2>Welcome Back, Coder! 👋</h2>
              <p>Sign in to continue your coding journey</p>
            </div>

            <form onSubmit={handleSubmit} className="premium-login-form">
              <div className="premium-form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-with-icon">
                  <svg className="input-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="premium-form-group">
                <label htmlFor="password">Password</label>
                <div className="input-with-icon">
                  <svg className="input-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <div className="form-action-row">
                <label className="checkbox-label">
                  <input type="checkbox" className="remember-me-check" />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" style={{ color: "#3b82f6", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
                  Forgot password?
                </Link>
              </div>

              <button type="submit" className="premium-btn-primary" disabled={loading}>
                {loading ? "🚀 Entering..." : "🚀 Enter Arena"}
              </button>
            </form>

            <div className="form-inner-footer">
              Don't have an account? <Link to="/register">Sign up</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-page-footer">
        <div className="footer-left">Secure. Fast. Reliable.</div>
        <div className="footer-center">© {new Date().getFullYear()} CodeArena. All rights reserved.</div>
        <div className="footer-right">Built for coders, by coders. 💙</div>
      </div>
    </div>
  );
}