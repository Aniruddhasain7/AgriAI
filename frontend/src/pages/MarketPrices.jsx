import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import {
  LineChart,
  Coins,
  RefreshCw,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Sparkles,
  Info,
  ShieldCheck,
  Building2,
  Activity,
  Search,
  Compass,
} from "lucide-react";

const CROPS = [
  { id: "rice", name: "Rice / Paddy", icon: "🌾", category: "Cereal" },
  { id: "wheat", name: "Wheat", icon: "🌾", category: "Cereal" },
  { id: "maize", name: "Maize", icon: "🌽", category: "Cereal" },
  { id: "cotton", name: "Cotton", icon: "🧵", category: "Cash Crop" },
  { id: "sugarcane", name: "Sugarcane", icon: "🎋", category: "Cash Crop" },
  { id: "soybean", name: "Soybean", icon: "🌱", category: "Oilseed" },
  { id: "mustard", name: "Mustard Seed", icon: "🌼", category: "Oilseed" },
  { id: "gram", name: "Gram / Chana", icon: "🫘", category: "Pulse" },
  { id: "groundnut", name: "Groundnut", icon: "🥜", category: "Oilseed" },
  { id: "potato", name: "Potato", icon: "🥔", category: "Vegetable" },
  { id: "onion", name: "Onion", icon: "🧅", category: "Vegetable" },
  { id: "tomato", name: "Tomato", icon: "🍅", category: "Vegetable" },
];

function formatDateLabel(dateStr, isToday = false) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleDateString("en-US", { month: "short" });
    return isToday ? `${day} ${month} (Today)` : `${day} ${month}`;
  } catch {
    return dateStr;
  }
}

export default function MarketPrices() {
  const { t } = useTranslation();
  const [crop, setCrop] = useState("rice");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDayIdx, setSelectedDayIdx] = useState(6);
  const [mandiFilter, setMandiFilter] = useState("");
  const [activeTab, setActiveTab] = useState("chart");

  const handleFetch = async (selectedCrop = crop) => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getMarketTrend(selectedCrop);
      if (data.error) throw new Error(data.error);
      setResult(data);
      setSelectedDayIdx(
        data.last_7_day_trend ? data.last_7_day_trend.length - 1 : 6,
      );
    } catch (err) {
      setError(err.message || "Failed to fetch market data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetch(crop);
  }, [crop]);

  const handleCropSelect = (cId) => {
    if (cId === crop) return;
    setCrop(cId);
  };

  const trend = result?.last_7_day_trend || [];
  const dates = result?.last_7_day_dates || [];
  const maxVal = trend.length ? Math.max(...trend) : 0;
  const minVal = trend.length ? Math.min(...trend) : 0;
  const avgVal = trend.length
    ? Math.round((trend.reduce((a, b) => a + b, 0) / trend.length) * 100) / 100
    : 0;
  const latestPrice = trend.length ? trend[trend.length - 1] : 0;
  const predictedPrice = result?.predicted_next_day ?? 0;
  const priceDiff = latestPrice > 0 ? predictedPrice - latestPrice : 0;
  const percentChange =
    latestPrice > 0 ? ((priceDiff / latestPrice) * 100).toFixed(2) : "0.00";
  const isPositiveTrend = priceDiff >= 0;

  const activeVal = trend[selectedDayIdx] ?? latestPrice;
  const prevVal = selectedDayIdx > 0 ? trend[selectedDayIdx - 1] : trend[0];
  const activeDayDiff = activeVal - prevVal;
  const activeDayPct =
    prevVal > 0 ? ((activeDayDiff / prevVal) * 100).toFixed(2) : "0.00";
  const activeDate = dates[selectedDayIdx] || "";

  const indicators = result?.market_indicators || {};
  const mspInfo = result?.msp_benchmark || {};
  const confidence = result?.forecast_confidence_interval || {};
  const forecast3Day = result?.forecast_3_day || [];
  const mandiRates = result?.mandi_rates || [];

  const filteredMandis = mandiRates.filter((m) => {
    if (!mandiFilter) return true;
    const q = mandiFilter.toLowerCase();
    return (
      m.mandi.toLowerCase().includes(q) ||
      m.state.toLowerCase().includes(q) ||
      m.variety.toLowerCase().includes(q)
    );
  });

  return (
    <div
      style={{
        maxWidth: "980px",
        margin: "0 auto",
        width: "100%",
        paddingBottom: "40px",
      }}
    >
      <div className="page-header">
        <div className="page-badge">
          <Activity size={14} />
          <span>
            {t("market.badge", "Real-Time Mandi Radar & Econometric AI")}
          </span>
        </div>
        <h1 className="page-title">
          {t("market.title", "Commodity Market Intelligence")}
        </h1>
        <p className="page-subtitle">
          {t(
            "market.subtitle",
            "Real-time APMC mandi spot prices, authentic time-series price discovery, Holt-Winters exponential trend forecasting, and Minimum Support Price (MSP) analytics.",
          )}
        </p>
      </div>

      <div
        className="glass-card"
        style={{ width: "100%", boxSizing: "border-box", marginBottom: "20px" }}
      >
        <div style={{ textAlign: "left", marginBottom: "16px" }}>
          <label
            className="form-label"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <Coins size={16} />
            <span>
              {t("market.select_crop", "Select Agricultural Commodity")}
            </span>
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(135px, 1fr))",
              gap: "8px",
            }}
          >
            {CROPS.map((c) => {
              const isActive = crop === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handleCropSelect(c.id)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md, 10px)",
                    border: isActive
                      ? "1.5px solid var(--primary-500)"
                      : "1px solid var(--border-color)",
                    background: isActive
                      ? "linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(5, 150, 105, 0.12) 100%)"
                      : "var(--bg-input)",
                    color: isActive
                      ? "var(--primary-400, #34d399)"
                      : "var(--text-main)",
                    fontFamily: "var(--font-sans)",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: "13px",
                    cursor: "pointer",
                    boxShadow: isActive
                      ? "0 4px 12px rgba(16, 185, 129, 0.2)"
                      : "none",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>{c.icon}</span>
                  <div
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div>{c.name}</div>
                    <span
                      style={{
                        fontSize: "10px",
                        color: "var(--text-muted)",
                        display: "block",
                      }}
                    >
                      {c.category}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <button
            onClick={() => handleFetch(crop)}
            className="btn-primary"
            disabled={loading}
            style={{ width: "auto", minWidth: "190px", padding: "10px 22px" }}
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="spinner" />
                <span>{t("market.fetching", "Analyzing Live Mandis...")}</span>
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                <span>Refresh Live Prices</span>
              </>
            )}
          </button>

          {result?.timestamp && (
            <span
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Compass size={14} />
              Last Updated: <strong>{result.timestamp}</strong>
            </span>
          )}
        </div>

        {error && (
          <div className="alert-box alert-error" style={{ marginTop: "16px" }}>
            <AlertTriangle size={20} />
            <div>
              <strong>Market Discovery Error</strong>
              <p style={{ fontSize: "13px" }}>{error}</p>
            </div>
          </div>
        )}
      </div>

      {result && result.last_7_day_trend && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "14px",
            }}
          >
            <div
              className="glass-card"
              style={{
                padding: "20px",
                borderLeft: "4px solid var(--primary-500)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    Spot Modal Price (Today)
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      background: "rgba(16, 185, 129, 0.15)",
                      color: "#10b981",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontWeight: 700,
                    }}
                  >
                    Live Mandi
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    color: "var(--text-main)",
                  }}
                >
                  ₹{latestPrice.toLocaleString("en-IN")}
                  <span
                    style={{
                      fontSize: "13px",
                      color: "var(--text-muted)",
                      fontWeight: 500,
                      marginLeft: "6px",
                    }}
                  >
                    / quintal
                  </span>
                </div>
              </div>

              <div
                style={{
                  marginTop: "14px",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>
                  7-Day SMA: <strong>₹{indicators.sma_7 ?? avgVal}</strong>
                </span>
                <span>
                  RSI (7D): <strong>{indicators.rsi_7 ?? 50}</strong>
                </span>
              </div>
            </div>

            <div
              className="glass-card"
              style={{
                padding: "20px",
                borderLeft: isPositiveTrend
                  ? "4px solid #10b981"
                  : "4px solid #ef4444",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                background: isPositiveTrend
                  ? "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, var(--bg-card) 100%)"
                  : "linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, var(--bg-card) 100%)",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: isPositiveTrend ? "#10b981" : "#ef4444",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Sparkles size={14} />
                    AI Day+1 Forecast
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      background: isPositiveTrend
                        ? "rgba(16, 185, 129, 0.2)"
                        : "rgba(239, 68, 68, 0.2)",
                      color: isPositiveTrend ? "#10b981" : "#ef4444",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontWeight: 700,
                    }}
                  >
                    {isPositiveTrend
                      ? `+${percentChange}%`
                      : `${percentChange}%`}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    color: "var(--text-main)",
                  }}
                >
                  ₹{predictedPrice.toLocaleString("en-IN")}
                  <span
                    style={{
                      fontSize: "13px",
                      color: "var(--text-muted)",
                      fontWeight: 500,
                      marginLeft: "6px",
                    }}
                  >
                    / quintal
                  </span>
                </div>
              </div>

              <div
                style={{
                  marginTop: "14px",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                }}
              >
                <span>
                  95% Range:{" "}
                  <strong>
                    ₹
                    {confidence.lower_bound ??
                      Math.round(predictedPrice * 0.98)}{" "}
                    - ₹
                    {confidence.upper_bound ??
                      Math.round(predictedPrice * 1.02)}
                  </strong>
                </span>
              </div>
            </div>

            <div
              className="glass-card"
              style={{
                padding: "20px",
                borderLeft: "4px solid #f59e0b",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    Govt. MSP Benchmark
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      background: "rgba(245, 158, 11, 0.15)",
                      color: "#f59e0b",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontWeight: 700,
                    }}
                  >
                    Official CACP
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    color: "var(--text-main)",
                  }}
                >
                  ₹{(mspInfo.msp_inr_quintal || 0).toLocaleString("en-IN")}
                  <span
                    style={{
                      fontSize: "13px",
                      color: "var(--text-muted)",
                      fontWeight: 500,
                      marginLeft: "6px",
                    }}
                  >
                    / quintal
                  </span>
                </div>
              </div>

              <div
                style={{
                  marginTop: "14px",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>
                  Mandi Premium:{" "}
                  <strong
                    style={{
                      color:
                        (mspInfo.current_premium_inr || 0) >= 0
                          ? "#10b981"
                          : "#ef4444",
                    }}
                  >
                    {(mspInfo.current_premium_inr || 0) >= 0
                      ? `+₹${mspInfo.current_premium_inr}`
                      : `₹${mspInfo.current_premium_inr}`}{" "}
                    (
                    {(mspInfo.current_premium_pct || 0) >= 0
                      ? `+${mspInfo.current_premium_pct}%`
                      : `${mspInfo.current_premium_pct}%`}
                    )
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {indicators.advisory_reason && (
            <div
              className="glass-card"
              style={{
                padding: "18px 22px",
                borderLeft: "4px solid var(--primary-500)",
                background:
                  "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, var(--bg-card) 100%)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <ShieldCheck
                    size={20}
                    style={{ color: "var(--primary-500)" }}
                  />
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: "15px",
                      color: "var(--text-main)",
                    }}
                  >
                    AI Decision Advisory: {indicators.recommendation}
                  </span>
                </div>
                <div
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  <span
                    style={{ fontSize: "11px", color: "var(--text-muted)" }}
                  >
                    Market Sentiment:
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: "12px",
                      background:
                        indicators.sentiment_code === "bullish"
                          ? "rgba(16, 185, 129, 0.2)"
                          : indicators.sentiment_code === "bearish"
                            ? "rgba(239, 68, 68, 0.2)"
                            : "rgba(245, 158, 11, 0.2)",
                      color:
                        indicators.sentiment_code === "bullish"
                          ? "#10b981"
                          : indicators.sentiment_code === "bearish"
                            ? "#ef4444"
                            : "#f59e0b",
                    }}
                  >
                    {indicators.sentiment}
                  </span>
                </div>
              </div>
              <p
                style={{
                  fontSize: "13px",
                  lineHeight: "1.6",
                  color: "var(--text-muted)",
                  margin: 0,
                }}
              >
                {indicators.advisory_reason}
              </p>
            </div>
          )}

          <div
            className="glass-card"
            style={{ padding: "20px", textAlign: "left" }}
          >
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid var(--border-color)",
                marginBottom: "20px",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => setActiveTab("chart")}
                style={{
                  padding: "10px 18px",
                  background: "transparent",
                  border: "none",
                  borderBottom:
                    activeTab === "chart"
                      ? "2px solid var(--primary-500)"
                      : "2px solid transparent",
                  color:
                    activeTab === "chart"
                      ? "var(--primary-500)"
                      : "var(--text-muted)",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <LineChart size={16} />
                <span>7-Day Price History & Trend</span>
              </button>

              <button
                onClick={() => setActiveTab("mandis")}
                style={{
                  padding: "10px 18px",
                  background: "transparent",
                  border: "none",
                  borderBottom:
                    activeTab === "mandis"
                      ? "2px solid var(--primary-500)"
                      : "2px solid transparent",
                  color:
                    activeTab === "mandis"
                      ? "var(--primary-500)"
                      : "var(--text-muted)",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Building2 size={16} />
                <span>Regional APMC Mandis ({mandiRates.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("forecast")}
                style={{
                  padding: "10px 18px",
                  background: "transparent",
                  border: "none",
                  borderBottom:
                    activeTab === "forecast"
                      ? "2px solid var(--primary-500)"
                      : "2px solid transparent",
                  color:
                    activeTab === "forecast"
                      ? "var(--primary-500)"
                      : "var(--text-muted)",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Sparkles size={16} />
                <span>3-Day Holt-Winters Projection</span>
              </button>
            </div>

            {activeTab === "chart" && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    background: "var(--bg-input)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                    marginBottom: "20px",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Calendar
                      size={16}
                      style={{ color: "var(--primary-500)" }}
                    />
                    <span style={{ fontSize: "13px", fontWeight: 700 }}>
                      {formatDateLabel(
                        activeDate,
                        selectedDayIdx === trend.length - 1,
                      )}{" "}
                      {selectedDayIdx === trend.length - 1
                        ? "(Latest Mandi Rate)"
                        : ""}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: 800,
                        color: "var(--primary-500)",
                      }}
                    >
                      ₹{activeVal.toLocaleString("en-IN")}
                    </span>
                    {selectedDayIdx > 0 && (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "10px",
                          background:
                            activeDayDiff >= 0
                              ? "rgba(16, 185, 129, 0.15)"
                              : "rgba(239, 68, 68, 0.15)",
                          color: activeDayDiff >= 0 ? "#10b981" : "#ef4444",
                        }}
                      >
                        {activeDayDiff >= 0
                          ? `+${activeDayPct}%`
                          : `${activeDayPct}%`}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className="market-chart-section"
                  style={{ width: "100%", overflow: "hidden" }}
                >
                  <div className="chart-scroll-container">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                        gap: "clamp(6px, 1.8vw, 14px)",
                        height: "230px",
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "18px 12px 14px",
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      {trend.map((val, idx) => {
                        const range = Math.max(1, maxVal - minVal);
                        const heightPercent = Math.min(
                          92,
                          Math.max(25, ((val - minVal) / range) * 65 + 25),
                        );
                        const isSelected = selectedDayIdx === idx;
                        const isLatest = idx === trend.length - 1;

                        return (
                          <div
                            key={idx}
                            onClick={() => setSelectedDayIdx(idx)}
                            style={{
                              flex: "1 1 0",
                              minWidth: "0",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              height: "100%",
                              justifyContent: "flex-end",
                              cursor: "pointer",
                              transition: "transform 0.15s ease",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "clamp(9px, 1.8vw, 11px)",
                                fontWeight: isSelected ? 800 : 600,
                                color: isSelected
                                  ? "var(--primary-500)"
                                  : "var(--text-muted)",
                                textAlign: "center",
                                marginBottom: "6px",
                                lineHeight: 1.1,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                width: "100%",
                                whiteSpace: "nowrap",
                              }}
                            >
                              ₹{Math.round(val).toLocaleString("en-IN")}
                            </span>

                            <div
                              style={{
                                width: "100%",
                                height: `${heightPercent}%`,
                                background: isSelected
                                  ? "linear-gradient(180deg, #34d399 0%, #059669 100%)"
                                  : isLatest
                                    ? "linear-gradient(180deg, var(--accent-lime, #84cc16) 0%, var(--primary-500) 100%)"
                                    : "linear-gradient(180deg, var(--primary-500) 0%, var(--primary-700, #047857) 100%)",
                                borderRadius: "6px 6px 0 0",
                                boxShadow: isSelected
                                  ? "0 0 12px rgba(16, 185, 129, 0.45)"
                                  : "none",
                                border: isSelected
                                  ? "1.5px solid #ffffff"
                                  : "none",
                                transition:
                                  "height 0.4s ease, background 0.2s ease",
                              }}
                            />

                            <span
                              style={{
                                fontSize: "clamp(9px, 1.6vw, 11px)",
                                color: isSelected
                                  ? "var(--primary-500)"
                                  : "var(--text-muted)",
                                fontWeight: isSelected ? 700 : 500,
                                marginTop: "8px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "100%",
                              }}
                            >
                              {dates[idx] ? dates[idx].slice(5) : `D${idx + 1}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "10px",
                    marginTop: "20px",
                  }}
                >
                  <div
                    style={{
                      background: "var(--bg-input)",
                      padding: "12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        fontWeight: 600,
                      }}
                    >
                      7-Day High
                    </span>
                    <p
                      style={{
                        fontSize: "16px",
                        fontWeight: 800,
                        color: "#10b981",
                        margin: "2px 0 0",
                      }}
                    >
                      ₹{maxVal.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "var(--bg-input)",
                      padding: "12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        fontWeight: 600,
                      }}
                    >
                      7-Day Low
                    </span>
                    <p
                      style={{
                        fontSize: "16px",
                        fontWeight: 800,
                        color: "#ef4444",
                        margin: "2px 0 0",
                      }}
                    >
                      ₹{minVal.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "var(--bg-input)",
                      padding: "12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        fontWeight: 600,
                      }}
                    >
                      7-Day Average
                    </span>
                    <p
                      style={{
                        fontSize: "16px",
                        fontWeight: 800,
                        color: "var(--text-main)",
                        margin: "2px 0 0",
                      }}
                    >
                      ₹{avgVal.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "var(--bg-input)",
                      padding: "12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        fontWeight: 600,
                      }}
                    >
                      Price Volatility
                    </span>
                    <p
                      style={{
                        fontSize: "16px",
                        fontWeight: 800,
                        color: "var(--text-main)",
                        margin: "2px 0 0",
                      }}
                    >
                      {indicators.volatility_pct ?? 1.8}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "mandis" && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      flex: "1 1 240px",
                      maxWidth: "360px",
                    }}
                  >
                    <Search
                      size={16}
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--text-muted)",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Filter by state or mandi name..."
                      value={mandiFilter}
                      onChange={(e) => setMandiFilter(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px 8px 36px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-color)",
                        background: "var(--bg-input)",
                        color: "var(--text-main)",
                        fontSize: "13px",
                      }}
                    />
                  </div>
                  <span
                    style={{ fontSize: "12px", color: "var(--text-muted)" }}
                  >
                    Showing {filteredMandis.length} of {mandiRates.length}{" "}
                    reporting mandis
                  </span>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "13px",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          borderBottom: "2px solid var(--border-color)",
                          textAlign: "left",
                        }}
                      >
                        <th
                          style={{
                            padding: "10px",
                            color: "var(--text-muted)",
                          }}
                        >
                          Mandi Name
                        </th>
                        <th
                          style={{
                            padding: "10px",
                            color: "var(--text-muted)",
                          }}
                        >
                          State
                        </th>
                        <th
                          style={{
                            padding: "10px",
                            color: "var(--text-muted)",
                          }}
                        >
                          Variety
                        </th>
                        <th
                          style={{
                            padding: "10px",
                            color: "var(--text-muted)",
                            textAlign: "right",
                          }}
                        >
                          Arrivals (Tonnes)
                        </th>
                        <th
                          style={{
                            padding: "10px",
                            color: "var(--text-muted)",
                            textAlign: "right",
                          }}
                        >
                          Min - Max Price
                        </th>
                        <th
                          style={{
                            padding: "10px",
                            color: "var(--text-muted)",
                            textAlign: "right",
                          }}
                        >
                          Modal Price
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMandis.map((m, idx) => (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: "1px solid var(--border-color)",
                            background:
                              idx % 2 === 0
                                ? "transparent"
                                : "rgba(255, 255, 255, 0.02)",
                          }}
                        >
                          <td style={{ padding: "12px 10px", fontWeight: 700 }}>
                            <Building2
                              size={14}
                              style={{
                                display: "inline",
                                marginRight: "6px",
                                color: "var(--primary-500)",
                              }}
                            />
                            {m.mandi}
                          </td>
                          <td
                            style={{
                              padding: "12px 10px",
                              color: "var(--text-muted)",
                            }}
                          >
                            {m.state}
                          </td>
                          <td style={{ padding: "12px 10px" }}>
                            <span
                              style={{
                                fontSize: "12px",
                                background: "var(--bg-input)",
                                padding: "2px 8px",
                                borderRadius: "8px",
                              }}
                            >
                              {m.variety}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "12px 10px",
                              textAlign: "right",
                              color: "var(--text-muted)",
                            }}
                          >
                            {m.arrivals_tonnes?.toLocaleString("en-IN")} T
                          </td>
                          <td
                            style={{
                              padding: "12px 10px",
                              textAlign: "right",
                              color: "var(--text-muted)",
                              fontSize: "12px",
                            }}
                          >
                            ₹{m.min_price} - ₹{m.max_price}
                          </td>
                          <td
                            style={{
                              padding: "12px 10px",
                              textAlign: "right",
                              fontWeight: 800,
                              color: "var(--primary-400, #34d399)",
                            }}
                          >
                            ₹{m.modal_price?.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "forecast" && (
              <div>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    marginBottom: "16px",
                  }}
                >
                  Multi-horizon econometric price projection computed using
                  double exponential smoothing with damping factor.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "14px",
                  }}
                >
                  {forecast3Day.map((f, idx) => {
                    const diffFromLatest = f.projected_price - latestPrice;
                    const pctDiff =
                      latestPrice > 0
                        ? ((diffFromLatest / latestPrice) * 100).toFixed(2)
                        : "0.00";
                    const isPos = diffFromLatest >= 0;

                    return (
                      <div
                        key={idx}
                        style={{
                          background: "var(--bg-input)",
                          padding: "16px",
                          borderRadius: "var(--radius-sm)",
                          border:
                            idx === 0
                              ? "1.5px solid var(--primary-500)"
                              : "1px solid var(--border-color)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "8px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              color: "var(--primary-500)",
                            }}
                          >
                            {f.day}
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              color: "var(--text-muted)",
                            }}
                          >
                            {f.date}
                          </span>
                        </div>

                        <div
                          style={{
                            fontSize: "22px",
                            fontWeight: 800,
                            color: "var(--text-main)",
                            margin: "4px 0",
                          }}
                        >
                          ₹{f.projected_price?.toLocaleString("en-IN")}
                        </div>

                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: isPos ? "#10b981" : "#ef4444",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            marginTop: "8px",
                          }}
                        >
                          {isPos ? (
                            <ArrowUpRight size={14} />
                          ) : (
                            <ArrowDownRight size={14} />
                          )}
                          <span>
                            {isPos
                              ? `+₹${diffFromLatest.toFixed(2)} (+${pctDiff}%)`
                              : `₹${diffFromLatest.toFixed(2)} (${pctDiff}%)`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div
                  style={{
                    marginTop: "20px",
                    padding: "12px 16px",
                    background: "rgba(255, 255, 255, 0.03)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "12px",
                    color: "var(--text-muted)",
                  }}
                >
                  <Info
                    size={14}
                    style={{
                      display: "inline",
                      marginRight: "6px",
                      verticalAlign: "middle",
                    }}
                  />
                  <strong>Model Methodology:</strong>{" "}
                  {result.forecast_model ||
                    "Holt-Winters Double Exponential Smoothing with Seasonal Inflow Damping"}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
