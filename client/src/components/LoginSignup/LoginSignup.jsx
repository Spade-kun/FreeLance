import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function LoginSignup() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // LocalStorage Helpers
  const getUsers = () => JSON.parse(localStorage.getItem("users_db")) || [];
  const saveUsers = (users) => localStorage.setItem("users_db", JSON.stringify(users));

  // Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Signup Handler (Note: Use admin panel to create users with proper data)
  const handleSignup = (e) => {
    e.preventDefault();
    alert("Please contact your administrator to create an account.\n\nFor testing, use:\nEmail: admin@lms.com\nPassword: Admin@123");
  };

  // Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = form;

    if (!email.trim() || !password.trim()) {
      alert("Please fill all fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.login(email.trim(), password.trim());
      
      if (response.success) {
        const user = response.data.user;
        alert(`Welcome back, ${user.firstName || user.email}!`);

        // Redirect based on role
        if (user.role === "admin") navigate("/admin");
        else if (user.role === "instructor") navigate("/instructor");
        else navigate("/student");
      }
    } catch (error) {
      alert(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2>{isLogin ? "Login" : "Create Account"}</h2>

        <form onSubmit={isLogin ? handleLogin : handleSignup}>
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              style={styles.input}
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            style={styles.input}
          />

          {!isLogin && (
            <select name="role" value={form.role} onChange={handleChange} style={styles.input}>
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          )}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
          </button>
        </form>

        <p style={{ marginTop: "15px" }}>
          {isLogin ? (
            <>
              Don’t have an account?{" "}
              <span style={styles.link} onClick={() => setIsLogin(false)}>
                Sign up
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span style={styles.link} onClick={() => setIsLogin(true)}>
                Login
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

// CSS in JS
const styles = {
  page: {
    height: "100vh",
    background: "linear-gradient(135deg, #303133, #303133)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Segoe UI', sans-serif",
  },
  container: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "15px",
    boxShadow: "0 0 15px rgba(0,0,0,0.2)",
    width: "350px",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "8px 0",
    border: "1px solid #ccc",
    borderRadius: "8px",
  },
  button: {
    backgroundColor: "#5563DE",
    color: "white",
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    width: "100%",
    marginTop: "10px",
    fontWeight: "bold",
    transition: "0.3s",
  },
  link: {
    color: "#5563DE",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
