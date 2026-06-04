import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/api";
import { useAuth } from "../App";
import { useToast } from "../components/Toast";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setLoading(true);

    try {
      const data = await registerUser(username, email, password);
      login(
        {
          user_id: data.user_id,
          username: data.username,
          email: data.email,
          role: data.role,
          display_name: data.display_name,
          bio: data.bio,
          avatar_url: data.avatar_url,
        },
        data.token
      );
      showToast("Account created successfully!", "success");
      navigate("/");
    } catch (err: any) {
      showToast(err.message || "Registration failed", "error");
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


        </div>

        {/* Right column: Auth Card Form */}
        <div className="login-form-side">
          <div className="premium-auth-card">
            <div className="form-brand-header">
              <div className="form-logo-box">
                <img src="/logo.png" alt="Logo" className="form-inner-logo" />
              </div>
              <h2>Create Account 🚀</h2>
              <p>Join the CodeArena today</p>
            </div>

            <form onSubmit={handleSubmit} className="premium-login-form">
              <div className="premium-form-group">
                <label htmlFor="username">Username</label>
                <div className="input-with-icon">
                  <svg className="input-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    required
                  />
                </div>
              </div>

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
                    placeholder="Create a password"
                    required
                  />
                </div>
              </div>

              <div className="premium-form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-with-icon">
                  <svg className="input-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="premium-btn-primary" disabled={loading}>
                {loading ? "🚀 Creating account..." : "🚀 Sign Up"}
              </button>
            </form>

            <div className="form-inner-footer">
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-page-footer">
        <div className="footer-center">© {new Date().getFullYear()} CodeArena. All rights reserved.</div>
      </div>
    </div>
  );
}