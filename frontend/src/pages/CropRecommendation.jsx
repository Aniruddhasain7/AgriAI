import { useState } from "react";
import { api } from "../api/client";
import {
  Sprout,
  Layers,
  TestTube,
  FlaskConical,
  Thermometer,
  Droplets,
  Info,
  CloudRain,
  RefreshCw,
  AlertTriangle,
  Award,
  Sparkles,
  BarChart3,
} from "lucide-react";

export default function CropRecommendation() {
  const [form, setForm] = useState({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    temperature: "",
    humidity: "",
    ph: "",
    rainfall: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const missingFields = Object.keys(form).filter((k) => !form[k]);
    if (missingFields.length > 0) {
      setError(`Please fill in all parameters: ${missingFields.join(", ")}`);
      setLoading(false);
      return;
    }

    try {
      const numericForm = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, Number(v)]),
      );
      const data = await api.recommendCrop(numericForm);
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto" }}>
      <div className="page-header">
        <div className="page-badge">
          <Sprout size={14} />
          <span>Optimal Crop Matcher</span>
        </div>
        <h1 className="page-title">Smart Crop Recommendation</h1>
        <p className="page-subtitle">
          Input your soil nutrients and local environmental conditions to find the highest-yielding crop for your land.
        </p>
      </div>

      <div className="glass-card">
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
            }}
          >
            <div className="form-group">
              <label className="form-label">
                <Layers size={16} style={{ color: "var(--primary-500)" }} />
                Nitrogen (N)
              </label>
              <div className="input-wrapper">
                <Layers size={18} className="input-icon" />
                <input
                  name="nitrogen"
                  type="number"
                  className="form-input input-with-icon"
                  placeholder="e.g. 90"
                  value={form.nitrogen}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <TestTube size={16} style={{ color: "#3b82f6" }} />
                Phosphorus (P)
              </label>
              <div className="input-wrapper">
                <TestTube size={18} className="input-icon" />
                <input
                  name="phosphorus"
                  type="number"
                  className="form-input input-with-icon"
                  placeholder="e.g. 42"
                  value={form.phosphorus}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <FlaskConical size={16} style={{ color: "#f59e0b" }} />
                Potassium (K)
              </label>
              <div className="input-wrapper">
                <FlaskConical size={18} className="input-icon" />
                <input
                  name="potassium"
                  type="number"
                  className="form-input input-with-icon"
                  placeholder="e.g. 43"
                  value={form.potassium}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Thermometer size={16} style={{ color: "#ef4444" }} />
                Temperature (°C)
              </label>
              <div className="input-wrapper">
                <Thermometer size={18} className="input-icon" />
                <input
                  name="temperature"
                  type="number"
                  step="0.1"
                  className="form-input input-with-icon"
                  placeholder="e.g. 20.8"
                  value={form.temperature}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Droplets size={16} style={{ color: "#0ea5e9" }} />
                Humidity (%)
              </label>
              <div className="input-wrapper">
                <Droplets size={18} className="input-icon" />
                <input
                  name="humidity"
                  type="number"
                  step="0.1"
                  className="form-input input-with-icon"
                  placeholder="e.g. 82.0"
                  value={form.humidity}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Info size={16} style={{ color: "var(--accent-lime)" }} />
                Soil pH
              </label>
              <div className="input-wrapper">
                <Info size={18} className="input-icon" />
                <input
                  name="ph"
                  type="number"
                  step="0.1"
                  className="form-input input-with-icon"
                  placeholder="e.g. 6.5"
                  value={form.ph}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <CloudRain size={16} style={{ color: "var(--primary-400)" }} />
                Annual Rainfall (mm)
              </label>
              <div className="input-wrapper">
                <CloudRain size={18} className="input-icon" />
                <input
                  name="rainfall"
                  type="number"
                  step="0.1"
                  className="form-input input-with-icon"
                  placeholder="e.g. 202.9"
                  value={form.rainfall}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: "24px" }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw size={18} className="spinner" />
                  <span>Evaluating Crop Suitability...</span>
                </>
              ) : (
                <>
                  <Sprout size={18} />
                  <span>Recommend Optimal Crop</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="alert-box alert-error" style={{ marginTop: "24px" }}>
            <AlertTriangle size={20} />
            <div>
              <strong>Evaluation Error</strong>
              <p style={{ fontSize: "13px" }}>{error}</p>
            </div>
          </div>
        )}

        {result && result.recommended_crop && (
          <div style={{ marginTop: "36px", display: "flex", flexDirection: "column", gap: "24px" }}>
            <div
              className="glass-card hero-card"
              style={{
                padding: "32px 28px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--primary-500)",
                position: "relative",
                overflow: "hidden",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "var(--primary-500)",
                    fontWeight: 700,
                    fontSize: "14.5px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  <Award size={20} />
                  <span>#1 Optimal Match Recommended</span>
                </div>

                {result.confidence != null && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "rgba(16, 185, 129, 0.15)",
                      color: "var(--primary-500)",
                      padding: "6px 14px",
                      borderRadius: "var(--radius-full)",
                      fontWeight: 700,
                      fontSize: "14px",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    <Sparkles size={16} />
                    <span>{result.confidence}% Match Confidence</span>
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  margin: "8px 0 12px 0",
                }}
              >
                <div
                  style={{
                    fontSize: "36px",
                    background: "rgba(16, 185, 129, 0.1)",
                    width: "68px",
                    height: "68px",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    color: "var(--primary-500)",
                  }}
                >
                  <Sprout size={36} />
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: "38px",
                      fontWeight: 800,
                      textTransform: "capitalize",
                      color: "var(--text-main)",
                      margin: 0,
                      lineHeight: 1.1,
                    }}
                  >
                    {result.recommended_crop}
                  </h2>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "var(--text-muted)",
                      fontWeight: 500,
                    }}
                  >
                    Highest predicted suitability for your soil and weather profile
                  </span>
                </div>
              </div>
            </div>

            {result.top_recommendations && result.top_recommendations.length > 0 && (
              <div
                className="glass-card"
                style={{
                  padding: "24px 28px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <BarChart3 size={20} style={{ color: "var(--primary-500)" }} />
                  <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
                    Top 3 Crop Suitability Ranking
                  </h3>
                </div>
                <p style={{ fontSize: "13.5px", color: "var(--text-muted)", marginBottom: "20px" }}>
                  AI machine learning model probability distribution for your soil nutrient (N-P-K) and climatic conditions:
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {result.top_recommendations.map((item, idx) => {
                    const rankThemes = [
                      { badge: "var(--primary-500)", bg: "rgba(16, 185, 129, 0.12)", border: "rgba(16, 185, 129, 0.35)", bar: "var(--primary-500)" },
                      { badge: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)", border: "rgba(59, 130, 246, 0.25)", bar: "#3b82f6" },
                      { badge: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", border: "rgba(245, 158, 11, 0.25)", bar: "#f59e0b" },
                    ];
                    const currentTheme = rankThemes[idx] || rankThemes[2];
                    const rankLabel = idx === 0 ? "Best Match" : idx === 1 ? "Strong Alternative" : "Viable Alternative";

                    return (
                      <div
                        key={idx}
                        style={{
                          padding: "16px 20px",
                          borderRadius: "var(--radius-sm)",
                          background: currentTheme.bg,
                          border: `1px solid ${currentTheme.border}`,
                          transition: "all 0.2s ease",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: "8px",
                            marginBottom: "8px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "26px",
                                height: "26px",
                                borderRadius: "50%",
                                background: currentTheme.badge,
                                color: "#ffffff",
                                fontSize: "13px",
                                fontWeight: 800,
                              }}
                            >
                              {idx + 1}
                            </span>
                            <div>
                              <span
                                style={{
                                  fontSize: "16px",
                                  fontWeight: 700,
                                  textTransform: "capitalize",
                                  color: "var(--text-main)",
                                }}
                              >
                                {item.crop}
                              </span>
                              <span
                                style={{
                                  marginLeft: "8px",
                                  fontSize: "12px",
                                  color: "var(--text-muted)",
                                  fontWeight: 500,
                                }}
                              >
                                ({rankLabel})
                              </span>
                            </div>
                          </div>

                          <div
                            style={{
                              fontSize: "15px",
                              fontWeight: 800,
                              color: currentTheme.badge,
                            }}
                          >
                            {item.probability}%
                          </div>
                        </div>

                        <div
                          style={{
                            height: "8px",
                            width: "100%",
                            borderRadius: "var(--radius-full)",
                            background: "rgba(0, 0, 0, 0.08)",
                            overflow: "hidden",
                            marginTop: "6px",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${Math.max(item.probability, 1.5)}%`,
                              background: currentTheme.bar,
                              borderRadius: "var(--radius-full)",
                              transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
