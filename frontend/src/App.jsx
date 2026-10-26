import { useState, useEffect } from 'react';

// Spring Boot backend REST endpoint (configurable via Vite environment variable for production)
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, '');
const API_BASE_URL = cleanBaseUrl.endsWith('/api/students')
  ? cleanBaseUrl
  : `${cleanBaseUrl}/api/students`;

// Common branches for easy selection
const BRANCH_OPTIONS = [
  'Computer Science and Engineering',
  'Information Technology',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Artificial Intelligence & Data Science'
];

export default function App() {
  // --- States ---
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    rollNumber: '',
    name: '',
    branch: '',
    email: '',
  });

  // Validation Errors
  const [fieldErrors, setFieldErrors] = useState({});

  // Global Notification Banner (success or error)
  const [notification, setNotification] = useState(null);

  // Delete Confirmation Modal State
  const [studentToDelete, setStudentToDelete] = useState(null);

  // Fetch all students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // Auto-dismiss success notification after 5 seconds
  useEffect(() => {
    if (notification && notification.type === 'success') {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // --- CRUD API Calls ---

  // 1. READ: Fetch all students from backend
  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setNotification({
        type: 'error',
        message: 'Could not connect to Spring Boot backend. Please ensure the server is running on port 8080.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Form Validation ---
  const validateForm = () => {
    const errors = {};

    if (!formData.rollNumber.trim()) {
      errors.rollNumber = 'Roll number is required';
    } else if (formData.rollNumber.trim().length < 3) {
      errors.rollNumber = 'Roll number must be at least 3 characters';
    }

    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.branch.trim()) {
      errors.branch = 'Please select or enter a branch';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- Input Change Handler ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error as user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // 2. CREATE or 3. UPDATE: Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setNotification({
        type: 'error',
        message: 'Please resolve the highlighted form errors before submitting.',
      });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    const payload = {
      rollNumber: formData.rollNumber.trim().toUpperCase(),
      name: formData.name.trim(),
      branch: formData.branch.trim(),
      email: formData.email.trim().toLowerCase(),
    };

    try {
      if (editingId) {
        // UPDATE existing student (PUT /api/students/{id})
        const response = await fetch(`${API_BASE_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to update student');
        }

        setNotification({
          type: 'success',
          message: `Student "${data.name}" (${data.rollNumber}) updated successfully!`,
        });
      } else {
        // CREATE new student (POST /api/students)
        const response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create student');
        }

        setNotification({
          type: 'success',
          message: `Student "${data.name}" (${data.rollNumber}) added successfully!`,
        });
      }

      // Reset form and editing state
      resetForm();
      // Auto-refresh the student records table
      await fetchStudents();
    } catch (err) {
      console.error('Submit error:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Operation failed. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Populate form for Editing
  const handleEditClick = (student) => {
    setEditingId(student.id);
    setFormData({
      rollNumber: student.rollNumber,
      name: student.name,
      branch: student.branch,
      email: student.email,
    });
    setFieldErrors({});
    setNotification({
      type: 'info',
      message: `Editing student record: ${student.rollNumber}. Update the form and click "Update Student".`,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel Editing
  const handleCancelEdit = () => {
    resetForm();
    setNotification(null);
  };

  // Reset Form
  const resetForm = () => {
    setEditingId(null);
    setFormData({
      rollNumber: '',
      name: '',
      branch: '',
      email: '',
    });
    setFieldErrors({});
  };

  // 4. DELETE: Confirm and execute student deletion
  const confirmDelete = async () => {
    if (!studentToDelete) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/${studentToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete student');
      }

      setNotification({
        type: 'success',
        message: `Student "${studentToDelete.name}" (${studentToDelete.rollNumber}) deleted successfully!`,
      });

      // If deleted student was being edited, clear form
      if (editingId === studentToDelete.id) {
        resetForm();
      }

      // Auto-refresh table
      await fetchStudents();
    } catch (err) {
      console.error('Delete error:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to delete student.',
      });
    } finally {
      setIsSubmitting(false);
      setStudentToDelete(null);
    }
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <div className="header-badge">Java Full Stack Development Lab</div>
        <h1>Student Record Management System</h1>
        <p className="subtitle">
          Spring Boot REST API + React.js + H2 Database Full-Stack Lab External Exam Implementation
        </p>
      </header>

      {/* Global Notification Banner */}
      {notification && (
        <div className={`notification-banner ${notification.type}`}>
          <div className="notification-content">
            <span className="notification-icon">
              {notification.type === 'success' && '✓'}
              {notification.type === 'error' && '✕'}
              {notification.type === 'info' && 'ℹ'}
            </span>
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            className="notification-close"
            onClick={() => setNotification(null)}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      <div className="main-layout">
        {/* Left Column: Student Entry Form */}
        <section className={`card form-card ${editingId ? 'editing-mode' : ''}`}>
          <div className="card-header">
            <h2>{editingId ? 'Edit Student Details' : 'Add New Student'}</h2>
            {editingId && <span className="badge badge-warning">Editing ID #{editingId}</span>}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Roll Number Field */}
            <div className="form-group">
              <label htmlFor="rollNumber">
                Roll Number <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="rollNumber"
                name="rollNumber"
                placeholder="e.g. 21CS101"
                value={formData.rollNumber}
                onChange={handleInputChange}
                className={fieldErrors.rollNumber ? 'input-error' : ''}
                disabled={isSubmitting}
              />
              {fieldErrors.rollNumber && (
                <span className="error-text">{fieldErrors.rollNumber}</span>
              )}
            </div>

            {/* Full Name Field */}
            <div className="form-group">
              <label htmlFor="name">
                Full Name <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="e.g. Aarav Sharma"
                value={formData.name}
                onChange={handleInputChange}
                className={fieldErrors.name ? 'input-error' : ''}
                disabled={isSubmitting}
              />
              {fieldErrors.name && (
                <span className="error-text">{fieldErrors.name}</span>
              )}
            </div>

            {/* Branch Field */}
            <div className="form-group">
              <label htmlFor="branch">
                Branch / Department <span className="required-star">*</span>
              </label>
              <select
                id="branch"
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                className={fieldErrors.branch ? 'input-error' : ''}
                disabled={isSubmitting}
              >
                <option value="">-- Select Branch --</option>
                {BRANCH_OPTIONS.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
              {fieldErrors.branch && (
                <span className="error-text">{fieldErrors.branch}</span>
              )}
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">
                Email Address <span className="required-star">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="e.g. aarav.sharma@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className={fieldErrors.email ? 'input-error' : ''}
                disabled={isSubmitting}
              />
              {fieldErrors.email && (
                <span className="error-text">{fieldErrors.email}</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button
                type="submit"
                className={`btn ${editingId ? 'btn-update' : 'btn-primary'}`}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Saving...'
                  : editingId
                  ? 'Update Student'
                  : 'Add Student'}
              </button>

              {editingId ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                >
                  Cancel Edit
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Right Column: Student Records Table */}
        <section className="card table-card">
          <div className="card-header table-header">
            <div>
              <h2>Registered Students</h2>
              <p className="table-subtitle">Live records stored in local H2 database</p>
            </div>
            <div className="table-header-controls">
              <span className="badge badge-info">{students.length} Total</span>
              <button
                type="button"
                className="btn btn-refresh"
                onClick={fetchStudents}
                disabled={isLoading}
                title="Refresh table"
              >
                ↻ Refresh
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="status-box loading-box">
              <div className="spinner"></div>
              <p>Loading student records from backend...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="status-box empty-box">
              <p className="empty-title">No student records found</p>
              <p className="empty-desc">Use the entry form on the left to add a new student.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Roll Number</th>
                    <th>Name</th>
                    <th>Branch</th>
                    <th>Email</th>
                    <th className="th-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr
                      key={student.id}
                      className={editingId === student.id ? 'row-active' : ''}
                    >
                      <td>
                        <span className="id-badge">#{student.id}</span>
                      </td>
                      <td>
                        <strong>{student.rollNumber}</strong>
                      </td>
                      <td>{student.name}</td>
                      <td>
                        <span className="branch-tag">{student.branch}</span>
                      </td>
                      <td className="email-cell">{student.email}</td>
                      <td className="actions-cell">
                        <button
                          type="button"
                          className="btn-action btn-edit"
                          onClick={() => handleEditClick(student)}
                          disabled={isSubmitting}
                          title="Edit this record"
                        >
                          ✎ Edit
                        </button>
                        <button
                          type="button"
                          className="btn-action btn-delete"
                          onClick={() => setStudentToDelete(student)}
                          disabled={isSubmitting}
                          title="Delete this record"
                        >
                          🗑 Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3>Confirm Student Deletion</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setStudentToDelete(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete the student record for:
              </p>
              <div className="delete-target-card">
                <p><strong>Name:</strong> {studentToDelete.name}</p>
                <p><strong>Roll No:</strong> {studentToDelete.rollNumber}</p>
                <p><strong>Branch:</strong> {studentToDelete.branch}</p>
              </div>
              <p className="delete-warning">
                This action cannot be undone and will remove the record from H2 database.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStudentToDelete(null)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={confirmDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <p>Student Record Management System | Java Full Stack Lab Exam</p>
        <p className="footer-credits">Spring Boot 3 • Spring Data JPA • H2 Database • React.js • Vite</p>
      </footer>
    </div>
  );
}
