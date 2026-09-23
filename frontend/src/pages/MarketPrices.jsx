import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import {
  RefreshCw,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Sparkles,
  ShieldCheck,
  SendHorizonal,
} from "lucide-react";

const CROPS = [
  { id: "rice", name: "Rice", icon: "🌾", category: "Cereal" },
  { id: "wheat", name: "Wheat", icon: "🌾", category: "Cereal" },
  { id: "maize", name: "Maize", icon: "🌽", category: "Cereal" },
  { id: "cotton", name: "Cotton", icon: "🧵", category: "Cash Crop" },
  { id: "sugarcane", name: "Sugarcane", icon: "🎋", category: "Cash Crop" },
  { id: "soybean", name: "Soybean", icon: "🌱", category: "Oilseed" },
  { id: "mustard", name: "Mustard", icon: "🌼", category: "Oilseed" },
  { id: "gram", name: "Gram", icon: "🫘", category: "Pulse" },
  { id: "groundnut", name: "Groundnut", icon: "🥜", category: "Oilseed" },
  { id: "potato", name: "Potato", icon: "🥔", category: "Vegetable" },
  { id: "onion", name: "Onion", icon: "🧅", category: "Vegetable" },
  { id: "tomato", name: "Tomato", icon: "🍅", category: "Vegetable" },
];

const QUICK_QUESTIONS = [
  "Should I sell now or wait?",
  "What is MSP and how does it protect me?",
  "Which mandi offers the best price?",
  "Will prices rise in the next few days?",
];

export default function MarketPrices() {
  const { t, i18n } = useTranslation();
  const [crop, setCrop] = useState("rice");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const inputRef = useRef(null);

  const langMap = { en: "English", hi: "Hindi", bn: "Bengali" };
  const lang = langMap[i18n.language] || "English";

  const fetchData = async (selectedCrop = crop) => {
    setLoading(true);
    setError("");
    setResult(null);
    setAiAnswer("");
    try {
      const data = await api.getMarketTrend(selectedCrop, lang);
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to fetch market data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    api.getMarketTrend(crop, lang)
      .then((data) => {
        if (ignore) return;
        if (data.error) throw new Error(data.error);
        setResult(data);
      })
      .catch((err) => {
        if (!ignore) setError(err.message || "Failed to fetch market data");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [crop, lang]);

  const handleCropSelect = (id) => {
    if (id !== crop) setCrop(id);
  };

  const handleAsk = async (q = question) => {
    const query = q.trim();
    if (!query) return;
    setAiLoading(true);
    setAiError("");
    setAiAnswer("");
    try {
      const data = await api.askMarketQuestion(crop, query, lang);
      if (data.error) throw new Error(data.error);
      setAiAnswer(data.reply || "");
    } catch (err) {
      setAiError(err.message || "AI service unavailable.");
    } finally {
      setAiLoading(false);
    }
  };

  const selectedCropObj = CROPS.find((c) => c.id === crop) || CROPS[0];
  const trend = result?.last_7_day_trend || [];
  const dates = result?.last_7_day_dates || [];
  const maxVal = trend.length ? Math.max(...trend) : 1;
  const minVal = trend.length ? Math.min(...trend) : 0;
  const todayPrice = result?.today_price ?? 0;
  const msp = result?.msp ?? 0;
  const mspDiff = result?.msp_diff ?? 0;
  const mspPct = result?.msp_pct ?? 0;
  const change7d = result?.change_7d_pct ?? 0;
  const isUp = change7d >= 0;
  const aboveMsp = mspDiff >= 0;

  return (
    <div className="market-page-container">
      <div className="page-header">
        <div className="page-badge">
          <Sparkles size={14} />
          <span>{t("market.badge", "Mandi Market Prices")}</span>
        </div>
        <h1 className="page-title">
          {t("market.title", "Commodity Market Prices")}
        </h1>
        <p className="page-subtitle">
          {t(
            "market.subtitle",
            "Live APMC mandi spot rates, 7-day price trends, MSP comparison, and AI selling advice for Indian farmers.",
          )}
        </p>
      </div>

      <div className="glass-card market-card" style={{ marginBottom: 20 }}>
        <label
          className="form-label"
          style={{
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>🌿</span>
          <span>{t("market.select_crop", "Select Commodity")}</span>
        </label>
        <div className="commodity-chips-wrapper">
          {CROPS.map((c) => {
            const active = crop === c.id;
            return (
              <button
                key={c.id}
                onClick={() => handleCropSelect(c.id)}
                className={`commodity-chip ${active ? "active" : ""}`}
              >
                <span className="commodity-chip-icon">{c.icon}</span>
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>

        <div className="selected-commodity-banner">
          <div className="selected-commodity-main">
            <span className="selected-commodity-icon-box">
              {selectedCropObj.icon}
            </span>
            <div className="selected-commodity-text">
              <div className="selected-commodity-label">
                {t("market.selected_commodity", "Selected Commodity")}
              </div>
              <div className="selected-commodity-name">
                <span>{selectedCropObj.name}</span>
                {result?.crop_display_name && (
                  <span className="selected-commodity-subname">
                    ({result.crop_display_name})
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="selected-commodity-tag-box">
            <span className="selected-commodity-category">
              {selectedCropObj.category}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 16,
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <button
            onClick={() => fetchData(crop)}
            className="btn-primary"
            disabled={loading}
            style={{ width: "auto", padding: "9px 20px" }}
          >
            {loading ? (
              <>
                <RefreshCw size={15} className="spinner" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <RefreshCw size={15} />
                <span>Refresh</span>
              </>
            )}
          </button>
          {result?.timestamp && (
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Updated {result.timestamp}
            </span>
          )}
        </div>

        {error && (
          <div className="alert-box alert-error" style={{ marginTop: 14 }}>
            <AlertTriangle size={18} />
            <div>
              <strong>Error</strong>
              <p style={{ fontSize: 13 }}>{error}</p>
            </div>
          </div>
        )}
      </div>

      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="market-price-cards">
            <div
              className="glass-card market-card"
              style={{ borderLeft: "4px solid var(--primary-500)" }}
            >
              <div className="market-card-top-row">
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                  }}
                >
                  Today's Mandi Price
                </span>
                <span className="market-card-crop-badge">
                  {selectedCropObj.icon} {selectedCropObj.name}
                </span>
              </div>
              <div
                style={{
                  fontSize: "clamp(24px, 5vw, 30px)",
                  fontWeight: 800,
                  color: "var(--text-main)",
                }}
              >
                ₹{todayPrice.toLocaleString("en-IN")}
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 400,
                    color: "var(--text-muted)",
                    marginLeft: 5,
                  }}
                >
                  /qtl
                </span>
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  color: isUp ? "#10b981" : "#ef4444",
                }}
              >
                {isUp ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownRight size={14} />
                )}
                <span>
                  {isUp ? "+" : ""}
                  {change7d}% over 7 days
                </span>
              </div>
            </div>

            <div
              className="glass-card market-card"
              style={{
                borderLeft: `4px solid ${aboveMsp ? "#10b981" : "#ef4444"}`,
              }}
            >
              <div className="market-card-top-row">
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                  }}
                >
                  Govt. MSP Benchmark
                </span>
                <span className="market-card-crop-badge">
                  {selectedCropObj.icon} {selectedCropObj.name}
                </span>
              </div>
              <div
                style={{
                  fontSize: "clamp(24px, 5vw, 30px)",
                  fontWeight: 800,
                  color: "var(--text-main)",
                }}
              >
                ₹{msp.toLocaleString("en-IN")}
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 400,
                    color: "var(--text-muted)",
                    marginLeft: 5,
                  }}
                >
                  /qtl
                </span>
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  color: aboveMsp ? "#10b981" : "#ef4444",
                }}
              >
                {aboveMsp
                  ? `+₹${Math.round(mspDiff)} above MSP (+${mspPct}%)`
                  : `₹${Math.abs(Math.round(mspDiff))} below MSP (${mspPct}%)`}
              </div>
            </div>
          </div>

          {result.ai_advisory && (
            <div
              className="glass-card market-card"
              style={{
                borderLeft: "4px solid var(--primary-500)",
                background:
                  "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, var(--bg-card) 100%)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ShieldCheck
                  size={19}
                  style={{ color: "var(--primary-500)", flexShrink: 0 }}
                />
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 14,
                    color: "var(--text-main)",
                  }}
                >
                  AI Farmer Advisory
                </span>
              </div>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: "var(--text-muted)",
                  margin: 0,
                }}
              >
                {result.ai_advisory}
              </p>
            </div>
          )}

          <div className="glass-card" style={{ padding: 20 }}>
            <div className="market-trend-header">
              <h3 className="market-trend-title">
                <span>📈</span>
                <span>{t("market.price_trend", "7-Day Price Trend")}</span>
              </h3>
              <div className="market-trend-crop-badge">
                <span>{selectedCropObj.icon}</span>
                <span>{selectedCropObj.name}</span>
                {result?.crop_display_name && (
                  <span className="market-trend-crop-subname">
                    ({result.crop_display_name})
                  </span>
                )}
              </div>
            </div>
            <div
              style={{
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
                width: "100%",
                maxWidth: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 6,
                  height: 160,
                  minWidth: "280px",
                  background: "var(--bg-input)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)",
                  padding: "16px 12px 12px",
                }}
              >
                {trend.map((val, idx) => {
                  const range = Math.max(1, maxVal - minVal);
                  const heightPct = Math.min(
                    90,
                    Math.max(15, ((val - minVal) / range) * 70 + 15),
                  );
                  const isLatest = idx === trend.length - 1;
                  const dateLabel = dates[idx]
                    ? dates[idx].slice(5)
                    : `D${idx + 1}`;
                  return (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        height: "100%",
                        justifyContent: "flex-end",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: isLatest ? 800 : 500,
                          color: isLatest
                            ? "var(--primary-400)"
                            : "var(--text-muted)",
                          marginBottom: 4,
                          textAlign: "center",
                          lineHeight: 1.1,
                          whiteSpace: "nowrap",
                        }}
                      >
                        ₹{Math.round(val).toLocaleString("en-IN")}
                      </span>
                      <div
                        style={{
                          width: "70%",
                          height: `${heightPct}%`,
                          background: isLatest
                            ? "linear-gradient(180deg, #34d399 0%, #059669 100%)"
                            : "linear-gradient(180deg, var(--primary-500) 0%, var(--primary-700, #047857) 100%)",
                          borderRadius: "4px 4px 0 0",
                          boxShadow: isLatest
                            ? "0 0 10px rgba(16,185,129,0.4)"
                            : "none",
                          transition: "height 0.35s ease",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 9,
                          color: isLatest
                            ? "var(--primary-400)"
                            : "var(--text-muted)",
                          marginTop: 5,
                          fontWeight: isLatest ? 700 : 400,
                        }}
                      >
                        {isLatest ? "Today" : dateLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
                marginTop: 14,
              }}
            >
              {[
                {
                  label: "7-Day High",
                  val: `₹${maxVal.toLocaleString("en-IN")}`,
                  color: "#10b981",
                },
                {
                  label: "7-Day Low",
                  val: `₹${minVal.toLocaleString("en-IN")}`,
                  color: "#ef4444",
                },
                {
                  label: "7-Day Avg",
                  val: `₹${Math.round(trend.reduce((a, b) => a + b, 0) / trend.length).toLocaleString("en-IN")}`,
                  color: "var(--text-main)",
                },
              ].map(({ label, val, color }) => (
                <div
                  key={label}
                  style={{
                    background: "var(--bg-input)",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      fontWeight: 600,
                      display: "block",
                      marginBottom: 3,
                    }}
                  >
                    {label}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 800, color }}>
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {result.mandi_rates?.length > 0 && (
            <div className="glass-card market-card">
              <div className="market-section-header">
                <h3 className="market-section-title">
                  <Building2 size={16} style={{ color: "var(--primary-500)" }} />
                  Regional APMC Mandi Rates
                </h3>
                <span className="market-card-crop-pill">
                  {selectedCropObj.icon} {selectedCropObj.name}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.mandi_rates.map((m, idx) => {
                  const diffFromToday = m.modal_price - todayPrice;
                  const isHigher = diffFromToday >= 0;
                  return (
                    <div key={idx} className="mandi-rate-card">
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 13,
                            color: "var(--text-main)",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Building2
                            size={13}
                            style={{
                              color: "var(--primary-500)",
                              flexShrink: 0,
                            }}
                          />
                          <span>{m.mandi}</span>
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--text-muted)",
                            marginTop: 2,
                          }}
                        >
                          {m.state} · {m.variety}
                        </div>
                      </div>
                      <div
                        className="mandi-rate-arrivals"
                        style={{
                          textAlign: "right",
                          fontSize: 11,
                          color: "var(--text-muted)",
                        }}
                      >
                        {m.arrivals_tonnes?.toLocaleString("en-IN")} T arrivals
                      </div>
                      <div
                        className="mandi-rate-price"
                        style={{ textAlign: "right" }}
                      >
                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: 14,
                            color: isHigher ? "#10b981" : "#ef4444",
                          }}
                        >
                          ₹{m.modal_price?.toLocaleString("en-IN")}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: isHigher ? "#10b981" : "#ef4444",
                            fontWeight: 600,
                          }}
                        >
                          {isHigher
                            ? `+₹${Math.round(diffFromToday)}`
                            : `₹${Math.round(diffFromToday)}`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginTop: 10,
                  margin: "10px 0 0",
                }}
              >
                Prices in ₹ per quintal · Source: APMC Reference Rates
              </p>
            </div>
          )}

          <div className="glass-card market-card">
            <h3
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--text-main)",
                marginBottom: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Sparkles size={16} style={{ color: "var(--primary-500)" }} />
              Ask AI About {selectedCropObj.name} Price
            </h3>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 14,
              }}
            >
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setQuestion(q);
                    handleAsk(q);
                  }}
                  disabled={aiLoading}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 20,
                    border: "1px solid var(--border-color)",
                    background: "var(--bg-input)",
                    color: "var(--text-main)",
                    fontSize: 12,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="ask-ai-input-row">
              <input
                ref={inputRef}
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                placeholder={`Ask anything about ${selectedCropObj.name} price...`}
                className="form-input"
                style={{ fontSize: 13, padding: "10px 14px" }}
              />
              <button
                onClick={() => handleAsk()}
                className="btn-primary"
                disabled={aiLoading || !question.trim()}
                style={{ width: "auto", padding: "10px 16px", flexShrink: 0 }}
              >
                {aiLoading ? (
                  <RefreshCw size={15} className="spinner" />
                ) : (
                  <SendHorizonal size={15} />
                )}
              </button>
            </div>

            {aiAnswer && (
              <div
                style={{
                  marginTop: 14,
                  padding: "14px 16px",
                  background:
                    "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, var(--bg-input) 100%)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid rgba(16,185,129,0.25)",
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: "var(--text-main)",
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    display: "block",
                    marginBottom: 6,
                    color: "var(--primary-400)",
                    fontSize: 12,
                  }}
                >
                  🤖 AgriAI says:
                </span>
                {aiAnswer}
              </div>
            )}

            {aiError && (
              <div className="alert-box alert-error" style={{ marginTop: 12 }}>
                <AlertTriangle size={16} />
                <span style={{ fontSize: 13 }}>{aiError}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
