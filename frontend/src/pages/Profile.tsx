import { useState, useEffect } from "react";
import { useAuth } from "../App";
import { useToast } from "../components/Toast";
import { getCurrentUser, updateProfile, changePassword, fetchSubmissions, fetchParticipations, fetchUserBadges } from "../api/api";

export default function Profile() {
  const { user, login } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ contestsJoined: 0, totalSubmissions: 0, totalScore: 0 });
  const [badges, setBadges] = useState<{badge_name: string; earned_at: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  
  // Edit Profile fields
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newBio, setNewBio] = useState("");
  const [newAvatarUrl, setNewAvatarUrl] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Password fields
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getCurrentUser(), 
      fetchParticipations({ user_id: user.user_id }), 
      fetchSubmissions({ user_id: user.user_id }),
      fetchUserBadges(user.user_id)
    ])
      .then(([profileData, participations, subsRes, badgesData]) => {
        setProfile(profileData);
        setNewUsername(profileData.username);
        setNewEmail(profileData.email);
        setNewDisplayName(profileData.display_name || "");
        setNewBio(profileData.bio || "");
        setNewAvatarUrl(profileData.avatar_url || "");
        const submissions = subsRes.data || subsRes;
        const totalScore = submissions.reduce((sum: number, s: any) => sum + (s.score || 0), 0);
        setStats({ contestsJoined: participations.length, totalSubmissions: submissions.length, totalScore });
        setBadges(badgesData || []);
      }).catch(() => showToast("Failed to load profile", "error")).finally(() => setLoading(false));
  }, [user, showToast]);

  // Keep form fields synced when edit starts or profile updates
  useEffect(() => {
    if (profile) {
      setNewUsername(profile.username || "");
      setNewEmail(profile.email || "");
      setNewDisplayName(profile.display_name || "");
      setNewBio(profile.bio || "");
      setNewAvatarUrl(profile.avatar_url || "");
    }
  }, [editingProfile, profile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        showToast("Image size must be less than 1MB", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setSavingProfile(true);
    try {
      await updateProfile({ 
        username: newUsername, 
        email: newEmail,
        display_name: newDisplayName,
        bio: newBio,
        avatar_url: newAvatarUrl
      });
      
      // Update local profile state
      setProfile((prev: any) => ({
        ...prev,
        username: newUsername,
        email: newEmail,
        display_name: newDisplayName,
        bio: newBio,
        avatar_url: newAvatarUrl
      }));

      // Update Auth context
      const token = localStorage.getItem("token") || "";
      login({ 
        ...user!, 
        username: newUsername, 
        email: newEmail,
        display_name: newDisplayName,
        bio: newBio,
        avatar_url: newAvatarUrl
      }, token);
      
      showToast("Profile updated!", "success"); 
      setEditingProfile(false);
    } catch (err: any) { 
      showToast(err.message, "error"); 
    } finally { 
      setSavingProfile(false); 
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) { showToast("Passwords do not match", "error"); return; }
    if (newPwd.length < 6) { showToast("Password must be at least 6 characters", "error"); return; }
    setSavingPwd(true);
    try {
      await changePassword(currentPwd, newPwd);
      showToast("Password changed!", "success"); setShowPasswordForm(false); setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    } catch (err: any) { showToast(err.message, "error"); } finally { setSavingPwd(false); }
  };

  if (loading) return <div className="skeleton-block" />;
  if (!profile) return <p>Failed to load profile.</p>;

  return (
    <div className="profile-page">
      <h1>👤 My Profile</h1>
      <div className="profile-grid">
        <div className="profile-card">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" className="profile-avatar-img" />
          ) : (
            <div className="profile-avatar-large">
              {(profile.display_name || profile.username).charAt(0).toUpperCase()}
            </div>
          )}
          <h2>{profile.display_name || profile.username}</h2>
          {profile.display_name && <p className="profile-username">@{profile.username}</p>}
          <p className="profile-email">{profile.email}</p>
          <span className={`role-badge ${profile.role === "ADMIN" ? "role-admin" : "role-user"}`}>{profile.role}</span>
          
          {profile.bio ? (
            <p className="profile-bio">{profile.bio}</p>
          ) : (
            <p className="profile-bio" style={{ fontStyle: "italic", opacity: 0.6 }}>No bio written yet.</p>
          )}

          <p className="profile-joined">Joined {new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
          {profile.rating && <p className="profile-joined" style={{marginTop: 5}}><strong>Rating:</strong> {profile.rating}</p>}
          <div className="profile-actions">
            <button className="btn-small btn-outline" onClick={() => setEditingProfile(!editingProfile)}>✏️ Edit Profile</button>
            <button className="btn-small btn-outline" onClick={() => setShowPasswordForm(!showPasswordForm)}>🔑 Change Password</button>
          </div>
        </div>
        <div className="profile-stats-card">
          <h3>📊 Your Statistics</h3>
          <div className="profile-stats-grid">
            <div className="profile-stat"><span className="profile-stat-value">{stats.contestsJoined}</span><span className="profile-stat-label">Contests Joined</span></div>
            <div className="profile-stat"><span className="profile-stat-value">{stats.totalSubmissions}</span><span className="profile-stat-label">Submissions</span></div>
            <div className="profile-stat"><span className="profile-stat-value green">{stats.totalScore}</span><span className="profile-stat-label">Total Score</span></div>
          </div>
          
          <h3 style={{marginTop: '30px'}}>🎖️ Achievements & Badges</h3>
          <div className="badges-grid" style={{display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px'}}>
            {badges.length === 0 ? <p className="text-muted">No badges earned yet. Keep coding!</p> : 
              badges.map((b, i) => (
                <div key={i} className="badge-item" style={{background: 'var(--bg-highlight)', padding: '10px 15px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center'}}>
                  <div style={{fontSize: '24px', marginBottom: '5px'}}>🏆</div>
                  <div style={{fontWeight: 600, fontSize: '14px'}}>{b.badge_name}</div>
                  <div style={{fontSize: '11px', color: 'var(--text-muted)'}}>{new Date(b.earned_at).toLocaleDateString()}</div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
      {editingProfile && (
        <div className="profile-form-section">
          <h3>✏️ Edit Profile</h3>
          <form onSubmit={handleUpdateProfile} className="profile-form">
            <div className="form-group">
              <label>Profile Picture</label>
              <div className="avatar-edit-preview-row">
                <div className="avatar-preview-box">
                  {newAvatarUrl ? (
                    <img src={newAvatarUrl} alt="Preview" />
                  ) : (
                    <div className="avatar-preview-fallback">
                      {(newDisplayName || newUsername || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="avatar-upload-btn" style={{ display: 'inline-block', textAlign: 'center' }}>
                    Upload Photo
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      style={{ display: "none" }} 
                    />
                  </label>
                  {newAvatarUrl && (
                    <button 
                      type="button" 
                      className="btn-small btn-outline" 
                      onClick={() => setNewAvatarUrl("")}
                      style={{ padding: '6px 12px', border: '1px solid #ef4444', color: '#ef4444', background: 'transparent' }}
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>
              <span className="form-hint" style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginTop: '4px' }}>
                JPG, PNG or GIF. Max size 1MB.
              </span>
            </div>

            <div className="form-group">
              <label>Display Name</label>
              <input 
                type="text" 
                value={newDisplayName} 
                onChange={(e) => setNewDisplayName(e.target.value)} 
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input 
                type="text" 
                value={newUsername} 
                onChange={(e) => setNewUsername(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={newEmail} 
                onChange={(e) => setNewEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Bio / Description</label>
              <textarea 
                value={newBio} 
                onChange={(e) => setNewBio(e.target.value)} 
                placeholder="Tell us about yourself, programming interests, etc..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-2)',
                  color: 'var(--text)',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setEditingProfile(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={savingProfile}>
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
      {showPasswordForm && (
        <div className="profile-form-section"><h3>🔑 Change Password</h3>
          <form onSubmit={handleChangePassword} className="profile-form">
            <div className="form-group"><label>Current Password</label><input type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} required /></div>
            <div className="form-group"><label>New Password</label><input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} required /></div>
            <div className="form-group"><label>Confirm New Password</label><input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} required /></div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowPasswordForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={savingPwd}>{savingPwd ? "Changing..." : "Change Password"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
