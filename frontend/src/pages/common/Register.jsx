import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { User, Mail, Lock, Phone, Book, Calendar, CheckCircle, ArrowRight, Building2, GraduationCap } from 'lucide-react';

const Register = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') === 'student' ? 'STUDENT' : 'INSTITUTE';
  const [accountType, setAccountType] = useState(initialType);
  const [institutes, setInstitutes] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    instituteName: '',
    instituteId: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    department: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const response = await API.get('/auth/institutes');
        setInstitutes(response.data);
      } catch (err) {
        setError('Unable to load institutes right now.');
      }
    };

    fetchInstitutes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // For phone field: only allow digits, max 10
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, phone: digitsOnly });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedFullName = formData.fullName.trim();
    const trimmedInstituteName = formData.instituteName.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedPassword = formData.password.trim();
    const trimmedConfirmPassword = formData.confirmPassword.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedDepartment = formData.department.trim();

    if (accountType === 'INSTITUTE' && !trimmedInstituteName) {
      setError('Institute Name cannot be empty.');
      return;
    }

    if (accountType === 'STUDENT' && !trimmedFullName) {
      setError('Name cannot be empty.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (trimmedPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (accountType === 'STUDENT') {
      if (!formData.instituteId) {
        setError('Please select an institute.');
        return;
      }
      if (!/^\d{10}$/.test(trimmedPhone)) {
        setError('Phone number must be exactly 10 digits!');
        return;
      }
      if (!trimmedDepartment) {
        setError('Please select a department.');
        return;
      }
    }

    setSubmitting(true);

    try {
      await register({
        fullName: accountType === 'INSTITUTE' ? trimmedInstituteName : trimmedFullName,
        instituteName: accountType === 'INSTITUTE' ? trimmedInstituteName : null,
        email: trimmedEmail,
        password: trimmedPassword,
        confirmPassword: trimmedConfirmPassword,
        phone: accountType === 'STUDENT' ? trimmedPhone : null,
        department: accountType === 'STUDENT' ? trimmedDepartment : null,
        accountType,
        instituteId: accountType === 'STUDENT' ? parseInt(formData.instituteId) : null
      });
      setSuccess(true);
      setTimeout(() => {
        navigate(`/login?type=${accountType.toLowerCase()}`);
      }, 3000);
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container animate-fade">
        <div className="auth-card" style={{ maxWidth: '520px' }}>
        <h2 className="auth-title">Create Account</h2>
        <p style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Register an institute workspace or join as a student.
        </p>

        {success && (
          <div className="custom-alert alert-success">
            <CheckCircle size={18} />
            <div>
              <strong>Registration successful!</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Redirecting to login page...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="custom-alert alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Account Type</label>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

            {accountType === 'INSTITUTE' && (
              <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                <label className="form-label btn-icon-align">
                  <Building2 size={14} /> Institute Name
                </label>
                <input
                  type="text"
                  name="instituteName"
                  className="form-control"
                  required
                  value={formData.instituteName}
                  onChange={handleChange}
                  placeholder="Your institute name"
                />
              </div>
            )}
            
            {accountType === 'STUDENT' && (
              <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                <label className="form-label btn-icon-align">
                  <User size={14} /> Full Name
                </label>
                <input 
                  type="text" 
                  name="fullName"
                  className="form-control" 
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe" 
                />
              </div>
            )}

            {accountType === 'STUDENT' && (
              <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                <label className="form-label btn-icon-align">
                  <Building2 size={14} /> Institute
                </label>
                <select
                  name="instituteId"
                  className="form-control"
                  required
                  value={formData.instituteId}
                  onChange={handleChange}
                >
                  <option value="">Select Institute</option>
                  {institutes.map(institute => (
                    <option key={institute.id} value={institute.id}>
                      {institute.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
              <label className="form-label btn-icon-align">
                <Mail size={14} /> Email Address
              </label>
              <input 
                type="email" 
                name="email"
                className="form-control" 
                required
                value={formData.email}
                onChange={handleChange}
                placeholder={accountType === 'INSTITUTE' ? 'admin@studenthub.com' : 'john@example.com'} 
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label btn-icon-align">
                <Lock size={14} /> Password
              </label>
              <input 
                type="password" 
                name="password"
                className="form-control" 
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters" 
                minLength={6}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label btn-icon-align">
                <Lock size={14} /> Confirm Password
              </label>
              <input 
                type="password" 
                name="confirmPassword"
                className="form-control" 
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password" 
                minLength={6}
              />
            </div>

            {accountType === 'STUDENT' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label btn-icon-align">
                <Phone size={14} /> Phone Number
              </label>
              <input 
                type="text" 
                name="phone"
                className="form-control" 
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit number (e.g. 9876543210)"
                maxLength={10}
                inputMode="numeric"
              />
              {formData.phone && formData.phone.length < 10 && (
                <small style={{ color: 'var(--warning, #f59e0b)', fontSize: '0.75rem' }}>
                  {10 - formData.phone.length} more digit{10 - formData.phone.length !== 1 ? 's' : ''} required
                </small>
              )}
              {formData.phone && formData.phone.length === 10 && (
                <small style={{ color: 'var(--success, #22c55e)', fontSize: '0.75rem' }}>
                  ✓ Valid phone number
                </small>
              )}
            </div>
            )}

            {accountType === 'STUDENT' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label btn-icon-align">
                <Book size={14} /> Department
              </label>
              <select 
                name="department"
                className="form-control" 
                required
                value={formData.department}
                onChange={handleChange}
              >
                <option value="">Select Dept</option>
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
              </select>
            </div>
            )}

          </div>

          <button 
            type="submit" 
            disabled={submitting || success} 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1.5rem' }}
          >
            {submitting ? 'Registering Account...' : `Sign Up as ${accountType === 'INSTITUTE' ? 'Institute' : 'Student'}`} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
