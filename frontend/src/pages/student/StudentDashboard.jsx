import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, BookOpenCheck, User, Search, ChevronLeft, ChevronRight, X, 
  CheckCircle, Play, Info, Save, GraduationCap, Home
} from 'lucide-react';

const StudentDashboard = () => {
  const { user, updateProfileState } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    location.pathname === '/profile' ? 'profile' : 'browse'
  );

  useEffect(() => {
    if (location.pathname === '/profile') {
      setActiveTab('profile');
    } else if (location.pathname === '/student') {
      setActiveTab('browse');
    }
  }, [location.pathname]);

  
  // Profile state
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    password: '',
    confirmPassword: ''
  });

  // Course discovery state
  const [courses, setCourses] = useState([]);
  const [courseSearch, setCourseSearch] = useState('');
  const [coursePage, setCoursePage] = useState(0);
  const [courseTotalPages, setCourseTotalPages] = useState(0);

  // Student enrollments state
  const [enrollments, setEnrollments] = useState([]);

  // Syllabus / Study Content modal
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user && user.studentId) {
      fetchProfile();
      fetchStudentEnrollments();
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'browse') {
      fetchAvailableCourses(coursePage, courseSearch);
    } else if (activeTab === 'enrolled') {
      fetchStudentEnrollments();
    }
  }, [activeTab, coursePage, courseSearch]);

  const triggerAlert = (type, msg) => {
    if (type === 'success') {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setError(msg);
      setTimeout(() => setError(''), 4000);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await API.get(`/students/${user.studentId}`);
      setProfile({
        ...response.data,
        password: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error("Error retrieving profile details", err);
    }
  };

  const fetchAvailableCourses = async (page, searchVal) => {
    setLoading(true);
    try {
      const response = await API.get('/courses', {
        params: { page, size: 6, search: searchVal }
      });
      setCourses(response.data.content);
      setCourseTotalPages(response.data.totalPages);
    } catch (err) {
      triggerAlert('error', 'Error loading course catalog.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentEnrollments = async () => {
    if (!user?.studentId) return;
    setLoading(true);
    try {
      const response = await API.get(`/enrollments/student/${user.studentId}`);
      setEnrollments(response.data);
    } catch (err) {
      triggerAlert('error', 'Error loading your enrollments.');
    } finally {
      setLoading(false);
    }
  };

  // Enroll in a course
  const handleEnroll = async (courseId) => {
    try {
      await API.post('/enrollments', null, {
        params: { studentId: user.studentId, courseId }
      });
      triggerAlert('success', 'Successfully enrolled in course!');
      fetchStudentEnrollments();
    } catch (err) {
      triggerAlert('error', err.response?.data?.message || 'Failed to enroll.');
    }
  };

  // Check if student is already enrolled in a specific course
  const isEnrolled = (courseId) => {
    return enrollments.some(e => e.courseId === courseId);
  };

  // Update Progress / Completion
  const handleToggleComplete = async (enrollmentId, currentStatus) => {
    const nextStatus = currentStatus === 'ENROLLED' ? 'COMPLETED' : 'ENROLLED';
    try {
      await API.put(`/enrollments/${enrollmentId}/status`, null, {
        params: { status: nextStatus }
      });
      triggerAlert('success', nextStatus === 'COMPLETED' ? 'Course marked as completed! Good job!' : 'Course progress reset.');
      fetchStudentEnrollments();
    } catch (err) {
      triggerAlert('error', 'Failed to update progress.');
    }
  };

  // Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedFullName = profile.fullName.trim();
    const trimmedPhone = (profile.phone || '').trim();
    const trimmedPassword = (profile.password || '').trim();
    const trimmedConfirmPassword = (profile.confirmPassword || '').trim();

    if (!trimmedFullName) {
      triggerAlert('error', 'Full Name cannot be empty.');
      return;
    }

    if (!/^\d{10}$/.test(trimmedPhone)) {
      triggerAlert('error', 'Phone number must be exactly 10 digits!');
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

    try {
      const response = await API.put(`/students/${user.studentId}`, {
        ...profile,
        fullName: trimmedFullName,
        phone: trimmedPhone,
        password: trimmedPassword || null
      });
      setProfile({
        ...response.data,
        password: '',
        confirmPassword: ''
      });
      updateProfileState(response.data); // Update AuthContext state
      triggerAlert('success', 'Profile updated successfully!');
    } catch (err) {
      triggerAlert('error', err.response?.data?.message || 'Failed to update profile details.');
    }
  };

  return (
    <div className="animate-fade dashboard-container">
      
      {/* Dashboard Title banner */}
      <div className="dashboard-header-block">
        <div>
          <h1>Student Dashboard</h1>
          <p>Browse the catalog, register for new modules, and check your coursework.</p>
        </div>
        <div className="glass dashboard-profile-summary">
          <GraduationCap size={20} color="var(--secondary)" />
          <span>
            {profile.fullName}
          </span>
        </div>
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
          <button 
            className={`sidebar-btn ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => { setActiveTab('browse'); setCoursePage(0); }}
          >
            <BookOpen size={18} /> Browse Catalog
          </button>
          <button 
            className={`sidebar-btn ${activeTab === 'enrolled' ? 'active' : ''}`}
            onClick={() => { setActiveTab('enrolled'); }}
          >
            <BookOpenCheck size={18} /> My Courses ({enrollments.length})
          </button>
          <button 
            className={`sidebar-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => { setActiveTab('profile'); }}
          >
            <User size={18} /> Edit Profile
          </button>
        </aside>

        {/* Workspace Display Area */}
        <main className="glass dashboard-main-content">
          
          {/* Tab 1: Browse Available Courses */}
          {activeTab === 'browse' && (
            <div className="animate-fade">
              <h2>Course Catalog</h2>
              <p style={{ marginBottom: '1.5rem' }}>Explore available academic modules. Click enroll to add a course to your curriculum.</p>

              <div className="search-bar-container">
                <div className="search-input-wrapper">
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="Search by keywords, author name, or content..."
                    value={courseSearch}
                    onChange={(e) => { setCourseSearch(e.target.value); setCoursePage(0); }}
                  />
                </div>
              </div>

              {loading ? (
                <p style={{ color: 'var(--text-muted)' }}>Updating catalog...</p>
              ) : courses.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No courses matching your search keyword were found.</p>
              ) : (
                <>
                  <div className="course-grid">
                    {courses.map(course => (
                      <div className="glass course-card animate-fade" key={course.courseId}>
                        <div className="course-header">
                          <span className="course-badge">{course.duration}</span>
                        </div>
                        <div className="course-body">
                          <h3 className="course-title">{course.courseName}</h3>
                          <p className="course-instructor">By {course.instructorName}</p>
                          <p className="course-desc">{course.description || 'No summary description provided.'}</p>
                        </div>
                        <div className="course-footer">
                          {isEnrolled(course.courseId) ? (
                            <button disabled className="btn btn-secondary btn-sm" style={{ width: '100%', opacity: 0.6 }}>
                              Already Enrolled
                            </button>
                          ) : (
                            <button onClick={() => handleEnroll(course.courseId)} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                              Register Course
                            </button>
                          )}
                          <button onClick={() => setSelectedCourse(course)} className="btn btn-secondary btn-sm" title="View Syllabus Details">
                            <Info size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {courseTotalPages > 1 && (
                    <div className="pagination-container">
                      <button 
                        disabled={coursePage === 0} 
                        onClick={() => setCoursePage(prev => prev - 1)}
                        className="btn btn-secondary btn-sm btn-icon-align"
                      >
                        <ChevronLeft size={16} /> Prev
                      </button>
                      <span className="pagination-text">
                        Page {coursePage + 1} of {courseTotalPages}
                      </span>
                      <button 
                        disabled={coursePage === courseTotalPages - 1} 
                        onClick={() => setCoursePage(prev => prev + 1)}
                        className="btn btn-secondary btn-sm btn-icon-align"
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Tab 2: Enrolled Courses */}
          {activeTab === 'enrolled' && (
            <div className="animate-fade">
              <h2>My Study Tracks</h2>
              <p style={{ marginBottom: '2rem' }}>Access details of registered courses and track your curriculum completions.</p>

              {loading ? (
                <p style={{ color: 'var(--text-muted)' }}>Retrieving your enrollments...</p>
              ) : enrollments.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>You are not registered in any courses yet. Go to catalog to enroll!</p>
              ) : (
                <div className="course-grid">
                  {enrollments.map(enroll => (
                    <div className={`glass course-card ${enroll.status === 'COMPLETED' ? 'completed' : 'enrolled'}`} key={enroll.enrollmentId}>
                      <div className="course-header">
                        <span className={`badge ${enroll.status === 'COMPLETED' ? 'badge-success' : 'badge-primary'}`}>
                          {enroll.status}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Registered: {new Date(enroll.enrollmentDate).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="course-body">
                        <h3 className="course-title">{enroll.courseName}</h3>
                      </div>

                      <div className="course-footer">
                        <button 
                          onClick={() => {
                            // Fetch course details by ID to view full content
                            API.get(`/courses/${enroll.courseId}`).then(res => {
                              setSelectedCourse(res.data);
                            });
                          }} 
                          className="btn btn-secondary btn-sm btn-icon-align"
                          style={{ flex: 1 }}
                        >
                          <Play size={12} /> Access Course
                        </button>

                        <button 
                          onClick={() => handleToggleComplete(enroll.enrollmentId, enroll.status)}
                          className={`btn btn-sm ${enroll.status === 'COMPLETED' ? 'btn-secondary' : 'btn-primary'}`}
                          title={enroll.status === 'COMPLETED' ? "Mark Incomplete" : "Mark Completed"}
                        >
                          <CheckCircle size={14} color={enroll.status === 'COMPLETED' ? 'var(--success)' : '#ffffff'} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Edit Profile */}
          {activeTab === 'profile' && (
            <div className="animate-fade">
              <h2>Student Profile</h2>
              <p style={{ marginBottom: '2rem' }}>Update your student credentials and security settings.</p>

              <form onSubmit={handleSaveProfile} className="profile-form">
                <div className="profile-grid">
                  
                  <div className="form-group full-width">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address (Read-only)</label>
                    <input 
                      type="email" 
                      className="form-control"
                      value={profile.email}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={profile.phone || ''}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department (Read-only)</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={profile.department}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">New Password (Optional)</label>
                    <input 
                      type="password" 
                      className="form-control"
                      value={profile.password || ''}
                      onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                      placeholder="Leave blank to keep current"
                      minLength={6}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input 
                      type="password" 
                      className="form-control"
                      value={profile.confirmPassword || ''}
                      onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                      placeholder="Leave blank to keep current"
                    />
                  </div>

                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-icon-align" 
                  style={{ marginTop: '1.5rem' }}
                >
                  <Save size={16} /> Save Changes
                </button>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* Syllabus / Detailed Content Modal */}
      {selectedCourse && (
        <div className="modal-overlay">
          <div className="modal-content glass animate-fade large-modal">
            <div className="modal-header">
              <div>
                <span className="course-badge" style={{ marginBottom: '0.5rem' }}>Duration: {selectedCourse.duration}</span>
                <h2 style={{ margin: 0 }}>{selectedCourse.courseName}</h2>
              </div>
              <button onClick={() => setSelectedCourse(null)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body-section">
              <p className="modal-instructor">Instructor: {selectedCourse.instructorName}</p>
              
              <h4 style={{ marginBottom: '0.5rem' }}>Course Overview:</h4>
              <p className="modal-description">{selectedCourse.description || 'No core overview description was entered.'}</p>
              
              <h4 style={{ marginBottom: '0.5rem' }}>Syllabus & Material Details:</h4>
              <div className="modal-syllabus-box">
                {selectedCourse.content || 'The Detailed Syllabus contents have not been posted by the instructor yet.'}
              </div>
            </div>

            <div className="modal-footer-block" style={{ marginTop: '1.5rem' }}>
              <button onClick={() => setSelectedCourse(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentDashboard;
