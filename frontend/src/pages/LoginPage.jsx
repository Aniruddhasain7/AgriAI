import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { api } from "../api/client";
import heroImg from "../assets/hero.jpg";
import LoadingPage from "./LoadingPage";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAlreadyAuth] = useState(() => {
    const token = localStorage.getItem("agriai_token");
    const user = localStorage.getItem("agriai_user");
    return Boolean(token && user);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await api.login({
        email: form.email,
        password: form.password,
      });

      if (data.error) throw new Error(data.error);

      localStorage.setItem("agriai_token", data.token);
      localStorage.setItem("agriai_user", JSON.stringify(data.user));

      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 300);
    } catch (err) {
      setLoading(false);
      setError(err.message || "Failed to log in. Please check your credentials.");
    }
  };

  if (isAlreadyAuth) {
    return (
      <LoadingPage
        title="AgriAI"
        message="You are already logged in. Loading your dashboard..."
        redirectTo="/dashboard"
        duration={500}
      />
    );
  }

  if (loading) {
    return (
      <LoadingPage
        title="AgriAI"
        message="Authenticating your account... Please wait"
      />
    );
  }


  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "20px auto 0",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
        gap: "32px",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "left" }}>
        <div className="page-badge">
          <ShieldCheck size={14} />
          <span>Secure Smart Farming Portal</span>
        </div>
        <h1
          style={{
            fontSize: "36px",
            fontWeight: 800,
            marginBottom: "16px",
            lineHeight: 1.2,
          }}
        >
          Welcome Back to <span style={{ color: "var(--primary-500)" }}>AgriAI</span>
        </h1>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "16px",
            marginBottom: "28px",
            lineHeight: 1.6,
          }}
        >
          Access your farm analytics, disease scanner history, live weather advisories, and AI recommendations.
        </p>

        <div
          style={{
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <img
            src={heroImg}
            alt="AgriAI Farm"
            style={{ width: "100%", maxHeight: "240px", objectFit: "cover" }}
          />
        </div>
      </div>

      <div className="glass-card" style={{ padding: "36px" }}>
        <h2 style={{ fontSize: "24px", marginBottom: "8px", textAlign: "left" }}>
          Account Login
        </h2>
        <p
          style={{
            fontSize: "14px",
            color: "var(--text-muted)",
            marginBottom: "24px",
            textAlign: "left",
          }}
        >
          Enter your registered email and password to log in.
        </p>

        {error && (
          <div className="alert-box alert-error" style={{ marginBottom: "20px", marginTop: "0" }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <Mail size={16} /> Email Address
            </label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                required
                className="form-input input-with-icon"
                placeholder="farmer@agriai.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={16} /> Password
            </label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                required
                className="form-input input-with-icon input-with-action"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "12px" }}>
            <span>Log In to Portal</span>
            <LogIn size={18} />
          </button>
        </form>

        <div
          style={{
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid var(--border-color)",
            textAlign: "center",
            fontSize: "14px",
            color: "var(--text-muted)",
          }}
        >
          Don&apos;t have an account yet?{" "}
          <Link
            to="/signup"
            style={{
              color: "var(--primary-500)",
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>Sign Up Free</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
