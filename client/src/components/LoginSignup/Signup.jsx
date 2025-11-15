import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { useRecaptcha } from "../../context/RecaptchaContext";
import { useGoogleAuth } from "../../context/GoogleAuthContext";

export default function Signup() {
  const { getRecaptchaToken } = useRecaptcha();
  const { handleGoogleSignIn } = useGoogleAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "student",
    // Student specific
    guardianName: "",
    guardianContact: "",
    // Instructor specific
    specialization: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    const { firstName, lastName, email, phone, password, confirmPassword, role } = form;

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
      alert("Please fill all required fields.");
      return false;
    }

    if (!password || !confirmPassword) {
      alert("Please enter password and confirm password.");
      return false;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return false;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return false;
    }

    // Role-specific validation
    if (role === "instructor" && !form.specialization.trim()) {
      alert("Specialization is required for instructors.");
      return false;
    }

    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { role, password, confirmPassword, ...userData } = form;
      
      // Get reCAPTCHA token first
      const recaptchaToken = await getRecaptchaToken('signup');
      
      let response;
      let userId;

      // Create user based on role (password and recaptchaToken included for auth creation)
      if (role === "student") {
        const studentData = {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          password: password,
          recaptchaToken: recaptchaToken,
          guardianName: userData.guardianName || undefined,
          guardianContact: userData.guardianContact || undefined,
        };
        response = await api.createStudent(studentData);
        userId = response.data._id;
      } else if (role === "instructor") {
        const instructorData = {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          password: password,
          recaptchaToken: recaptchaToken,
          specialization: userData.specialization,
          bio: userData.bio || "No bio provided",
          qualifications: [],
        };
        response = await api.createInstructor(instructorData);
        userId = response.data._id;
      } else if (role === "admin") {
        const adminData = {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          password: password,
          recaptchaToken: recaptchaToken,
          permissions: ["view_dashboard"],
        };
        response = await api.createAdmin(adminData);
        userId = response.data._id;
      }

      alert(`Account created successfully!\n\nEmail: ${userData.email}\nPassword: ${password}\n\nPlease save your credentials and login.`);
      
      // Reset form
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "student",
        guardianName: "",
        guardianContact: "",
        specialization: "",
        bio: "",
      });

      // Redirect to login
      setTimeout(() => navigate("/login"), 2000);

    } catch (error) {
      console.error("Signup error:", error);
      alert(error.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2>Create Account</h2>

        <form onSubmit={handleSignup}>
          {/* Role Selection */}
          <select 
            name="role" 
            value={form.role} 
            onChange={handleChange} 
            style={styles.input}
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
          </select>

          {/* Basic Information */}
          <div style={styles.row}>
            <input
              type="text"
              name="firstName"
              placeholder="First Name *"
              value={form.firstName}
              onChange={handleChange}
              style={{...styles.input, width: "48%"}}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name *"
              value={form.lastName}
              onChange={handleChange}
              style={{...styles.input, width: "48%"}}
              required
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email *"
            value={form.email}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number *"
            value={form.phone}
            onChange={handleChange}
            style={styles.input}
            required
          />

          {/* Password Fields */}
          <input
            type="password"
            name="password"
            placeholder="Password (min 6 characters) *"
            value={form.password}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password *"
            value={form.confirmPassword}
            onChange={handleChange}
            style={styles.input}
            required
          />

          {/* Student Specific Fields */}
          {form.role === "student" && (
            <>
              <input
                type="text"
                name="guardianName"
                placeholder="Guardian Name (optional)"
                value={form.guardianName}
                onChange={handleChange}
                style={styles.input}
              />
              <input
                type="tel"
                name="guardianContact"
                placeholder="Guardian Contact (optional)"
                value={form.guardianContact}
                onChange={handleChange}
                style={styles.input}
              />
            </>
          )}

          {/* Instructor Specific Fields */}
          {form.role === "instructor" && (
            <>
              <input
                type="text"
                name="specialization"
                placeholder="Specialization *"
                value={form.specialization}
                onChange={handleChange}
                style={styles.input}
                required
              />
              <textarea
                name="bio"
                placeholder="Bio (optional)"
                value={form.bio}
                onChange={handleChange}
                style={{...styles.input, minHeight: "60px"}}
              />
            </>
          )}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>OR</span>
        </div>

        {/* <button onClick={handleGoogleSignIn} style={styles.googleButton} disabled={loading}>
          <svg style={styles.googleIcon} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign up with Google
        </button> */}

        <p style={{ marginTop: "15px", fontSize: "14px" }}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Segoe UI', sans-serif",
    padding: "20px",
  },
  container: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "15px",
    boxShadow: "0 0 20px rgba(0,0,0,0.3)",
    width: "400px",
    maxWidth: "100%",
    textAlign: "center",
    marginTop: "20px",
    marginBottom: "20px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
  },
  input: {
    width: "100%",
    padding: "12px",
    margin: "8px 0",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  button: {
    backgroundColor: "#667eea",
    color: "white",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    width: "100%",
    marginTop: "10px",
    fontWeight: "bold",
    fontSize: "14px",
    transition: "0.3s",
  },
  link: {
    color: "#667eea",
    textDecoration: "none",
    fontWeight: "bold",
  },
  divider: {
    margin: "20px 0",
    textAlign: "center",
    position: "relative",
  },
  dividerText: {
    background: "#fff",
    padding: "0 10px",
    color: "#999",
    fontSize: "12px",
    position: "relative",
    zIndex: 1,
  },
  googleButton: {
    backgroundColor: "#fff",
    color: "#444",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    cursor: "pointer",
    width: "100%",
    fontWeight: "500",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    transition: "0.3s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  googleIcon: {
    width: "20px",
    height: "20px",
  }
};
