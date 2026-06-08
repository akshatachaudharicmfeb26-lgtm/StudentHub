import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { 
  Building2, Users, BookOpen, ClipboardList, Plus, Trash2, Edit, X, RefreshCw, Home,
  ChevronLeft, ChevronRight, Search, UserMinus, ClipboardCheck, User
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalInstitutes: 0,
    totalStudents: 0,
    totalCourses: 0,
    totalEnrollments: 0
  });

  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingInstitute, setEditingInstitute] = useState(null);

  // Form States
  const [addForm, setAddForm] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const [editForm, setEditForm] = useState({
    fullName: '',
    email: ''
  });

  // Manage Scope State (for courses/students management scoped to one institute)
  const [selectedManageInstitute, setSelectedManageInstitute] = useState(null);
  const [manageActiveTab, setManageActiveTab] = useState('courses'); // 'courses', 'students', 'enrollments'

  // Scoped Courses
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

  // Scoped Students
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');

  // Scoped Enrollments
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchInstitutes();
  }, []);

  // Fetch scoped data on tab or page or search changes
  useEffect(() => {
    if (selectedManageInstitute) {
      if (manageActiveTab === 'courses') {
        fetchInstituteCourses(selectedManageInstitute.id, coursePage, courseSearch);
      } else if (manageActiveTab === 'students') {
        fetchInstituteStudents(selectedManageInstitute.id, studentSearch);
      } else if (manageActiveTab === 'enrollments') {
        fetchInstituteEnrollments(selectedManageInstitute.id);
      }
    }
  }, [selectedManageInstitute, manageActiveTab, coursePage, courseSearch, studentSearch]);

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
      const response = await API.get('/super-admin/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching global stats', err);
    }
  };

  const fetchInstitutes = async () => {
    setLoading(true);
    try {
      const response = await API.get('/super-admin/institutes');
      setInstitutes(response.data);
    } catch (err) {
      triggerAlert('error', 'Failed to retrieve institutes list.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setAddForm({ fullName: '', email: '', password: '' });
    setShowAddModal(true);
  };

  const handleCreateInstitute = async (e) => {
    e.preventDefault();

    const trimmedFullName = addForm.fullName.trim();
    const trimmedEmail = addForm.email.trim();
    const trimmedPassword = addForm.password.trim();

    if (!trimmedFullName) {
      triggerAlert('error', 'Institute Name cannot be empty.');
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

    if (trimmedPassword.length < 6) {
      triggerAlert('error', 'Password must be at least 6 characters.');
      return;
    }

    try {
      await API.post('/super-admin/institutes', {
        fullName: trimmedFullName,
        email: trimmedEmail,
        password: trimmedPassword,
        accountType: 'INSTITUTE',
        instituteName: trimmedFullName
      });
      triggerAlert('success', 'Institute Admin created successfully!');
      setShowAddModal(false);
      fetchInstitutes();
      fetchStats();
    } catch (err) {
      triggerAlert('error', err.response?.data?.message || 'Failed to create institute.');
    }
  };

  const handleOpenEdit = (inst) => {
    setEditingInstitute(inst);
    setEditForm({
      fullName: inst.fullName,
      email: inst.email
    });
    setShowEditModal(true);
  };

  const handleEditInstitute = async (e) => {
    e.preventDefault();

    const trimmedFullName = editForm.fullName.trim();
    const trimmedEmail = editForm.email.trim();

    if (!trimmedFullName) {
      triggerAlert('error', 'Institute Name cannot be empty.');
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

    try {
      await API.put(`/super-admin/institutes/${editingInstitute.id}`, {
        fullName: trimmedFullName,
        email: trimmedEmail
      });
      triggerAlert('success', 'Institute Admin updated successfully!');
      setShowEditModal(false);
      fetchInstitutes();
    } catch (err) {
      triggerAlert('error', err.response?.data?.message || 'Failed to update institute.');
    }
  };

  const handleDeleteInstitute = async (id) => {
    if (window.confirm("Are you sure you want to delete this institute? This will permanently delete the institute, all its courses, all enrolled students, and their coursework!")) {
      try {
        await API.delete(`/super-admin/institutes/${id}`);
        triggerAlert('success', 'Institute and all related data deleted successfully.');
        fetchInstitutes();
        fetchStats();
      } catch (err) {
        triggerAlert('error', 'Failed to delete institute.');
      }
    }
  };

  // Scoped Course Handlers
  const fetchInstituteCourses = async (instId, page, searchVal) => {
    setLoading(true);
    try {
      const response = await API.get(`/super-admin/institutes/${instId}/courses`, {
        params: { page, size: 5, search: searchVal }
      });
      setCourses(response.data.content);
      setCourseTotalPages(response.data.totalPages);
    } catch (err) {
      triggerAlert('error', 'Failed to retrieve institute courses.');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstituteStudents = async (instId, queryVal) => {
    setLoading(true);
    try {
      const response = await API.get(`/super-admin/institutes/${instId}/students`, {
        params: { search: queryVal }
      });
      setStudents(response.data);
    } catch (err) {
      triggerAlert('error', 'Failed to retrieve institute students.');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstituteEnrollments = async (instId) => {
    setLoading(true);
    try {
      const response = await API.get(`/super-admin/institutes/${instId}/enrollments`);
      setEnrollments(response.data);
    } catch (err) {
      triggerAlert('error', 'Failed to retrieve institute enrollments.');
    } finally {
      setLoading(false);
    }
  };

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
    if (!selectedManageInstitute) return;
    const instId = selectedManageInstitute.id;

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
        await API.put(`/super-admin/institutes/${instId}/courses/${editingCourse.courseId}`, payload);
        triggerAlert('success', 'Course updated successfully!');
      } else {
        await API.post(`/super-admin/institutes/${instId}/courses`, payload);
        triggerAlert('success', 'Course created successfully!');
      }
      setShowCourseModal(false);
      fetchInstituteCourses(instId, coursePage, courseSearch);
      fetchStats();
    } catch (err) {
      triggerAlert('error', err.response?.data?.message || 'Error saving course.');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!selectedManageInstitute) return;
    const instId = selectedManageInstitute.id;
    if (window.confirm("Are you sure you want to delete this course? This will remove all student enrollments associated with it.")) {
      try {
        await API.delete(`/super-admin/institutes/${instId}/courses/${courseId}`);
        triggerAlert('success', 'Course deleted successfully.');
        fetchInstituteCourses(instId, coursePage, courseSearch);
        fetchStats();
      } catch (err) {
        triggerAlert('error', 'Error deleting course.');
      }
    }
  };

  // Scoped Student Handlers
  const handleDeleteStudent = async (studentId) => {
    if (!selectedManageInstitute) return;
    const instId = selectedManageInstitute.id;
    if (window.confirm("Are you sure you want to delete this student account? This will delete their enrollment and core authentication user details.")) {
      try {
        await API.delete(`/super-admin/institutes/${instId}/students/${studentId}`);
        triggerAlert('success', 'Student account deleted successfully.');
        fetchInstituteStudents(instId, studentSearch);
        fetchStats();
      } catch (err) {
        triggerAlert('error', 'Error deleting student account.');
      }
    }
  };

  // Scoped Enrollment Handlers
  const handleUpdateEnrollmentStatus = async (enrollmentId, newStatus) => {
    if (!selectedManageInstitute) return;
    const instId = selectedManageInstitute.id;
    try {
      await API.put(`/super-admin/institutes/${instId}/enrollments/${enrollmentId}/status`, null, {
        params: { status: newStatus }
      });
      triggerAlert('success', 'Status updated successfully.');
      fetchInstituteEnrollments(instId);
      fetchStats();
    } catch (err) {
      triggerAlert('error', 'Failed to update enrollment status.');
    }
  };

  const handleCancelEnrollment = async (enrollmentId) => {
    if (!selectedManageInstitute) return;
    const instId = selectedManageInstitute.id;
    if (window.confirm("Are you sure you want to cancel this student's enrollment?")) {
      try {
        await API.delete(`/super-admin/institutes/${instId}/enrollments/${enrollmentId}`);
        triggerAlert('success', 'Enrollment cancelled.');
        fetchInstituteEnrollments(instId);
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
          <h1>Super Admin Dashboard</h1>
          <p>Manage all university workspaces and view global system statistics.</p>
        </div>
        <button 
          onClick={() => { 
            fetchStats(); 
            if (selectedManageInstitute) {
              if (manageActiveTab === 'courses') fetchInstituteCourses(selectedManageInstitute.id, coursePage, courseSearch);
              else if (manageActiveTab === 'students') fetchInstituteStudents(selectedManageInstitute.id, studentSearch);
              else if (manageActiveTab === 'enrollments') fetchInstituteEnrollments(selectedManageInstitute.id);
            } else {
              fetchInstitutes();
            }
            triggerAlert('success', 'Console data refreshed.'); 
          }} 
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

      {/* Global Statistics Cards */}
      <div className="stats-grid">
        <div className="glass stat-card">
          <div className="stat-icon-wrapper stat-icon-secondary"><Building2 size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalInstitutes}</span>
            <span className="stat-label">Total Institutes</span>
          </div>
        </div>

        <div className="glass stat-card">
          <div className="stat-icon-wrapper stat-icon-primary"><Users size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalStudents}</span>
            <span className="stat-label">Global Students</span>
          </div>
        </div>

        <div className="glass stat-card">
          <div className="stat-icon-wrapper stat-icon-secondary"><BookOpen size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalCourses}</span>
            <span className="stat-label">Global Courses</span>
          </div>
        </div>

        <div className="glass stat-card">
          <div className="stat-icon-wrapper stat-icon-success"><ClipboardCheck size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalEnrollments}</span>
            <span className="stat-label">Global Enrollments</span>
          </div>
        </div>
      </div>

      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="dashboard-sidebar glass">
          <Link to="/" className="sidebar-btn">
            <Home size={18} /> Back to Home
          </Link>
          <button className="sidebar-btn active">
            <Building2 size={18} /> Manage Institutes
          </button>
          <Link to="/profile" className="sidebar-btn">
            <User size={18} /> Edit Profile
          </Link>
        </aside>

        {/* Content panel */}
        <main className="glass dashboard-main-content">
          {!selectedManageInstitute ? (
            <>
              <div className="section-header-block">
                <h2>University Workspaces</h2>
                <button onClick={handleOpenAdd} className="btn btn-primary btn-sm btn-icon-align">
                  <Plus size={16} /> Add Institute
                </button>
              </div>

              {loading ? (
                <p style={{ color: 'var(--text-muted)' }}>Retrieving workspaces...</p>
              ) : institutes.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No institute workspaces have been configured yet.</p>
              ) : (
                <div className="table-container glass">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Institute Name</th>
                        <th>Email Address</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {institutes.map(inst => (
                        <tr key={inst.id}>
                          <td className="text-highlight">{inst.fullName}</td>
                          <td>{inst.email}</td>
                          <td>
                            <div className="action-button-group">
                              <button 
                                onClick={() => {
                                  setSelectedManageInstitute(inst);
                                  setManageActiveTab('courses');
                                  setCoursePage(0);
                                  setCourseSearch('');
                                  setStudentSearch('');
                                }} 
                                className="btn btn-primary btn-sm btn-icon-align" 
                                title="Manage"
                              >
                                <Building2 size={13} /> Manage
                              </button>
                              <button 
                                onClick={() => handleOpenEdit(inst)} 
                                className="btn btn-secondary btn-sm" 
                                title="Edit"
                              >
                                <Edit size={13} /> Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteInstitute(inst.id)} 
                                className="btn btn-danger btn-sm" 
                                title="Delete"
                              >
                                <Trash2 size={13} /> Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="section-header-block" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <button 
                    onClick={() => { setSelectedManageInstitute(null); fetchStats(); fetchInstitutes(); }} 
                    className="btn btn-secondary btn-sm btn-icon-align" 
                    style={{ marginBottom: '0.75rem' }}
                  >
                    <ChevronLeft size={16} /> Back to Institutes List
                  </button>
                  <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building2 size={24} color="var(--primary)" /> {selectedManageInstitute.fullName}
                  </h2>
                  <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                    Managing courses, students, and enrollments specifically for this workspace.
                  </p>
                </div>
              </div>

              {/* Sub-tab Selector */}
              <div className="tab-bar-container" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <button 
                  className={`btn btn-sm ${manageActiveTab === 'courses' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => { setManageActiveTab('courses'); setCoursePage(0); }}
                >
                  <BookOpen size={14} style={{ marginRight: '0.25rem' }} /> Courses
                </button>
                <button 
                  className={`btn btn-sm ${manageActiveTab === 'students' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setManageActiveTab('students')}
                >
                  <Users size={14} style={{ marginRight: '0.25rem' }} /> Students
                </button>
                <button 
                  className={`btn btn-sm ${manageActiveTab === 'enrollments' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setManageActiveTab('enrollments')}
                >
                  <ClipboardCheck size={14} style={{ marginRight: '0.25rem' }} /> Enrollments
                </button>
              </div>

              {/* Scoped Tab Contents */}
              {manageActiveTab === 'courses' && (
                <div className="animate-fade">
                  <div className="section-header-block">
                    <h3>Course Catalog</h3>
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
                    <p style={{ color: 'var(--text-muted)' }}>No courses found in this institute.</p>
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

              {manageActiveTab === 'students' && (
                <div className="animate-fade">
                  <h3>Student Accounts</h3>

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

              {manageActiveTab === 'enrollments' && (
                <div className="animate-fade">
                  <h3>Course Enrollments</h3>

                  {loading ? (
                    <p style={{ color: 'var(--text-muted)' }}>Loading enrollments list...</p>
                  ) : enrollments.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No enrollments recorded in this institute.</p>
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
            </>
          )}
        </main>
      </div>

      {/* Add Institute Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content glass animate-fade">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Add New Institute</h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateInstitute}>
              <div className="form-group">
                <label className="form-label">Institute Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required
                  value={addForm.fullName}
                  onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                  placeholder="e.g. Stanford University" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="e.g. admin@stanford.edu" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Temporary Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  required
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  placeholder="Minimum 6 characters" 
                  minLength={6}
                />
              </div>

              <div className="modal-footer-block">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Institute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Institute Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content glass animate-fade">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Edit Institute Info</h3>
              <button 
                onClick={() => setShowEditModal(false)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditInstitute}>
              <div className="form-group">
                <label className="form-label">Institute Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>

              <div className="modal-footer-block">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  placeholder="Provide a brief summary of topics covered..."
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

export default SuperAdminDashboard;
