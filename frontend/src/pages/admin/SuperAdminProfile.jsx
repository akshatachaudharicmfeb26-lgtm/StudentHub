import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { User, Home, ArrowLeft, RefreshCw, Building2 } from 'lucide-react';

const SuperAdminProfile = () => {
  const { user, updateProfileState } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const triggerAlert = (type, msg) => {
    if (type === 'success') {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setError(msg);
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedFullName = formData.fullName.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedPassword = formData.password.trim();
    const trimmedConfirmPassword = formData.confirmPassword.trim();

    if (!trimmedFullName) {
      triggerAlert('error', 'Super Admin Name cannot be empty.');
      return;
    }

    if (!trimmedEmail) {
      triggerAlert('error', 'Email cannot be empty.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      triggerAlert('error', 'Please enter a valid email address.');
      return;
    }

    if (trimmedPassword) {
      if (trimmedPassword.length < 6) {
        triggerAlert('error', 'Password must be at least 6 characters.');
        return;
      }
      if (trimmedPassword !== trimmedConfirmPassword) {
        triggerAlert('error', 'Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      const response = await API.put('/super-admin/profile', {
        fullName: trimmedFullName,
        email: trimmedEmail,
        password: trimmedPassword || null
      });

      // Update AuthContext state
      updateProfileState(response.data);
      
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));

      triggerAlert('success', 'Profile updated successfully!');
    } catch (err) {
      triggerAlert('error', err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade dashboard-container">
      <div className="dashboard-header-block">
        <div>
          <h1>Super Admin Profile</h1>
          <p>Update your super admin credentials and security settings.</p>
        </div>
        <button 
          onClick={() => {
            setFormData({
              fullName: user?.fullName || '',
              email: user?.email || '',
              password: '',
              confirmPassword: ''
            });
            triggerAlert('success', 'Form values reset.');
          }} 
          className="btn btn-secondary btn-icon-align"
        >
          <RefreshCw size={15} /> Reset
        </button>
      </div>

      {successMsg && (
        <div className="custom-alert alert-success">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="custom-alert alert-danger">
          {error}
        </div>
      )}

      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="dashboard-sidebar glass">
          <Link to="/" className="sidebar-btn">
            <Home size={18} /> Back to Home
          </Link>
          <Link to="/super-admin" className="sidebar-btn">
            <Building2 size={18} /> Manage Institutes
          </Link>
          <button className="sidebar-btn active">
            <User size={18} /> Edit Profile
          </button>
        </aside>

        {/* Profile Content panel */}
        <main className="glass dashboard-main-content">
          <div className="animate-fade">
            <h2 style={{ marginBottom: '0.25rem' }}>Personal Identity & Access</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Ensure your system credentials remain secure and updated.
            </p>

            <form onSubmit={handleSaveProfile} className="profile-form">
              <div className="profile-grid">
                
                <div className="form-group">
                  <label className="form-label">Super Admin Name</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password (Optional)</label>
                  <input 
                    type="password" 
                    className="form-control"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Leave blank to keep current"
                    minLength={6}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input 
                    type="password" 
                    className="form-control"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Leave blank to keep current"
                  />
                </div>

              </div>

              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminProfile;
