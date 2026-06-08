import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ArrowRight, Building2, GraduationCap } from 'lucide-react';

const Login = () => {
  const [searchParams] = useSearchParams();
  const [accountType, setAccountType] = useState(searchParams.get('type') === 'student' ? 'STUDENT' : 'INSTITUTE');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const tokenExpired = searchParams.get('expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setError('Email cannot be empty.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!trimmedPassword) {
      setError('Password cannot be empty.');
      return;
    }

    setSubmitting(true);

    try {
      const user = await login(trimmedEmail, trimmedPassword);
      if (accountType === 'INSTITUTE' && user.role !== 'ROLE_ADMIN' && user.role !== 'ROLE_SUPER_ADMIN') {
        logout();
        setError('Please use Student login for student accounts.');
        return;
      }

      if (accountType === 'STUDENT' && user.role !== 'ROLE_STUDENT') {
        logout();
        setError('Please use Institute login for institute accounts.');
        return;
      }

      if (user.role === 'ROLE_SUPER_ADMIN') {
        navigate('/super-admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container animate-fade">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Choose your workspace and sign in to StudentHub.
        </p>

        {tokenExpired && (
          <div className="custom-alert alert-warning">
            Session expired! Please login again.
          </div>
        )}

        {error && (
          <div className="custom-alert alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Login As</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setAccountType('INSTITUTE')}
                className={`btn ${accountType === 'INSTITUTE' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Building2 size={16} /> Institute
              </button>
              <button
                type="button"
                onClick={() => setAccountType('STUDENT')}
                className={`btn ${accountType === 'STUDENT' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <GraduationCap size={16} /> Student
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label btn-icon-align">
              <Mail size={14} /> Email Address
            </label>
            <input 
              type="email" 
              className="form-control" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={accountType === 'INSTITUTE' ? 'admin@institute.com' : 'student@example.com'} 
            />
          </div>

          <div className="form-group">
            <label className="form-label btn-icon-align">
              <Lock size={14} /> Password
            </label>
            <input 
              type="password" 
              className="form-control" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting} 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {submitting ? 'Authenticating...' : `Sign In as ${accountType === 'INSTITUTE' ? 'Institute' : 'Student'}`} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to={`/register?type=${accountType.toLowerCase()}`} style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
