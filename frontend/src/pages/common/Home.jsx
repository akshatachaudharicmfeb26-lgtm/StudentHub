import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldAlert, Award, ArrowRight, Building2, GraduationCap, Lock, Mail, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import heroBg from '../../assets/hero.png';

const Home = () => {
  const { user, login, logout } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [accountType, setAccountType] = useState('INSTITUTE');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setShowLoginPrompt(false);
      return undefined;
    }

    const timer = setTimeout(() => {
      setShowLoginPrompt(true);
    }, 3500);

    return () => clearTimeout(timer);
  }, [user]);

  const handlePopupLogin = async (e) => {
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
      const loggedInUser = await login(trimmedEmail, trimmedPassword);
      if (accountType === 'INSTITUTE' && loggedInUser.role !== 'ROLE_ADMIN') {
        logout();
        setError('Please use Student login for student accounts.');
        return;
      }

      if (accountType === 'STUDENT' && loggedInUser.role !== 'ROLE_STUDENT') {
        logout();
        setError('Please use Institute login for institute accounts.');
        return;
      }

      setShowLoginPrompt(false);
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="home-container animate-fade">
      
      {/* Hero Section */}
      <section className="hero-section hero-section-image" style={{ '--hero-bg': `url(${heroBg})` }}>
        
        <h1 className="hero-title">
          Welcome to the Next-Gen <br />
          <span>StudentHub</span> Portal
        </h1>
        <p className="hero-subtitle">
          Connect students with faculty, enroll in industry-vetted courses, update academic progress, and manage administrative workflows in one unified, modern workspace.
        </p>

        <div className="hero-cta-group">
          {user ? (
            <Link to={user.role === 'ROLE_ADMIN' ? '/admin' : '/student'} className="btn btn-primary">
              Go to Your Panel <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary">
                Get Started <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Login Here
              </Link>
            </>
          )}
        </div>
      </section>

      {!user && showLoginPrompt && (
        <div className="modal-overlay">
          <div className="modal-content home-login-modal">
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Login to Continue</h3>
                <p style={{ marginTop: '0.25rem' }}>Choose your account type and sign in.</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowLoginPrompt(false)}
                aria-label="Close login popup"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="custom-alert alert-danger">
                {error}
              </div>
            )}

            <form onSubmit={handlePopupLogin}>
              <div className="form-group">
                <label className="form-label">Login As</label>
                <div className="home-login-type-grid">
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
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                {submitting ? 'Signing in...' : 'Sign In'} <ArrowRight size={16} />
              </button>
            </form>

            <div className="home-login-register-link">
              New here? <Link to={`/register?type=${accountType.toLowerCase()}`}>Create an account</Link>
            </div>
          </div>
        </div>
      )}

      {/* Feature Cards Grid */}
      <section className="features-section">
        <h2>Empowering Academic Growth</h2>
        <p className="features-subtitle">
          Discover the features designed to streamline administration and learning.
        </p>

        <div className="features-grid">
          
          <div className="glass glass-hover feature-card">
            <div className="feature-icon-box feature-icon-cyan">
              <BookOpen size={24} />
            </div>
            <h3>Dynamic Course Catalog</h3>
            <p>
              Browse courses, view duration details, study contents, and track enrollment progression under active student panels.
            </p>
          </div>

          <div className="glass glass-hover feature-card">
            <div className="feature-icon-box feature-icon-indigo">
              <ShieldAlert size={24} />
            </div>
            <h3>Faculty Controls</h3>
            <p>
              Provide faculty with comprehensive administrative powers to build catalogs, track enrollments, and manage student accounts seamlessly.
            </p>
          </div>

          <div className="glass glass-hover feature-card">
            <div className="feature-icon-box feature-icon-pink">
              <Award size={24} />
            </div>
            <h3>Progress Tracking</h3>
            <p>
              Allow students to mark courses as completed or in progress, providing immediate feedback on their study journey.
            </p>
          </div>

        </div>
      </section>
      
    </div>
  );
};

export default Home;
