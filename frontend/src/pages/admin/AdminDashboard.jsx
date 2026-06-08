import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import API from '../../services/api';
import { 
  Users, BookOpen, ClipboardCheck, ClipboardList, Trash2, Edit, Plus, Search, 
  ChevronLeft, ChevronRight, X, UserMinus, RefreshCw, ShieldAlert, Home, User
} from 'lucide-react';

const AdminDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    activeEnrollments: 0,
    completedEnrollments: 0
  });

  // Course management state
  const [courses, setCourses] = useState([]);
  const [courseSearch, setCourseSearch] = useState('');
  const [coursePage, setCoursePage] = useState(0);
  const [courseTotalPages, setCourseTotalPages] = useState(0);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    courseName: '',
    duration: '',
    instructorName: '',
    description: '',
    content: ''
  });

  // Student management state
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');

  // Enrollment management state
  const [enrollments, setEnrollments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch initial stats
  useEffect(() => {
    fetchStats();
  }, []);

  // Sync tab from URL query params
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tabParam = query.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // Fetch contextual data on tab changes
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchStats();
    } else if (activeTab === 'courses') {
      fetchCourses(coursePage, courseSearch);
    } else if (activeTab === 'students') {
      fetchStudents(studentSearch);
    } else if (activeTab === 'enrollments') {
      fetchEnrollments();
    }
  }, [activeTab, coursePage, courseSearch, studentSearch]);

  const triggerAlert = (type, msg) => {
    if (type === 'success') {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setError(msg);
      setTimeout(() => setError(''), 4000);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await API.get('/admin/stats');
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching stats", err);
    }
  };

  const fetchCourses = async (page, searchVal) => {
    setLoading(true);
    try {
      const response = await API.get('/courses', {
        params: { page, size: 5, search: searchVal }
      });
      setCourses(response.data.content);
      setCourseTotalPages(response.data.totalPages);
    } catch (err) {
      triggerAlert('error', 'Failed to retrieve courses.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (queryVal) => {
    setLoading(true);
    try {
      const endpoint = queryVal ? `/admin/students/search?query=${queryVal}` : '/admin/students';
      const response = await API.get(endpoint);
      setStudents(response.data);
    } catch (err) {
      triggerAlert('error', 'Failed to retrieve students list.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const response = await API.get('/enrollments');
      setEnrollments(response.data);
    } catch (err) {
      triggerAlert('error', 'Failed to retrieve enrollments.');
    } finally {
      setLoading(false);
    }
  };

  // Course Handlers
  const handleOpenAddCourse = () => {
    setEditingCourse(null);
    setCourseForm({
      courseName: '',
      duration: '',
      instructorName: '',
      description: '',
      content: ''
    });
    setShowCourseModal(true);
  };

  const handleOpenEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      courseName: course.courseName,
      duration: course.duration,
      instructorName: course.instructorName,
      description: course.description || '',
      content: course.content || ''
    });
    setShowCourseModal(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();

    const trimmedCourseName = courseForm.courseName.trim();
    const trimmedInstructorName = courseForm.instructorName.trim();
    const trimmedDuration = courseForm.duration.trim();
    const trimmedDescription = (courseForm.description || '').trim();
    const trimmedContent = (courseForm.content || '').trim();

    if (!trimmedCourseName) {
      triggerAlert('error', 'Course Name cannot be empty.');
      return;
    }

    if (!trimmedInstructorName) {
      triggerAlert('error', 'Instructor Name cannot be empty.');
      return;
    }

    if (!trimmedDuration) {
      triggerAlert('error', 'Duration cannot be empty.');
      return;
    }

    try {
      const payload = {
        courseName: trimmedCourseName,
        instructorName: trimmedInstructorName,
        duration: trimmedDuration,
        description: trimmedDescription,
        content: trimmedContent
      };

      if (editingCourse) {
        // Update Course
        await API.put(`/courses/${editingCourse.courseId}`, payload);
        triggerAlert('success', 'Course updated successfully!');
      } else {
        // Create Course
        await API.post('/courses', payload);
        triggerAlert('success', 'Course created successfully!');
      }
      setShowCourseModal(false);
      fetchCourses(coursePage, courseSearch);
      fetchStats();
    } catch (err) {
      triggerAlert('error', err.response?.data?.message || 'Error saving course.');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      if (window.confirm("Are you sure you want to delete this course? This will remove all student enrollments associated with it.")) {
        console.log("Sending delete request for course ID:", courseId);
        await API.delete(`/courses/${courseId}`);
        triggerAlert('success', 'Course deleted successfully.');
        fetchCourses(coursePage, courseSearch);
        fetchStats();
      }
    } catch (err) {
      console.error("Error in handleDeleteCourse:", err);
      triggerAlert('error', 'Error deleting course: ' + (err.response?.data?.message || err.message));
    }
  };

  // Student Account deletion
  const handleDeleteStudent = async (studentId) => {
    try {
      if (window.confirm("Are you sure you want to delete this student account? This will delete their enrollment and core authentication user details.")) {
        console.log("Sending delete request for student ID:", studentId);
        await API.delete(`/admin/students/${studentId}`);
        triggerAlert('success', 'Student account deleted successfully.');
        fetchStudents(studentSearch);
        fetchStats();
      }
    } catch (err) {
      console.error("Error in handleDeleteStudent:", err);
      triggerAlert('error', 'Error deleting student account: ' + (err.response?.data?.message || err.message));
    }
  };

  // Update Enrollment Status
  const handleUpdateEnrollmentStatus = async (enrollmentId, newStatus) => {
    try {
      await API.put(`/enrollments/${enrollmentId}/status`, null, {
        params: { status: newStatus }
      });
      triggerAlert('success', 'Enrollment status updated.');
      fetchEnrollments();
      fetchStats();
    } catch (err) {
      triggerAlert('error', 'Failed to update enrollment status.');
    }
  };

  // Cancel Enrollment
  const handleCancelEnrollment = async (enrollmentId) => {
    if (window.confirm("Are you sure you want to cancel this student's enrollment?")) {
      try {
        await API.delete(`/enrollments/${enrollmentId}`);
        triggerAlert('success', 'Enrollment cancelled.');
        fetchEnrollments();
        fetchStats();
      } catch (err) {
        triggerAlert('error', 'Failed to cancel enrollment.');
      }
    }
  };

  return (
    <div className="animate-fade dashboard-container">
      <div className="dashboard-header-block">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage your courses, students, and enrollments.</p>
        </div>
        <button 
          onClick={() => { fetchStats(); triggerAlert('success', 'Dashboard statistics refreshed.'); }} 
          className="btn btn-secondary btn-icon-align"
        >
          <RefreshCw size={15} /> Refresh
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
          <button 
            className={`sidebar-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => { setActiveTab('overview'); }}
          >
            <ClipboardList size={18} /> Overview
          </button>
          <button 
            className={`sidebar-btn ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => { setActiveTab('courses'); setCoursePage(0); }}
          >
            <BookOpen size={18} /> Manage Courses
          </button>
          <button 
            className={`sidebar-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => { setActiveTab('students'); }}
          >
            <Users size={18} /> Manage Students
          </button>
          <button 
            className={`sidebar-btn ${activeTab === 'enrollments' ? 'active' : ''}`}
            onClick={() => { setActiveTab('enrollments'); }}
          >
            <ClipboardCheck size={18} /> Enrollments
          </button>
          <Link to="/profile" className="sidebar-btn">
            <User size={18} /> Edit Profile
          </Link>
        </aside>

        {/* Dashboard Content Panel */}
        <main className="glass dashboard-main-content">
          
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="animate-fade">
              <h2 style={{ marginBottom: '1.5rem' }}>System Summary</h2>
              
              <div className="stats-grid">
                <div className="glass stat-card">
                  <div className="stat-icon-wrapper stat-icon-primary"><Users size={24} /></div>
                  <div className="stat-info">
                    <span className="stat-value">{stats.totalStudents}</span>
                    <span className="stat-label">Total Students</span>
                  </div>
                </div>

                <div className="glass stat-card">
                  <div className="stat-icon-wrapper stat-icon-secondary"><BookOpen size={24} /></div>
                  <div className="stat-info">
                    <span className="stat-value">{stats.totalCourses}</span>
                    <span className="stat-label">Total Courses</span>
                  </div>
                </div>

                <div className="glass stat-card">
                  <div className="stat-icon-wrapper stat-icon-primary"><ClipboardList size={24} /></div>
                  <div className="stat-info">
                    <span className="stat-value">{stats.totalEnrollments}</span>
                    <span className="stat-label">Total Enrollments</span>
                  </div>
                </div>

                <div className="glass stat-card">
                  <div className="stat-icon-wrapper stat-icon-success"><ClipboardCheck size={24} /></div>
                  <div className="stat-info">
                    <span className="stat-value">{stats.activeEnrollments}</span>
                    <span className="stat-label">Active Learners</span>
                  </div>
                </div>
              </div>

              <div className="dashboard-summary-widgets">
                <div className="glass dashboard-widget-card" style={{ maxWidth: '600px' }}>
                  <h3>Learning Success Rate</h3>
                  <p className="widget-card-desc">Completion Breakdown of Course Registrations:</p>
                  
                  <div className="widget-card-row">
                    <span>Active Enrollments</span>
                    <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{stats.activeEnrollments}</span>
                  </div>
                  
                  <div className="widget-card-row">
                    <span>Completed Courses</span>
                    <span style={{ color: 'var(--success)', fontWeight: '700' }}>{stats.completedEnrollments}</span>
                  </div>
                  
                  <div className="widget-card-row no-border">
                    <span>System Completion Ratio</span>
                    <span style={{ color: 'var(--secondary)', fontWeight: '700' }}>
                      {stats.totalEnrollments > 0 ? Math.round((stats.completedEnrollments / stats.totalEnrollments) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Manage Courses */}
          {activeTab === 'courses' && (
            <div className="animate-fade">
              <div className="section-header-block">
                <h2>Course Catalog</h2>
                <button onClick={handleOpenAddCourse} className="btn btn-primary btn-sm btn-icon-align">
                  <Plus size={16} /> Create Course
                </button>
              </div>

              <div className="search-bar-container">
                <div className="search-input-wrapper">
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="Search by name, instructor, or description..."
                    value={courseSearch}
                    onChange={(e) => { setCourseSearch(e.target.value); setCoursePage(0); }}
                  />
                </div>
              </div>

              {loading ? (
                <p style={{ color: 'var(--text-muted)' }}>Loading catalog...</p>
              ) : courses.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No courses found. Create one to get started!</p>
              ) : (
                <>
                  <div className="table-container glass">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Course Name</th>
                          <th>Instructor</th>
                          <th>Duration</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map(course => (
                          <tr key={course.courseId}>
                            <td className="text-highlight">{course.courseName}</td>
                            <td>{course.instructorName}</td>
                            <td><span className="course-badge">{course.duration}</span></td>
                            <td>
                              <div className="action-button-group">
                                <button 
                                  onClick={() => handleOpenEditCourse(course)} 
                                  className="btn btn-secondary btn-sm" 
                                  title="Edit"
                                >
                                  <Edit size={13} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteCourse(course.courseId)} 
                                  className="btn btn-danger btn-sm" 
                                  title="Delete"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

          {/* Tab 3: Manage Students */}
          {activeTab === 'students' && (
            <div className="animate-fade">
              <h2 style={{ marginBottom: '1.5rem' }}>Student Accounts</h2>

              <div className="search-bar-container">
                <div className="search-input-wrapper">
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="Search students by name or department..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <p style={{ color: 'var(--text-muted)' }}>Loading student profiles...</p>
              ) : students.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No student profiles found.</p>
              ) : (
                <div className="table-container glass">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Email Address</th>
                        <th>Department</th>
                        <th>Phone</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(student => (
                        <tr key={student.studentId}>
                          <td className="text-highlight">{student.fullName}</td>
                          <td>{student.email}</td>
                          <td>{student.department}</td>
                          <td>{student.phone || 'N/A'}</td>
                          <td>
                            <button 
                              onClick={() => handleDeleteStudent(student.studentId)} 
                              className="btn btn-danger btn-sm btn-icon-align" 
                              title="Delete Student Profile"
                            >
                              <UserMinus size={13} /> Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Enrollments */}
          {activeTab === 'enrollments' && (
            <div className="animate-fade">
              <h2 style={{ marginBottom: '1.5rem' }}>Course Enrollments</h2>

              {loading ? (
                <p style={{ color: 'var(--text-muted)' }}>Loading enrollments list...</p>
              ) : enrollments.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No enrollments recorded in the system.</p>
              ) : (
                <div className="table-container glass">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Course Title</th>
                        <th>Date Enrolled</th>
                        <th>Status</th>
                        <th>Update Status</th>
                        <th>Cancel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map(enroll => (
                        <tr key={enroll.enrollmentId}>
                          <td className="text-highlight">{enroll.studentName}</td>
                          <td>{enroll.courseName}</td>
                          <td>{new Date(enroll.enrollmentDate).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge ${
                              enroll.status === 'COMPLETED' ? 'badge-success' : 
                              enroll.status === 'ENROLLED' ? 'badge-primary' : 'badge-danger'
                            }`}>
                              {enroll.status}
                            </span>
                          </td>
                          <td>
                            <select 
                              value={enroll.status}
                              onChange={(e) => handleUpdateEnrollmentStatus(enroll.enrollmentId, e.target.value)}
                              className="form-control table-select"
                            >
                              <option value="ENROLLED">ENROLLED</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="DROPPED">DROPPED</option>
                            </select>
                          </td>
                          <td>
                            <button 
                              onClick={() => handleCancelEnrollment(enroll.enrollmentId)}
                              className="btn btn-danger btn-sm"
                              title="Cancel Enrollment"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* Course Creation/Modification Modal */}
      {showCourseModal && (
        <div className="modal-overlay">
          <div className="modal-content glass animate-fade">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>{editingCourse ? 'Modify Course Details' : 'Add New Course'}</h3>
              <button 
                onClick={() => setShowCourseModal(false)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCourse}>
              <div className="form-group">
                <label className="form-label">Course Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required
                  value={courseForm.courseName}
                  onChange={(e) => setCourseForm({ ...courseForm, courseName: e.target.value })}
                  placeholder="e.g. Advanced Algorithm Analysis" 
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Instructor Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required
                    value={courseForm.instructorName}
                    onChange={(e) => setCourseForm({ ...courseForm, instructorName: e.target.value })}
                    placeholder="e.g. Dr. Ada Lovelace" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                    placeholder="e.g. 10 weeks" 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Short Description</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Provide a brief summaries of topics covered..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Course Detailed Syllabus / Content</label>
                <textarea 
                  className="form-control" 
                  rows="5"
                  value={courseForm.content}
                  onChange={(e) => setCourseForm({ ...courseForm, content: e.target.value })}
                  placeholder="Syllabus details, module topics, grading policies..."
                />
              </div>

              <div className="modal-footer-block">
                <button type="button" onClick={() => setShowCourseModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
