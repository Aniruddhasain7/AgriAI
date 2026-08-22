import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import {
  LineChart,
  Coins,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Sparkles,
  BarChart3,
  Info,
} from "lucide-react";

const CROPS = [
  { id: "rice", name: "Rice", icon: "🌾" },
  { id: "wheat", name: "Wheat", icon: "🌾" },
  { id: "maize", name: "Maize", icon: "🌽" },
  { id: "cotton", name: "Cotton", icon: "🧵" },
  { id: "sugarcane", name: "Sugarcane", icon: "🎋" },
  { id: "soybean", name: "Soybean", icon: "🌱" },
];

export default function MarketPrices() {
  const { t } = useTranslation();
  const [crop, setCrop] = useState("rice");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDayIdx, setSelectedDayIdx] = useState(6);

  const handleFetch = async (selectedCrop = crop) => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await api.getMarketTrend(selectedCrop);
      if (data.error) throw new Error(data.error);
      setResult(data);
      setSelectedDayIdx(data.last_7_day_trend ? data.last_7_day_trend.length - 1 : 6);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCropSelect = (cId) => {
    setCrop(cId);
    handleFetch(cId);
  };

  const trend = result?.last_7_day_trend || [];
  const maxVal = trend.length ? Math.max(...trend) : 0;
  const minVal = trend.length ? Math.min(...trend) : 0;
  const avgVal = trend.length ? Math.round((trend.reduce((a, b) => a + b, 0) / trend.length) * 100) / 100 : 0;
  const latestPrice = trend.length ? trend[trend.length - 1] : 0;
  const predictedPrice = result?.predicted_next_day ?? 0;
  const priceDiff = latestPrice > 0 ? predictedPrice - latestPrice : 0;
  const percentChange = latestPrice > 0 ? ((priceDiff / latestPrice) * 100).toFixed(2) : "0.00";
  const isPositiveTrend = priceDiff >= 0;

  const activeVal = trend[selectedDayIdx] ?? latestPrice;
  const prevVal = selectedDayIdx > 0 ? trend[selectedDayIdx - 1] : trend[0];
  const activeDayDiff = activeVal - prevVal;
  const activeDayPct = prevVal > 0 ? ((activeDayDiff / prevVal) * 100).toFixed(2) : "0.00";

  return (
    <div style={{ maxWidth: "840px", margin: "0 auto", width: "100%" }}>
      <div className="page-header">
        <div className="page-badge">
          <LineChart size={14} />
          <span>{t("market.badge", "AgriMarket Intelligence")}</span>
        </div>
        <h1 className="page-title">{t("market.title", "Commodity Market Prices")}</h1>
        <p className="page-subtitle">
          {t("market.subtitle", "Track 7-day historical market trends and view next-day AI price forecasts for major agricultural commodities.")}
        </p>
      </div>

      <div className="glass-card" style={{ width: "100%", boxSizing: "border-box" }}>
        <div style={{ marginBottom: "24px", textAlign: "left" }}>
          <label className="form-label" style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Coins size={16} />
            <span>{t("market.select_crop", "Select Agricultural Commodity")}</span>
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {CROPS.map((c) => {
              const isActive = crop === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handleCropSelect(c.id)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "var(--radius-full)",
                    border: isActive
                      ? "1px solid var(--primary-500)"
                      : "1px solid var(--border-color)",
                    background: isActive
                      ? "linear-gradient(135deg, var(--primary-600) 0%, var(--primary-500) 100%)"
                      : "var(--bg-input)",
                    color: isActive ? "#ffffff" : "var(--text-main)",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                    boxShadow: isActive ? "0 4px 12px rgba(16, 185, 129, 0.3)" : "none",
                    transition: "all 0.2s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>{c.icon}</span>
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => handleFetch(crop)}
          className="btn-primary"
          disabled={loading}
          style={{ width: "auto", minWidth: "200px", padding: "12px 28px", margin: "0 0 16px" }}
        >
          {loading ? (
            <>
              <RefreshCw size={18} className="spinner" />
              <span>{t("market.fetching", "Fetching Market Data...")}</span>
            </>
          ) : (
            <>
              <TrendingUp size={18} />
              <span>{t("market.analyze", "Analyze Price Trend")}</span>
            </>
          )}
        </button>

        {error && (
          <div className="alert-box alert-error" style={{ marginTop: "16px" }}>
            <AlertTriangle size={20} />
            <div>
              <strong>Market Data Error</strong>
              <p style={{ fontSize: "13px" }}>{error}</p>
            </div>
          </div>
        )}

        {result && result.last_7_day_trend && (
          <div
            style={{
              marginTop: "28px",
              paddingTop: "24px",
              borderTop: "1px solid var(--border-color)",
              textAlign: "left",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "stretch",
                flexWrap: "wrap",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div>
                <h3 style={{ fontSize: "22px", textTransform: "capitalize", fontWeight: 800 }}>
                  {result.crop} Market Overview
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                  Standard Unit: <strong>{result.unit}</strong>
                </p>
              </div>

              <div
                style={{
                  background: isPositiveTrend ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                  border: isPositiveTrend ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "var(--radius-sm)",
                  padding: "12px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  flex: "1 1 auto",
                  maxWidth: "320px",
                }}
              >
                {isPositiveTrend ? (
                  <ArrowUpRight size={26} style={{ color: "var(--primary-500)", flexShrink: 0 }} />
                ) : (
                  <ArrowDownRight size={26} style={{ color: "#ef4444", flexShrink: 0 }} />
                )}
                <div>
                  <p
                    style={{
                      fontSize: "11px",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      color: isPositiveTrend ? "var(--primary-500)" : "#ef4444",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {t("market.forecast_price", "Predicted Next Day")} ({isPositiveTrend ? `+${percentChange}%` : `${percentChange}%`})
                  </p>
                  <p style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-main)", marginTop: "2px" }}>
                    ₹{result.predicted_next_day?.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: "10px",
                marginBottom: "20px",
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
                <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
                  {t("market.high_price", "7-Day High")}
                </span>
                <p style={{ fontSize: "16px", fontWeight: 800, color: "#10b981", marginTop: "2px" }}>
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
                <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
                  {t("market.low_price", "7-Day Low")}
                </span>
                <p style={{ fontSize: "16px", fontWeight: 800, color: "#ef4444", marginTop: "2px" }}>
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
                <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
                  7-Day Average
                </span>
                <p style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-main)", marginTop: "2px" }}>
                  ₹{avgVal.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: "var(--bg-input)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
                marginBottom: "16px",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Calendar size={16} style={{ color: "var(--primary-500)" }} />
                <span style={{ fontSize: "13px", fontWeight: 700 }}>
                  Day {selectedDayIdx + 1} {selectedDayIdx === 6 ? "(Latest Mandi Rate)" : "(Historical)"}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "15px", fontWeight: 800, color: "var(--primary-500)" }}>
                  ₹{activeVal.toLocaleString("en-IN")}
                </span>
                {selectedDayIdx > 0 && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "10px",
                      background: activeDayDiff >= 0 ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                      color: activeDayDiff >= 0 ? "#10b981" : "#ef4444",
                    }}
                  >
                    {activeDayDiff >= 0 ? `+${activeDayPct}%` : `${activeDayPct}%`}
                  </span>
                )}
              </div>
            </div>

            <div className="market-chart-section" style={{ width: "100%", overflow: "hidden" }}>
              <div className="chart-scroll-container">
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "clamp(6px, 1.8vw, 14px)",
                    height: "210px",
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
                      Math.max(25, ((val - minVal) / range) * 65 + 25)
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
                            color: isSelected ? "var(--primary-500)" : "var(--text-muted)",
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
                            border: isSelected ? "1.5px solid #ffffff" : "none",
                            transition: "height 0.4s ease, background 0.2s ease",
                          }}
                        />

                        <span
                          style={{
                            fontSize: "clamp(10px, 2vw, 12px)",
                            color: isSelected ? "var(--primary-500)" : "var(--text-muted)",
                            fontWeight: isSelected ? 700 : 500,
                            marginTop: "8px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          D{idx + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <p
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                marginTop: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Info size={14} />
              <span>Tap or click any bar above to inspect daily modal pricing details.</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
