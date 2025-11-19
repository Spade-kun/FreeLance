import { useState, useEffect } from "react";
import api from "../../services/api";
import { useRecaptcha } from "../../context/RecaptchaContext";
import Modal from "../Modal/Modal";

export default function AccountsPage() {
  const { getRecaptchaToken } = useRecaptcha();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });
  
  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("student");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // all, students, instructors, admins
  
  // Role-specific fields
  const [specialization, setSpecialization] = useState("");
  const [bio, setBio] = useState("");
  const [permissions, setPermissions] = useState(["view_dashboard"]);
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const results = await Promise.allSettled([
        api.getStudents(),
        api.getInstructors(),
        api.getAdmins()
      ]);

      const [studentsRes, instructorsRes, adminsRes] = results;

      const allUsers = [
        ...((studentsRes.status === 'fulfilled' && studentsRes.value?.data) || []).map(u => ({ ...u, role: 'student' })),
        ...((instructorsRes.status === 'fulfilled' && instructorsRes.value?.data) || []).map(u => ({ ...u, role: 'instructor' })),
        ...((adminsRes.status === 'fulfilled' && adminsRes.value?.data) || []).map(u => ({ ...u, role: 'admin' }))
      ];

      setUsers(allUsers);

      // Check if any requests failed
      const failures = results.filter(r => r.status === 'rejected');
      if (failures.length > 0) {
        console.warn('Some user data failed to load:', failures);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(`Failed to load users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setModal({ isOpen: true, title: 'Validation Error', message: 'Please fill all required fields (First Name, Last Name, Email).', type: 'error' });
      return false;
    }

    if (!editingUser && (!password.trim() || !confirmPassword.trim())) {
      setModal({ isOpen: true, title: 'Validation Error', message: 'Please enter password and confirm password.', type: 'error' });
      return false;
    }

    if (!editingUser && password !== confirmPassword) {
      setModal({ isOpen: true, title: 'Validation Error', message: 'Passwords do not match!', type: 'error' });
      return false;
    }

    if (!editingUser && password.length < 6) {
      setModal({ isOpen: true, title: 'Validation Error', message: 'Password must be at least 6 characters long.', type: 'error' });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setModal({ isOpen: true, title: 'Validation Error', message: 'Please enter a valid email address.', type: 'error' });
      return false;
    }

    // Role-specific validation
    if (role === "instructor" && !specialization.trim()) {
      setModal({ isOpen: true, title: 'Validation Error', message: 'Specialization is required for instructors.', type: 'error' });
      return false;
    }

    return true;
  };

  const addUser = async () => {
    if (!validateForm()) return;

    setFormLoading(true);
    try {
      // Get reCAPTCHA token (use 'signup' action as it's already configured in backend)
      const recaptchaToken = await getRecaptchaToken('signup');

      let userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        recaptchaToken,
        isActive: true
      };

      let response;
      if (role === 'student') {
        userData.guardianName = guardianName.trim() || undefined;
        userData.guardianPhone = guardianPhone.trim() || undefined;
        response = await api.createStudent(userData);
      } else if (role === 'instructor') {
        userData.specialization = specialization.trim();
        userData.bio = bio.trim() || "No bio provided";
        userData.qualifications = [];
        response = await api.createInstructor(userData);
      } else if (role === 'admin') {
        userData.permissions = permissions;
        response = await api.createAdmin(userData);
      }

      if (response.success) {
        setModal({ 
          isOpen: true, 
          title: 'Success', 
          message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully!\n\nEmail: ${email}\nPassword: ${password}\n\nUser can now login with these credentials.`, 
          type: 'success' 
        });
        resetForm();
        fetchAllUsers();
      }
    } catch (err) {
      console.error('Error creating user:', err);
      setModal({ isOpen: true, title: 'Error', message: `Failed to create user: ${err.message || 'Unknown error'}`, type: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const updateUser = async () => {
    if (!editingUser) return;
    
    if (!validateForm()) return;

    setFormLoading(true);
    try {
      let userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim()
      };

      // Add role-specific fields
      if (editingUser.role === 'instructor') {
        userData.specialization = specialization.trim();
        userData.bio = bio.trim() || "No bio provided";
      } else if (editingUser.role === 'admin') {
        userData.permissions = permissions;
      } else if (editingUser.role === 'student') {
        userData.guardianName = guardianName.trim() || undefined;
        userData.guardianPhone = guardianPhone.trim() || undefined;
      }

      let response;
      if (editingUser.role === 'student') {
        response = await api.updateStudent(editingUser._id, userData);
      } else if (editingUser.role === 'instructor') {
        response = await api.updateInstructor(editingUser._id, userData);
      } else if (editingUser.role === 'admin') {
        response = await api.updateAdmin(editingUser._id, userData);
      }

      if (response.success) {
        setModal({ isOpen: true, title: 'Success', message: 'User updated successfully!', type: 'success' });
        resetForm();
        fetchAllUsers();
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setModal({ isOpen: true, title: 'Error', message: `Failed to update user: ${err.message || 'Unknown error'}`, type: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const deleteUser = async (user) => {
    if (!confirm(`Delete ${user.firstName} ${user.lastName}?`)) return;

    try {
      let response;
      if (user.role === 'student') {
        response = await api.deleteStudent(user._id);
      } else if (user.role === 'instructor') {
        response = await api.deleteInstructor(user._id);
      } else if (user.role === 'admin') {
        response = await api.deleteAdmin(user._id);
      }

      if (response.success) {
        setModal({ isOpen: true, title: 'Success', message: 'User deleted successfully!', type: 'success' });
        fetchAllUsers();
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setModal({ isOpen: true, title: 'Error', message: err.message || 'Failed to delete user', type: 'error' });
    }
  };

  const startEdit = (user) => {
    setEditingUser(user);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setPhone(user.phone || "");
    setRole(user.role);
    
    // Role-specific fields
    if (user.role === 'instructor') {
      setSpecialization(user.specialization || "");
      setBio(user.bio || "");
    } else if (user.role === 'admin') {
      setPermissions(user.permissions || ["view_dashboard"]);
    } else if (user.role === 'student') {
      setGuardianName(user.guardianName || "");
      setGuardianPhone(user.guardianPhone || "");
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    setRole("student");
    setSpecialization("");
    setBio("");
    setPermissions(["view_dashboard"]);
    setGuardianName("");
    setGuardianPhone("");
  };

  const filteredUsers = activeTab === "all" 
    ? users 
    : users.filter(u => u.role === activeTab.slice(0, -1)); // Remove 's' from plural

  if (loading) {
    return (
      <div className="card">
        <h2>Manage Accounts</h2>
        <p className="muted small">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Manage Accounts</h2>

      {error && (
        <div style={{ padding: '10px', background: '#fee', color: '#c00', borderRadius: '4px', marginBottom: '16px' }}>
          {error}
          <button className="btn ghost small" style={{ marginLeft: '10px' }} onClick={fetchAllUsers}>
            Retry
          </button>
        </div>
      )}

      {/* Add/Edit User Form */}
      <div style={{ marginBottom: '20px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#333' }}>
          {editingUser ? '✏️ Edit User' : '➕ Add New User'}
        </h3>
        
        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <input
            type="text"
            placeholder="First Name *"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            disabled={formLoading}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          />

          <input
            type="text"
            placeholder="Last Name *"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            disabled={formLoading}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          />

          <input
            type="email"
            placeholder="Email Address *"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={formLoading || editingUser}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          />

          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            disabled={formLoading}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          />

          <select 
            value={role} 
            onChange={e => setRole(e.target.value)} 
            disabled={!!editingUser || formLoading}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          >
            <option value="student">👨‍🎓 Student</option>
            <option value="instructor">👨‍🏫 Instructor</option>
            <option value="admin">👑 Admin</option>
          </select>

          {!editingUser && (
            <>
              <input
                type="password"
                placeholder="Password * (min 6 chars)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={formLoading}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              />

              <input
                type="password"
                placeholder="Confirm Password *"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={formLoading}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            </>
          )}
        </div>

        {/* Role-specific fields */}
        {role === 'instructor' && (
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '12px' }}>
            <input
              type="text"
              placeholder="Specialization * (e.g., Computer Science)"
              value={specialization}
              onChange={e => setSpecialization(e.target.value)}
              disabled={formLoading}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
            <textarea
              placeholder="Bio (optional)"
              value={bio}
              onChange={e => setBio(e.target.value)}
              disabled={formLoading}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minHeight: '42px', gridColumn: '1 / -1' }}
            />
          </div>
        )}

        {role === 'student' && (
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '12px' }}>
            <input
              type="text"
              placeholder="Guardian Name (optional)"
              value={guardianName}
              onChange={e => setGuardianName(e.target.value)}
              disabled={formLoading}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
            <input
              type="tel"
              placeholder="Guardian Phone (optional)"
              value={guardianPhone}
              onChange={e => setGuardianPhone(e.target.value)}
              disabled={formLoading}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
          </div>
        )}

        {role === 'admin' && (
          <div style={{ marginTop: '12px', padding: '12px', background: '#fff', borderRadius: '6px', border: '1px solid #ddd' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#666' }}>Permissions:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['view_dashboard', 'manage_users', 'manage_courses', 'manage_content', 'view_reports', 'system_maintenance'].map(perm => (
                <label key={perm} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={permissions.includes(perm)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPermissions([...permissions, perm]);
                      } else {
                        setPermissions(permissions.filter(p => p !== perm));
                      }
                    }}
                    disabled={formLoading}
                    style={{ marginRight: '4px' }}
                  />
                  <span style={{ fontSize: '0.85rem' }}>{perm.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          {editingUser ? (
            <>
              <button onClick={updateUser} className="btn-primary" disabled={formLoading}>
                {formLoading ? '⏳ Updating...' : '✓ Update User'}
              </button>
              <button onClick={resetForm} className="btn ghost" disabled={formLoading}>
                ✕ Cancel
              </button>
            </>
          ) : (
            <button onClick={addUser} className="btn-primary" disabled={formLoading}>
              {formLoading ? '⏳ Creating...' : '✓ Add User'}
            </button>
          )}
        </div>
      </div>

      <hr />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #ddd' }}>
        <button 
          className={activeTab === 'all' ? 'btn small' : 'btn ghost small'}
          onClick={() => setActiveTab('all')}
        >
          All ({users.length})
        </button>
        <button 
          className={activeTab === 'students' ? 'btn small' : 'btn ghost small'}
          onClick={() => setActiveTab('students')}
        >
          Students ({users.filter(u => u.role === 'student').length})
        </button>
        <button 
          className={activeTab === 'instructors' ? 'btn small' : 'btn ghost small'}
          onClick={() => setActiveTab('instructors')}
        >
          Instructors ({users.filter(u => u.role === 'instructor').length})
        </button>
        <button 
          className={activeTab === 'admins' ? 'btn small' : 'btn ghost small'}
          onClick={() => setActiveTab('admins')}
        >
          Admins ({users.filter(u => u.role === 'admin').length})
        </button>
      </div>

      {/* User Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Details</th>
              <th>Status</th>
              <th width="140">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                  <span className="muted">No users found</span>
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user._id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#666' }}>
                      {user.studentId || user.instructorId || user.adminId || '-'}
                    </span>
                  </td>
                  <td>
                    <strong>{user.firstName} {user.lastName}</strong>
                  </td>
                  <td style={{ fontSize: '0.9rem' }}>{user.email}</td>
                  <td style={{ fontSize: '0.9rem' }}>{user.phone || '-'}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '12px', 
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      background: user.role === 'admin' ? '#fef2f2' : user.role === 'instructor' ? '#f0fdf4' : '#f0f9ff',
                      color: user.role === 'admin' ? '#dc2626' : user.role === 'instructor' ? '#16a34a' : '#0284c7'
                    }}>
                      {user.role === 'admin' ? '👑 Admin' : user.role === 'instructor' ? '👨‍🏫 Instructor' : '👨‍🎓 Student'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#666' }}>
                    {user.role === 'instructor' && user.specialization && (
                      <span title="Specialization">📚 {user.specialization}</span>
                    )}
                    {user.role === 'student' && user.guardianName && (
                      <span title="Guardian">👪 {user.guardianName}</span>
                    )}
                    {user.role === 'admin' && user.permissions && (
                      <span title="Permissions">🔐 {user.permissions.length} perms</span>
                    )}
                    {!user.specialization && !user.guardianName && !user.permissions && '-'}
                  </td>
                  <td>
                    <span style={{ 
                      color: user.isActive ? '#16a34a' : '#dc2626',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}>
                      {user.isActive ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn ghost small" 
                      onClick={() => startEdit(user)}
                      style={{ marginRight: '4px', padding: '4px 8px', fontSize: '0.85rem' }}
                      title="Edit user"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="btn-danger small" 
                      onClick={() => deleteUser(user)}
                      style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                      title="Delete user"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={modal.isOpen} 
        onClose={() => setModal({ ...modal, isOpen: false })} 
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
}
