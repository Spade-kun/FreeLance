import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { useRecaptcha } from "../../context/RecaptchaContext";
import { useGoogleAuth } from "../../context/GoogleAuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getRecaptchaToken } = useRecaptcha();
  const { handleGoogleSignIn } = useGoogleAuth();

  // Show error message from URL params
  useEffect(() => {
    const error = searchParams.get('error');
    
    if (error) {
      let message = 'Authentication failed. Please try again.';
      
      if (error === 'user_not_found') {
        message = '⚠️ No account found with this email. Please contact your administrator.';
      } else if (error === 'auth_failed') {
        message = '❌ Google authentication failed. Please try again.';
      }
      
      setErrorMessage(message);
      
      // Clear error message after 5 seconds
      setTimeout(() => setErrorMessage(""), 5000);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = form;

    if (!email.trim() || !password.trim()) {
      alert("Please fill all fields.");
      return;
    }

    setLoading(true);

    try {
      // Get reCAPTCHA token
      const recaptchaToken = await getRecaptchaToken('login');
      
      const response = await api.login(email.trim(), password.trim(), recaptchaToken);
      
      if (response.success) {
        const user = response.data.user;
        alert(`Welcome back, ${user.firstName || user.email}!`);

        // Redirect based on role
        if (user.role === "admin") navigate("/admin/dashboard");
        else if (user.role === "instructor") navigate("/instructor/dashboard");
        else navigate("/student");
      }
    } catch (error) {
      alert(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    handleGoogleSignIn();
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2>Login</h2>

        {errorMessage && (
          <div style={styles.errorMessage}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Please wait..." : "Login"}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>OR</span>
        </div>

        <button onClick={handleGoogleLogin} style={styles.googleButton} disabled={loading}>
          <svg style={styles.googleIcon} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>

        <p style={{ marginTop: "15px" }}>
          Don't have an account?{" "}
          <Link to="/signup" style={styles.link}>
            Sign up
          </Link>
        </p>

        {/* <div style={styles.testCredentials}>
          <p style={{ fontSize: "12px", color: "#666", marginTop: "20px" }}>
            <strong>Test Credentials:</strong>
          </p>
          <p style={{ fontSize: "11px", color: "#888" }}>
            Admin: admin@lms.com / Admin@123<br/>
            Student: juan.delacruz@student.lms.com / Student@123
          </p>
        </div> */}
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Segoe UI', sans-serif",
  },
  container: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "15px",
    boxShadow: "0 0 20px rgba(0,0,0,0.3)",
    width: "350px",
    textAlign: "center",
  },
  errorMessage: {
    backgroundColor: "#ffebee",
    color: "#c62828",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "15px",
    fontSize: "14px",
    border: "1px solid #ef5350",
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
  testCredentials: {
    marginTop: "20px",
    padding: "10px",
    background: "#f5f5f5",
    borderRadius: "8px",
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
