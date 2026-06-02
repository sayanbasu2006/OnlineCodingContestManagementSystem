import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPassword, resetPassword } from "../api/api";
import { useToast } from "../components/Toast";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();



  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast("Email is required", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setOtp(res.token);
      showToast("Verification code generated!", "success");
      setStep(2);
    } catch (err: any) {
      showToast(err.message || "Failed to initiate password reset", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredOtp) {
      showToast("Verification code is required", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }
    setLoading(true);
    try {
      await resetPassword({
        email,
        token: enteredOtp,
        newPassword,
      });
      showToast("Password reset successfully! Please log in.", "success");
      navigate("/login");
    } catch (err: any) {
      showToast(err.message || "Failed to reset password", "error");
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
              <h2>Reset Password 🔑</h2>
              <p>Follow the steps to recover your account</p>
            </div>

            {step === 1 ? (
              <form onSubmit={handleRequestOtp} className="premium-login-form">
                <p style={{ color: "#64748b", fontSize: "13.5px", marginBottom: "1.5rem", textAlign: "center", lineHeight: "1.5" }}>
                  Enter your email address below, and we will generate a verification code to reset your password.
                </p>
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

                <button type="submit" className="premium-btn-primary" disabled={loading}>
                  {loading ? "Generating Code..." : "Get Verification Code"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="premium-login-form">
                {otp && (
                  <div className="forgot-otp-info" style={{ background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.2)", padding: "12px", borderRadius: "12px", marginBottom: "12px", textAlign: "center" }}>
                    <p style={{ fontSize: "12px", margin: "0 0 8px 0", color: "#94a3b8" }}>🔑 <strong>Developer/Testing Notice:</strong> OTP Code generated:</p>
                    <div className="forgot-otp-code" style={{ fontFamily: "monospace", fontSize: "20px", fontWeight: "bold", color: "#3b82f6", letterSpacing: "2px" }}>{otp}</div>
                  </div>
                )}

                <div className="premium-form-group">
                  <label htmlFor="otp">Verification Code</label>
                  <div className="input-with-icon">
                    <svg className="input-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input
                      type="text"
                      id="otp"
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      placeholder="Enter the 6-digit code above"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <div className="premium-form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <div className="input-with-icon">
                    <svg className="input-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                </div>

                <div className="premium-form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
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
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="premium-btn-primary" disabled={loading}>
                  {loading ? "Resetting Password..." : "Reset Password"}
                </button>

                <button type="button" className="premium-btn-secondary" onClick={() => setStep(1)} style={{ padding: "12px 24px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(15, 23, 42, 0.4)", color: "#94a3b8", cursor: "pointer", fontWeight: 600 }}>
                  ← Back
                </button>
              </form>
            )}

            <div className="form-inner-footer" style={{ marginTop: "1.5rem" }}>
              Remembered your password? <Link to="/login">Sign in</Link>
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
