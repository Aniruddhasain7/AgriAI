import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import {
  TrendingUp,
  TrendingDown,
  Sprout,
  Building2,
  Calendar,
  RefreshCw,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  MapPin,
  BarChart2,
  Sparkles,
  Clock,
  Crown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function BarChart({
  data,
  currentPrice,
  peakPrice,
  activeSlide = 0,
  setActiveSlide,
  viewMode = "carousel",
  setViewMode,
}) {
  const { t } = useTranslation();
  const [tooltip, setTooltip] = useState(null);

  if (!data || data.length === 0) return null;

  const SLIDE_SIZE = 7;
  const isMultiSlide = data.length > SLIDE_SIZE;
  const totalSlides = Math.ceil(data.length / SLIDE_SIZE);

  // Fallback state if handlers not passed
  const [internalSlide, setInternalSlide] = useState(0);
  const [internalMode, setInternalMode] = useState("carousel");
  const curSlide = setActiveSlide ? activeSlide : internalSlide;
  const setCurSlide = setActiveSlide || setInternalSlide;
  const curMode = setViewMode ? viewMode : internalMode;
  const setCurMode = setViewMode || setInternalMode;

  const isCarousel = curMode === "carousel" && isMultiSlide;
  const visibleData = isCarousel
    ? data.slice(
        curSlide * SLIDE_SIZE,
        Math.min((curSlide + 1) * SLIDE_SIZE, data.length),
      )
    : data;

  const W = 760;
  const H = 250;
  const padL = 60;
  const padR = 24;
  const padT = 30;
  const padB = 48;

  // GLOBAL min and max across all days to keep vertical scale stable across slides
  const prices = data.map((d) => d.predicted_price);
  const allVals = [currentPrice, ...prices];
  const minVal = Math.floor(Math.min(...allVals) * 0.98);
  const maxVal = Math.ceil(Math.max(...allVals) * 1.02);
  const valRange = Math.max(1, maxVal - minVal);

  const barCount = visibleData.length;
  const chartW = W - padL - padR;
  const slotW = chartW / barCount;
  const barW = Math.max(
    14,
    Math.min(42, Math.floor(slotW * (isCarousel ? 0.45 : 0.65))),
  );

  const toY = (v) => padT + (1 - (v - minVal) / valRange) * (H - padT - padB);
  const toX = (i) => padL + (i + 0.5) * slotW;

  const ySteps = 4;
  const yTicks = Array.from({ length: ySteps + 1 }, (_, i) =>
    Math.round(minVal + (i / ySteps) * valRange),
  );

  const labelStep = isCarousel || barCount <= 7 ? 1 : barCount <= 14 ? 2 : 5;

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Carousel Header Controls */}
      {isMultiSlide && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
            padding: "8px 12px",
            borderRadius: "var(--radius-md, 8px)",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid var(--border-color)",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          {/* Active slide badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 10px",
                borderRadius: 20,
                background: "rgba(16, 185, 129, 0.12)",
                color: "var(--primary-400)",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {isCarousel ? (
                <>
                  <Calendar size={13} />
                  {visibleData[0]?.day_label} –{" "}
                  {visibleData[visibleData.length - 1]?.day_label}
                  <span
                    style={{ opacity: 0.75, fontWeight: 500, marginLeft: 2 }}
                  >
                    ({visibleData[0]?.date} –{" "}
                    {visibleData[visibleData.length - 1]?.date})
                  </span>
                </>
              ) : (
                <>
                  <BarChart2 size={13} />
                  {t("market.all_days_overview", {
                    count: data.length,
                    defaultValue: `All ${data.length} Days Overview`,
                  })}
                </>
              )}
            </span>

            {isCarousel && (
              <span
                style={{
                  fontSize: 11.5,
                  color: "var(--text-muted)",
                  fontWeight: 500,
                }}
              >
                {t("market.slide", "Slide")} {curSlide + 1} {t("market.of", "of")}{" "}
                {totalSlides}
              </span>
            )}
          </div>

          {/* View Mode Switcher and Carousel Navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                display: "inline-flex",
                background: "rgba(0, 0, 0, 0.18)",
                borderRadius: 6,
                padding: 2,
                border: "1px solid var(--border-color)",
              }}
            >
              <button
                type="button"
                onClick={() => setCurMode("carousel")}
                style={{
                  padding: "4px 10px",
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: curMode === "carousel" ? 700 : 500,
                  background:
                    curMode === "carousel"
                      ? "var(--primary-500)"
                      : "transparent",
                  color: curMode === "carousel" ? "#fff" : "var(--text-muted)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {t("market.carousel_mode", "7-Day")}
              </button>
              <button
                type="button"
                onClick={() => setCurMode("all")}
                style={{
                  padding: "4px 10px",
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: curMode === "all" ? 700 : 500,
                  background:
                    curMode === "all" ? "var(--primary-500)" : "transparent",
                  color: curMode === "all" ? "#fff" : "var(--text-muted)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {t("market.all_days_mode", "All Days")}
              </button>
            </div>

            {isCarousel && (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button
                  type="button"
                  onClick={() => setCurSlide((prev) => Math.max(0, prev - 1))}
                  disabled={curSlide === 0}
                  title={t("market.prev_slide", "Previous Slide")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background:
                      curSlide === 0
                        ? "transparent"
                        : "rgba(255, 255, 255, 0.08)",
                    color:
                      curSlide === 0 ? "var(--text-muted)" : "var(--text-main)",
                    border: "1px solid var(--border-color)",
                    cursor: curSlide === 0 ? "not-allowed" : "pointer",
                    opacity: curSlide === 0 ? 0.35 : 1,
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCurSlide((prev) => Math.min(totalSlides - 1, prev + 1))
                  }
                  disabled={curSlide === totalSlides - 1}
                  title={t("market.next_slide", "Next Slide")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background:
                      curSlide === totalSlides - 1
                        ? "transparent"
                        : "rgba(255, 255, 255, 0.08)",
                    color:
                      curSlide === totalSlides - 1
                        ? "var(--text-muted)"
                        : "var(--text-main)",
                    border: "1px solid var(--border-color)",
                    cursor:
                      curSlide === totalSlides - 1 ? "not-allowed" : "pointer",
                    opacity: curSlide === totalSlides - 1 ? 0.35 : 1,
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SVG Bar Chart */}
      <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: "100%", minWidth: 480, display: "block" }}
        >
          <defs>
            <linearGradient id="barUp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="barPeak" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="barDown" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#be123c" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="barNeutral" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.85" />
            </linearGradient>
          </defs>

          {/* Y-axis grid lines and labels */}
          {yTicks.map((tick, i) => {
            const y = toY(tick);
            return (
              <g key={i}>
                <line
                  x1={padL}
                  y1={y}
                  x2={W - padR}
                  y2={y}
                  stroke="var(--border-color)"
                  strokeWidth={0.8}
                  strokeDasharray="4 4"
                  opacity={0.6}
                />
                <text
                  x={padL - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize={10}
                  fontWeight="500"
                  fill="var(--text-muted)"
                >
                  ₹{tick.toLocaleString("en-IN")}
                </text>
              </g>
            );
          })}

          {/* Today's price baseline */}
          <line
            x1={padL}
            y1={toY(currentPrice)}
            x2={W - padR}
            y2={toY(currentPrice)}
            stroke="#0284c7"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          {/* Baseline badge on left Y-axis margin */}
          <rect
            x={padL - 56}
            y={toY(currentPrice) - 8}
            width={50}
            height={16}
            rx={3}
            fill="rgba(2, 132, 199, 0.15)"
            stroke="#0284c7"
            strokeWidth={0.8}
          />
          <text
            x={padL - 31}
            y={toY(currentPrice) + 4}
            textAnchor="middle"
            fontSize={8.5}
            fontWeight="700"
            fill="#0284c7"
          >
            ₹{Math.round(currentPrice).toLocaleString("en-IN")}
          </text>

          {/* Bars */}
          {visibleData.map((row, i) => {
            const x = toX(i);
            const y = toY(row.predicted_price);
            const barH = Math.max(4, H - padB - y);
            const isPeak =
              row.predicted_price === peakPrice && peakPrice > currentPrice;
            const isUp = row.trend === "up";
            const isDown = row.trend === "down";

            let fill = "url(#barNeutral)";
            if (isPeak) fill = "url(#barPeak)";
            else if (isUp) fill = "url(#barUp)";
            else if (isDown) fill = "url(#barDown)";

            const isHovered = tooltip?.idx === i;
            const showLabel =
              isCarousel || i % labelStep === 0 || i === barCount - 1;
            const showBarPrice = barCount <= 8;

            return (
              <g key={row.day || i}>
                {isHovered && (
                  <rect
                    x={x - slotW / 2 + 2}
                    y={padT}
                    width={slotW - 4}
                    height={H - padT - padB}
                    fill="rgba(16, 185, 129, 0.05)"
                    rx={4}
                  />
                )}

                {/* Bar */}
                <rect
                  x={x - barW / 2}
                  y={y}
                  width={barW}
                  height={barH}
                  rx={4}
                  fill={fill}
                  style={{
                    cursor: "pointer",
                    transition: "opacity 0.15s ease",
                    opacity: isHovered ? 0.88 : 1,
                  }}
                  onMouseEnter={() =>
                    setTooltip({
                      idx: i,
                      row,
                      x,
                      y: Math.max(padT + 10, y - 10),
                      isPeak,
                    })
                  }
                  onMouseLeave={() => setTooltip(null)}
                />

                {/* Price text over bar - only when comfortable (<= 8 bars) */}
                {showBarPrice && (
                  <text
                    x={x}
                    y={y - 6}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight="700"
                    fill={isPeak ? "#f59e0b" : "var(--text-main)"}
                  >
                    ₹{Math.round(row.predicted_price)}
                  </text>
                )}

                {/* X-axis labels (never overlap) */}
                {showLabel && (
                  <g>
                    <text
                      x={x}
                      y={H - padB + 14}
                      textAnchor="middle"
                      fontSize={isCarousel ? 10.5 : 9.5}
                      fontWeight="700"
                      fill="var(--text-main)"
                    >
                      {t("market.th_day", "Day")} {row.day_num || row.day || i + 1}
                    </text>
                    <text
                      x={x}
                      y={H - padB + 26}
                      textAnchor="middle"
                      fontSize={isCarousel ? 9.5 : 8.5}
                      fill="var(--text-muted)"
                    >
                      {row.date}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Tooltip */}
          {tooltip && (
            <g>
              <rect
                x={Math.min(Math.max(tooltip.x - 65, padL), W - padR - 130)}
                y={Math.max(padT, tooltip.y - 60)}
                width={130}
                height={54}
                rx={6}
                fill="var(--bg-card)"
                stroke={tooltip.isPeak ? "#f59e0b" : "var(--border-color)"}
                strokeWidth={1.2}
              />
              <text
                x={
                  Math.min(Math.max(tooltip.x - 65, padL), W - padR - 130) + 10
                }
                y={Math.max(padT, tooltip.y - 60) + 16}
                fontSize={10.5}
                fontWeight="700"
                fill="var(--text-main)"
              >
                {t("market.th_day", "Day")} {tooltip.row.day_num || tooltip.row.day || tooltip.idx + 1} ({tooltip.row.date})
              </text>
              <text
                x={
                  Math.min(Math.max(tooltip.x - 65, padL), W - padR - 130) + 10
                }
                y={Math.max(padT, tooltip.y - 60) + 32}
                fontSize={12}
                fontWeight="800"
                fill={tooltip.isPeak ? "#f59e0b" : "var(--primary-400)"}
              >
                ₹{Number(tooltip.row.predicted_price).toLocaleString("en-IN")}
                {t("market.per_qtl", "/qtl")}
              </text>
              <text
                x={
                  Math.min(Math.max(tooltip.x - 65, padL), W - padR - 130) + 10
                }
                y={Math.max(padT, tooltip.y - 60) + 46}
                fontSize={9}
                fill="var(--text-muted)"
              >
                {t("market.range", "Range")}: ₹{tooltip.row.min_expected_price} – ₹
                {tooltip.row.max_expected_price}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Carousel Jump Pills */}
      {isMultiSlide && isCarousel && totalSlides > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            marginTop: 10,
            marginBottom: 6,
            flexWrap: "wrap",
          }}
        >
          {Array.from({ length: totalSlides }, (_, idx) => {
            const sStart = idx * SLIDE_SIZE + 1;
            const sEnd = Math.min((idx + 1) * SLIDE_SIZE, data.length);
            const isCurrent = idx === curSlide;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurSlide(idx)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 14,
                  fontSize: 11,
                  fontWeight: isCurrent ? 700 : 500,
                  background: isCurrent
                    ? "rgba(16, 185, 129, 0.2)"
                    : "rgba(255, 255, 255, 0.04)",
                  border: isCurrent
                    ? "1px solid var(--primary-500)"
                    : "1px solid var(--border-color)",
                  color: isCurrent ? "var(--primary-400)" : "var(--text-muted)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {t("market.days", "Days")} {sStart}–{sEnd}
              </button>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          justifyContent: "center",
          marginTop: 10,
          fontSize: 11,
          color: "var(--text-muted)",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: "#10b981",
              display: "inline-block",
            }}
          />
          {t("market.legend_rising", "Rising")}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: "#f43f5e",
              display: "inline-block",
            }}
          />
          {t("market.legend_falling", "Falling")}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: "#6366f1",
              display: "inline-block",
            }}
          />
          {t("market.legend_stable", "Stable")}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: "#f59e0b",
              display: "inline-block",
            }}
          />
          {t("market.legend_peak", "Peak Day")}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <svg width={16} height={6}>
            <line
              x1={0}
              y1={3}
              x2={16}
              y2={3}
              stroke="#0284c7"
              strokeWidth={1.5}
              strokeDasharray="3 2"
            />
          </svg>
          {t("market.legend_benchmark", "Today's Benchmark")} (₹{currentPrice.toLocaleString("en-IN")})
        </span>
      </div>
    </div>
  );
}

export default function MarketPrices() {
  const { t } = useTranslation();
  const [selectedCrop, setSelectedCrop] = useState("Wheat");
  const [selectedMandi, setSelectedMandi] = useState("");
  const [period, setPeriod] = useState(7);

  const [commoditiesList, setCommoditiesList] = useState([]);
  const [mandisList, setMandisList] = useState([]);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [activeSlide, setActiveSlide] = useState(0);
  const [chartViewMode, setChartViewMode] = useState("carousel");
  const [tableFilter, setTableFilter] = useState("all");

  useEffect(() => {
    setActiveSlide(0);
  }, [period, selectedCrop]);

  // Load available commodities on mount and initialize with default crop and mandi
  useEffect(() => {
    let active = true;
    api
      .getMarketCommodities()
      .then((res) => {
        if (active && res?.commodities?.length > 0) {
          setCommoditiesList(res.commodities);
          const found = res.commodities.find(
            (c) => c.name.toLowerCase() === "wheat",
          );
          const defaultCrop = found ? found.name : res.commodities[0].name;
          setSelectedCrop(defaultCrop);

          api.getMarketMandis(defaultCrop).then((mRes) => {
            if (active && mRes?.mandis?.length > 0) {
              setMandisList(mRes.mandis);
              const defaultMandi = mRes.mandis[0].market;
              setSelectedMandi(defaultMandi);
              fetchPrediction(defaultCrop, defaultMandi, period);
            }
          });
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Execute price prediction
  const fetchPrediction = async (crop, mandi, p) => {
    if (!crop || !mandi) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.getMarketPrediction(crop, mandi, p);
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to load price prediction.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedMandi) {
      setError(
        t(
          "market.select_mandi_error",
          "Please select an APMC mandi to view price forecast.",
        ),
      );
      return;
    }
    fetchPrediction(selectedCrop, selectedMandi, period);
  };

  const handleCropChange = (newCrop) => {
    setSelectedCrop(newCrop);
    setError("");
    api.getMarketMandis(newCrop).then((res) => {
      if (res?.mandis) {
        setMandisList(res.mandis);
        // Only keep the chosen mandi if it's traded in this crop's mandis list; otherwise let the user pick
        setSelectedMandi((prevMandi) => {
          if (prevMandi) {
            const exists = res.mandis.some(
              (m) => m.market.toLowerCase() === prevMandi.toLowerCase(),
            );
            if (exists) return prevMandi;
          }
          return "";
        });
      }
    });
  };

  const currentPrice = Number(result?.current_price || 0);
  const peakPrice = Number(result?.peak_price || result?.forecast_price || 0);
  const gainAmount = Number(result?.expected_gain_amount || 0);
  const gainPct = Number(result?.expected_gain_pct || 0);

  // Recommendation Badge style config
  const recBadgeMap = {
    HOLD: {
      bg: "rgba(16, 185, 129, 0.12)",
      text: "#10b981",
      border: "rgba(16, 185, 129, 0.35)",
      icon: TrendingUp,
      label: t("market.rec_hold", "HOLD"),
    },
    "SELL NOW": {
      bg: "rgba(244, 63, 94, 0.12)",
      text: "#f43f5e",
      border: "rgba(244, 63, 94, 0.35)",
      icon: TrendingDown,
      label: t("market.rec_sell_now", "SELL NOW"),
    },
    "MONITOR MARKET": {
      bg: "rgba(99, 102, 241, 0.12)",
      text: "#6366f1",
      border: "rgba(99, 102, 241, 0.35)",
      icon: Clock,
      label: t("market.rec_monitor", "MONITOR"),
    },
  };

  const recConfig = recBadgeMap[result?.recommendation] || recBadgeMap["HOLD"];
  const RecIcon = recConfig.icon;
  const forecastRows = result?.forecast_table || [];

  const getLocalizedRecommendation = () => {
    if (!result) return "";
    const rec = result.recommendation;
    const params = {
      crop: selectedCrop,
      pct: gainPct,
      gain: gainAmount,
      date: result.peak_date,
      peak: peakPrice,
      price: currentPrice,
      period: period,
    };
    if (rec === "HOLD") {
      return t("market.rec_hold_text", {
        ...params,
        defaultValue: result.recommendation_text,
      });
    } else if (rec === "SELL NOW") {
      return t("market.rec_sell_text", {
        ...params,
        defaultValue: result.recommendation_text,
      });
    } else if (rec === "MONITOR MARKET" || rec === "MONITOR") {
      return t("market.rec_monitor_text", {
        ...params,
        defaultValue: result.recommendation_text,
      });
    }
    return result.recommendation_text;
  };

  return (
    <div style={{ maxWidth: "920px", margin: "0 auto", paddingBottom: 48 }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 22 }}>
        <div className="page-badge">
          <Sparkles size={14} />
          <span>{t("market.badge", "Market Price Predictor")}</span>
        </div>
        <h1 className="page-title">
          {t("market.title", "Crop Market Price Prediction")}
        </h1>
        <p className="page-subtitle">
          {t(
            "market.subtitle",
            "Select your crop and mandi to view multi-day price forecasts, price trends, and AI selling advice.",
          )}
        </p>
      </div>

      {/* Form Card */}
      <div
        className="glass-card"
        style={{ padding: "20px 22px", marginBottom: 24 }}
      >
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: 16,
            }}
          >
            {/* Crop Dropdown */}
            <div className="form-group" style={{ margin: 0 }}>
              <label
                className="form-label"
                style={{ fontSize: 13, fontWeight: 700 }}
              >
                <Sprout size={15} style={{ color: "var(--primary-500)" }} />
                {t("market.crop_commodity", "Crop Commodity")}
              </label>
              <select
                className="form-select"
                value={selectedCrop}
                onChange={(e) => handleCropChange(e.target.value)}
              >
                {commoditiesList.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Mandi Dropdown */}
            <div className="form-group" style={{ margin: 0 }}>
              <label
                className="form-label"
                style={{ fontSize: 13, fontWeight: 700 }}
              >
                <Building2 size={15} style={{ color: "var(--primary-500)" }} />
                {t("market.apmc_mandi", "APMC Mandi")}
              </label>
              <select
                className="form-select"
                value={selectedMandi}
                onChange={(e) => {
                  setSelectedMandi(e.target.value);
                  setError("");
                }}
              >
                <option value="">
                  {mandisList.length > 0
                    ? t("market.select_mandi", "Select mandi...")
                    : t("market.loading_mandis", "Loading mandis...")}
                </option>
                {mandisList.map((m) => (
                  <option key={m.market} value={m.market}>
                    {m.market}
                    {m.state ? ` (${m.state})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Forecast Days Dropdown */}
            <div className="form-group" style={{ margin: 0 }}>
              <label
                className="form-label"
                style={{ fontSize: 13, fontWeight: 700 }}
              >
                <Calendar size={15} style={{ color: "var(--primary-500)" }} />
                {t("market.forecast_period", "Forecast Period")}
              </label>
              <select
                className="form-select"
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value))}
              >
                <option value={7}>
                  {t("market.period_7", "7 Days (Recommended)")}
                </option>
                <option value={14}>
                  {t("market.period_14", "14 Days")}
                </option>
                <option value={30}>
                  {t("market.period_30", "30 Days")}
                </option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 18,
            }}
          >
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                minWidth: 180,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <RefreshCw size={15} className={loading ? "spin" : ""} />
              {loading
                ? t("market.predicting", "Predicting...")
                : t("market.predict_btn", "Predict Prices")}
            </button>
          </div>
        </form>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          style={{
            marginBottom: 20,
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#ef4444",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
          }}
        >
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Prediction Results */}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Key Metric Summary Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 14,
            }}
          >
            {/* Card 1: Current Price */}
            <div
              className="glass-card"
              style={{
                padding: "16px 18px",
                borderLeft: "4px solid var(--primary-500)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                {t("market.current_price", "Current Market Price")}
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: "var(--text-main)",
                }}
              >
                ₹{currentPrice.toLocaleString("en-IN")}
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--text-muted)",
                    marginLeft: 4,
                  }}
                >
                  {t("market.per_qtl", "/qtl")}
                </span>
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: "var(--text-muted)",
                  marginTop: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <MapPin size={12} style={{ color: "var(--primary-500)" }} />
                <span>
                  {result.mandi}, {result.state}
                </span>
              </div>
            </div>

            {/* Card 2: Projected Peak Price */}
            <div
              className="glass-card"
              style={{
                padding: "16px 18px",
                borderLeft: `4px solid ${gainAmount >= 0 ? "#10b981" : "#f43f5e"}`,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                {t("market.projected_peak", "Projected Peak Price")}
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: "var(--text-main)",
                }}
              >
                ₹{peakPrice.toLocaleString("en-IN")}
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--text-muted)",
                    marginLeft: 4,
                  }}
                >
                  {t("market.per_qtl", "/qtl")}
                </span>
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  color: gainAmount >= 0 ? "#10b981" : "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                {gainAmount >= 0 ? (
                  <ArrowUpRight size={13} />
                ) : (
                  <ArrowDownRight size={13} />
                )}
                {gainAmount >= 0 ? "+" : ""}₹{gainAmount} (
                {gainAmount >= 0 ? "+" : ""}
                {gainPct}%)
              </div>
            </div>

            {/* Card 3: AI Recommendation Badge */}
            <div
              className="glass-card"
              style={{
                padding: "16px 18px",
                borderLeft: `4px solid ${recConfig.text}`,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                {t("market.ai_recommendation", "AI Recommendation")}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 12px",
                    borderRadius: "var(--radius-full, 9999px)",
                    background: recConfig.bg,
                    border: `1px solid ${recConfig.border}`,
                    color: recConfig.text,
                    fontWeight: 800,
                    fontSize: 12.5,
                  }}
                >
                  <RecIcon size={14} />
                  {recConfig.label}
                </span>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginTop: 8,
                }}
              >
                {t("market.target_window", "Target Window")}: {result.peak_date} ({t("market.th_day", "Day")}{" "}
                {result.forecast_prices
                  ? result.forecast_prices.indexOf(peakPrice) + 1
                  : String(result.peak_day || "").replace("Day ", "")})
              </div>
            </div>
          </div>

          {/* Bar Chart Section */}
          <div className="glass-card" style={{ padding: "20px 22px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--text-main)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <BarChart2 size={18} style={{ color: "var(--primary-500)" }} />
                {t("market.chart_title", {
                  period,
                  defaultValue: `${period}-Day Market Price Forecast Chart`,
                })}
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Crown size={12} style={{ color: "#f59e0b" }} />
                <span>
                  {t("market.peak_rate", "Peak Rate")}: ₹{peakPrice}
                  {t("market.per_qtl", "/qtl")} ({result.peak_date})
                </span>
              </div>
            </div>

            <BarChart
              data={forecastRows}
              currentPrice={currentPrice}
              peakPrice={peakPrice}
              activeSlide={activeSlide}
              setActiveSlide={setActiveSlide}
              viewMode={chartViewMode}
              setViewMode={setChartViewMode}
            />
          </div>

          {/* Recommendation Narrative Card */}
          <div
            className="glass-card"
            style={{
              padding: "18px 20px",
              borderLeft: `4px solid ${recConfig.text}`,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--text-main)",
                marginBottom: 6,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Sparkles size={16} style={{ color: "var(--primary-500)" }} />
              {t("market.recommendation_advice", "Market Recommendation Advice")}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                lineHeight: 1.5,
              }}
            >
              {getLocalizedRecommendation()}
            </div>
          </div>

          {/* Day-by-Day Forecast Breakdown Table */}
          {forecastRows.length > 0 && (
            <div className="glass-card" style={{ padding: "18px 20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--text-main)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Calendar size={16} style={{ color: "var(--primary-500)" }} />
                  {t("market.daily_breakdown", "Daily Price Breakdown")}
                </div>

                {forecastRows.length > 7 && (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <button
                      type="button"
                      onClick={() => setTableFilter("all")}
                      style={{
                        padding: "3px 9px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: tableFilter === "all" ? 700 : 500,
                        background:
                          tableFilter === "all"
                            ? "var(--primary-500)"
                            : "rgba(255, 255, 255, 0.05)",
                        color:
                          tableFilter === "all" ? "#fff" : "var(--text-muted)",
                        border: "1px solid var(--border-color)",
                        cursor: "pointer",
                      }}
                    >
                      {t("market.all_days", {
                        count: forecastRows.length,
                        defaultValue: `All (${forecastRows.length} Days)`,
                      })}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTableFilter("carousel")}
                      style={{
                        padding: "3px 9px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: tableFilter === "carousel" ? 700 : 500,
                        background:
                          tableFilter === "carousel"
                            ? "var(--primary-500)"
                            : "rgba(255, 255, 255, 0.05)",
                        color:
                          tableFilter === "carousel"
                            ? "#fff"
                            : "var(--text-muted)",
                        border: "1px solid var(--border-color)",
                        cursor: "pointer",
                      }}
                    >
                      {t("market.active_week", {
                        start: activeSlide * 7 + 1,
                        end: Math.min((activeSlide + 1) * 7, forecastRows.length),
                        defaultValue: `Active Week (Days ${activeSlide * 7 + 1}–${Math.min((activeSlide + 1) * 7, forecastRows.length)})`,
                      })}
                    </button>
                  </div>
                )}
              </div>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 12.5,
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid var(--border-color)",
                        textAlign: "left",
                        color: "var(--text-muted)",
                        fontSize: 11,
                        textTransform: "uppercase",
                      }}
                    >
                      <th style={{ padding: "8px 10px" }}>{t("market.th_day", "Day")}</th>
                      <th style={{ padding: "8px 10px" }}>{t("market.th_date", "Date")}</th>
                      <th style={{ padding: "8px 10px" }}>{t("market.th_predicted", "Predicted Price")}</th>
                      <th style={{ padding: "8px 10px" }}>{t("market.th_range", "Expected Range")}</th>
                      <th style={{ padding: "8px 10px", textAlign: "center" }}>
                        {t("market.th_trend", "Trend")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(tableFilter === "carousel" && forecastRows.length > 7
                      ? forecastRows.slice(
                          activeSlide * 7,
                          Math.min((activeSlide + 1) * 7, forecastRows.length),
                        )
                      : forecastRows
                    ).map((row, i) => {
                      const isPeak =
                        row.predicted_price === peakPrice &&
                        peakPrice > currentPrice;
                      return (
                        <tr
                          key={row.day || i}
                          style={{
                            borderBottom: "1px solid var(--border-color)",
                            background: isPeak
                              ? "rgba(245, 158, 11, 0.04)"
                              : "transparent",
                          }}
                        >
                          <td
                            style={{
                              padding: "9px 10px",
                              color: "var(--text-muted)",
                            }}
                          >
                            {t("market.th_day", "Day")} {row.day_num || row.day || i + 1}
                          </td>
                          <td
                            style={{
                              padding: "9px 10px",
                              fontWeight: 600,
                              color: "var(--text-main)",
                            }}
                          >
                            {row.date}
                            {isPeak && (
                              <span
                                style={{
                                  marginLeft: 6,
                                  fontSize: 9.5,
                                  padding: "1px 5px",
                                  borderRadius: 3,
                                  background: "rgba(245, 158, 11, 0.2)",
                                  color: "#f59e0b",
                                  fontWeight: 700,
                                }}
                              >
                                {t("market.peak", "Peak")}
                              </span>
                            )}
                          </td>
                          <td
                            style={{
                              padding: "9px 10px",
                              fontWeight: 700,
                              color: isPeak ? "#f59e0b" : "var(--text-main)",
                            }}
                          >
                            ₹
                            {Number(row.predicted_price).toLocaleString(
                              "en-IN",
                            )}
                            {t("market.per_qtl", "/qtl")}
                          </td>
                          <td
                            style={{
                              padding: "9px 10px",
                              color: "var(--text-muted)",
                            }}
                          >
                            ₹{row.min_expected_price} – ₹
                            {row.max_expected_price}
                          </td>
                          <td
                            style={{ padding: "9px 10px", textAlign: "center" }}
                          >
                            {row.trend === "up" ? (
                              <span
                                style={{
                                  color: "#10b981",
                                  fontWeight: 600,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 2,
                                  fontSize: 11.5,
                                }}
                              >
                                <ArrowUpRight size={12} /> {t("market.trend_rise", "Rise")}
                              </span>
                            ) : row.trend === "down" ? (
                              <span
                                style={{
                                  color: "#ef4444",
                                  fontWeight: 600,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 2,
                                  fontSize: 11.5,
                                }}
                              >
                                <ArrowDownRight size={12} /> {t("market.trend_fall", "Fall")}
                              </span>
                            ) : (
                              <span
                                style={{
                                  color: "#6b7280",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 2,
                                  fontSize: 11.5,
                                }}
                              >
                                <Minus size={12} /> {t("market.trend_stable", "Stable")}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
