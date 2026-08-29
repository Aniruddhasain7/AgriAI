import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import {
  CloudSun,
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  X,
} from "lucide-react";

export default function WeatherAdvice() {
  const { t } = useTranslation();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationName, setLocationName] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      const results = await api.searchLocation(searchQuery);
      setSearchResults(results);
      setShowDropdown(results.length > 0);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadWeatherForCoords = async (lat, lon, label = "") => {
    setLoading(true);
    setError("");
    setShowDropdown(false);

    try {
      const data = await api.getWeatherAdvice(lat, lon);
      if (data.error) throw new Error(data.error);
      setResult(data);
      setLocationName(label || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`);
    } catch (e) {
      setError(e.message || "Failed to load weather forecast.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentLocation = () => {
    setLoading(true);
    setError("");
    setResult(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser. Please search for your city or district above.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try {
          const resolvedName = await api.reverseGeocode(lat, lon);
          await loadWeatherForCoords(lat, lon, resolvedName);
        } catch (err) {
          console.warn("Reverse geocoding failed:", err);
          await loadWeatherForCoords(lat, lon, `GPS: ${lat.toFixed(2)}°, ${lon.toFixed(2)}°`);
        }
      },
      (geoErr) => {
        console.warn("GPS permission error:", geoErr);
        setError("GPS permission denied or location unavailable. Please search for your city or district in the search box above.");
        setLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectSearchResult = (item) => {
    const label = `${item.name}${item.admin1 ? `, ${item.admin1}` : ""}, ${item.country}`;
    setSearchQuery(item.name);
    loadWeatherForCoords(item.latitude, item.longitude, label);
  };

  const renderSprayingBadge = (sprayingWindow) => {
    if (!sprayingWindow) return null;
    const isOptimal = sprayingWindow.status === "Optimal";
    const isMarginal = sprayingWindow.status === "Marginal";

    const bg = isOptimal
      ? "rgba(16, 185, 129, 0.12)"
      : isMarginal
      ? "rgba(245, 158, 11, 0.12)"
      : "rgba(239, 68, 68, 0.12)";
    const color = isOptimal ? "#10b981" : isMarginal ? "#f59e0b" : "#ef4444";
    const borderColor = isOptimal
      ? "rgba(16, 185, 129, 0.25)"
      : isMarginal
      ? "rgba(245, 158, 11, 0.25)"
      : "rgba(239, 68, 68, 0.25)";

    return (
      <div
        style={{
          background: bg,
          border: `1px solid ${borderColor}`,
          borderRadius: "var(--radius-md)",
          padding: "16px 20px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {isOptimal ? (
            <ShieldCheck size={28} style={{ color, flexShrink: 0 }} />
          ) : isMarginal ? (
            <AlertCircle size={28} style={{ color, flexShrink: 0 }} />
          ) : (
            <AlertTriangle size={28} style={{ color, flexShrink: 0 }} />
          )}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontWeight: 800, fontSize: "16px", color }}>
                {t("weather.spraying_window", "Spraying Window")}: {sprayingWindow.status}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  background: color,
                  color: "#fff",
                }}
              >
                {sprayingWindow.badge}
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
              {sprayingWindow.reason}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const render3DayForecast = (forecast) => {
    if (!forecast || !forecast.temperature_2m_max) return null;
    const days = forecast.time || ["Day 1", "Day 2", "Day 3"];

    return (
      <div style={{ marginTop: "28px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Calendar size={18} style={{ color: "var(--primary-500)" }} />
          {t("weather.forecast_3day", "3-Day Farm Forecast")}
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))",
            gap: "12px",
            marginBottom: "28px",
          }}
        >
          {days.map((dateStr, idx) => {
            const maxT = forecast.temperature_2m_max?.[idx] ?? "--";
            const minT = forecast.temperature_2m_min?.[idx] ?? "--";
            const rain = forecast.precipitation_sum?.[idx] ?? 0;

            let dayLabel = dateStr;
            if (idx === 0) dayLabel = "Today";
            else if (idx === 1) dayLabel = "Tomorrow";
            else if (dateStr.includes("-")) {
              try {
                const d = new Date(dateStr);
                dayLabel = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
              } catch {
                dayLabel = `Day ${idx + 1}`;
              }
            }

            return (
              <div
                key={idx}
                style={{
                  background: "var(--bg-input)",
                  padding: "16px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--primary-500)", marginBottom: "6px" }}>
                  {dayLabel}
                </div>
                <div style={{ fontSize: "19px", fontWeight: 800, marginBottom: "4px" }}>
                  {maxT}° <span style={{ fontSize: "13.5px", color: "var(--text-muted)", fontWeight: 500 }}>/ {minT}°C</span>
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    color: rain > 0.5 ? "#3b82f6" : "var(--text-muted)",
                    marginTop: "6px",
                    fontWeight: 600,
                  }}
                >
                  <CloudRain size={13} />
                  <span>{rain > 0 ? `${rain} mm` : "Dry"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", width: "100%" }}>
      <div className="page-header">
        <div className="page-badge">
          <CloudSun size={14} />
          <span>{t("weather.badge", "Real-Time Meteo Telemetry")}</span>
        </div>
        <h1 className="page-title">{t("weather.title", "Live Weather Advisory")}</h1>
        <p className="page-subtitle">
          {t("weather.subtitle", "Micro-climate field radar with 3-day agronomic spraying and irrigation forecasts.")}
        </p>
      </div>

      <div className="glass-card" style={{ width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "stretch" }}>
            <div ref={searchContainerRef} style={{ position: "relative", flex: "1 1 280px", minWidth: "0" }}>
              <div className="input-wrapper" style={{ width: "100%" }}>
                <Search size={18} className="input-icon" />
                <input
                  type="text"
                  className="form-input input-with-icon"
                  placeholder={t("weather.search_placeholder", "Search city, district, or farm location...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (searchResults.length > 0) {
                        handleSelectSearchResult(searchResults[0]);
                      } else if (searchQuery.trim().length >= 2) {
                        const results = await api.searchLocation(searchQuery);
                        if (results && results.length > 0) {
                          handleSelectSearchResult(results[0]);
                        }
                      }
                    }
                  }}
                  onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                  style={{
                    paddingRight: searchQuery ? "38px" : "16px",
                    height: "46px",
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setShowDropdown(false);
                    }}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {showDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-sm)",
                    boxShadow: "var(--shadow-lg)",
                    maxHeight: "220px",
                    overflowY: "auto",
                  }}
                >
                  {searchResults.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectSearchResult(item)}
                      style={{
                        padding: "11px 14px",
                        borderBottom: idx < searchResults.length - 1 ? "1px solid var(--border-color)" : "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        fontSize: "14px",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-input)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <MapPin size={16} style={{ color: "var(--primary-500)", flexShrink: 0 }} />
                      <div>
                        <strong>{item.name}</strong>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "6px" }}>
                          {item.admin1 ? `${item.admin1}, ` : ""}
                          {item.country}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={fetchCurrentLocation}
              className="btn-primary"
              disabled={loading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                whiteSpace: "nowrap",
                padding: "0 22px",
                height: "46px",
                flex: "0 0 auto",
                width: "auto",
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="spinner" />
                  <span>{t("weather.fetching", "Locating & Fetching...")}</span>
                </>
              ) : (
                <>
                  <MapPin size={18} />
                  <span>{t("weather.use_gps", "Use Live GPS Location")}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="alert-box alert-error" style={{ marginBottom: "24px" }}>
            <AlertTriangle size={20} />
            <div style={{ flex: 1 }}>
              <strong>Weather Notice</strong>
              <p style={{ fontSize: "13px", marginTop: "4px" }}>{error}</p>
            </div>
          </div>
        )}

        {result && result.current_conditions && (
          <div style={{ textAlign: "left", marginTop: "8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "16px",
                borderBottom: "1px solid var(--border-color)",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MapPin size={20} style={{ color: "var(--primary-500)" }} />
                <span style={{ fontSize: "16px", fontWeight: 700 }}>
                  {locationName || `${result.location?.lat?.toFixed(2)}°, ${result.location?.lon?.toFixed(2)}°`}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {result.is_direct_feed && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: "12px",
                      background: "rgba(59, 130, 246, 0.12)",
                      color: "#3b82f6",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Sparkles size={12} />
                    {t("weather.direct_feed_badge", "Direct Live Feed")}
                  </span>
                )}
                {result.is_fallback && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: "12px",
                      background: "rgba(245, 158, 11, 0.12)",
                      color: "#f59e0b",
                      border: "1px solid rgba(245, 158, 11, 0.2)",
                    }}
                  >
                    Regional Climate Baseline
                  </span>
                )}
                {result.is_cached && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: "12px",
                      background: "rgba(16, 185, 129, 0.12)",
                      color: "#10b981",
                      border: "1px solid rgba(16, 185, 129, 0.2)",
                    }}
                  >
                    {t("weather.cached_feed_badge", "Live Telemetry")}
                  </span>
                )}
              </div>
            </div>

            {renderSprayingBadge(result.spraying_window)}

            <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>
              {t("weather.current_weather", "Current Live Conditions")}
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))",
                gap: "14px",
                marginBottom: "28px",
              }}
            >
              <div
                style={{
                  background: "var(--bg-input)",
                  padding: "16px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#f59e0b",
                    marginBottom: "8px",
                  }}
                >
                  <Thermometer size={18} />
                  <span style={{ fontSize: "12.5px", fontWeight: 600 }}>
                    {t("weather.temperature", "Temperature")}
                  </span>
                </div>
                <p style={{ fontSize: "24px", fontWeight: 800 }}>
                  {result.current_conditions.temperature_c}°C
                </p>
              </div>

              <div
                style={{
                  background: "var(--bg-input)",
                  padding: "16px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#3b82f6",
                    marginBottom: "8px",
                  }}
                >
                  <Droplets size={18} />
                  <span style={{ fontSize: "12.5px", fontWeight: 600 }}>
                    {t("weather.humidity", "Relative Humidity")}
                  </span>
                </div>
                <p style={{ fontSize: "24px", fontWeight: 800 }}>
                  {result.current_conditions.humidity_percent}%
                </p>
              </div>

              <div
                style={{
                  background: "var(--bg-input)",
                  padding: "16px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "var(--primary-500)",
                    marginBottom: "8px",
                  }}
                >
                  <CloudRain size={18} />
                  <span style={{ fontSize: "12.5px", fontWeight: 600 }}>
                    {t("weather.rainfall", "Precipitation")}
                  </span>
                </div>
                <p style={{ fontSize: "24px", fontWeight: 800 }}>
                  {result.current_conditions.precipitation_mm} mm
                </p>
              </div>

              <div
                style={{
                  background: "var(--bg-input)",
                  padding: "16px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "var(--primary-400)",
                    marginBottom: "8px",
                  }}
                >
                  <Wind size={18} />
                  <span style={{ fontSize: "12.5px", fontWeight: 600 }}>
                    {t("weather.wind_speed", "Wind Speed")}
                  </span>
                </div>
                <p style={{ fontSize: "24px", fontWeight: 800 }}>
                  {result.current_conditions.wind_speed_kph} km/h
                </p>
              </div>
            </div>

            {render3DayForecast(result.forecast_3_day)}

            <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>
              {t("weather.field_advice", "Farming Recommendations")}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {result.farming_advice && result.farming_advice.map((tip, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "14px 16px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <CheckCircle size={18} style={{ color: "var(--primary-500)", flexShrink: 0, marginTop: "2px" }} />
                  <p style={{ fontSize: "14px", color: "var(--text-main)", lineHeight: 1.5 }}>
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
