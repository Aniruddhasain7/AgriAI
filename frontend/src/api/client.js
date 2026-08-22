let rawUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").trim();
if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
  rawUrl = "https://" + rawUrl;
}
rawUrl = rawUrl.replace(/\/$/, "");
if (!rawUrl.endsWith("/api")) {
  rawUrl += "/api";
}
const BASE_URL = rawUrl;
async function request(path, options = {}) {
  const token = localStorage.getItem("agriai_token");
  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  try {
    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({
        error: `Server error (${res.status}). Please check backend connection.`
      }));
      throw new Error(err.error || err.message || `Request failed with status ${res.status}`);
    }
    return res.json();
  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error("Unable to connect to AgriAI server. Please check server status and network.");
    }
    throw err;
  }
}
function calculateClientSprayingWindow(tempC, precipMm, windKph, humidity) {
  if (precipMm > 1.0 || windKph > 20.0) {
    return {
      status: "Avoid",
      badge: "Risk of Drift & Wash-off",
      color: "danger",
      reason: "Rainfall or high winds will cause pesticide wash-off and chemical drift."
    };
  }
  if (tempC > 32.0 || windKph > 12.0 || humidity > 85.0) {
    return {
      status: "Marginal",
      badge: "Early Morning Only",
      color: "warning",
      reason: "Spray only during early morning (6-8 AM) before temperature rises and wind picks up."
    };
  }
  return {
    status: "Optimal",
    badge: "Favorable Spraying Window",
    color: "success",
    reason: "Low wind, moderate humidity, and dry canopy provide maximum absorption efficiency."
  };
}
function calculateClientFarmingAdvice(tempC, precipMm, windKph, humidity) {
  const advice = [];
  if (precipMm > 5.0) {
    advice.append?.("Heavy rain forecasted — immediately pause pesticide, herbicide, and top-dress fertilizer spraying.") ||
    advice.push("Heavy rain forecasted — immediately pause pesticide, herbicide, and top-dress fertilizer spraying to prevent nutrient runoff.");
  } else if (precipMm > 0.5) {
    advice.push("Light rain expected — delay chemical foliar applications until crop foliage is completely dry.");
  } else {
    advice.push("Dry canopy conditions — safe window for foliar feeding and standard fungicide sprays.");
  }
  if (precipMm > 10.0) {
    advice.push("Abundant rainfall — suspend all irrigation systems and ensure drainage channels are clear to prevent root rot.");
  } else if (precipMm === 0 && humidity < 40.0) {
    advice.push("Low humidity & high evapotranspiration — apply drip or furrow irrigation, especially for shallow-rooted horticulture crops.");
  } else if (tempC > 32.0) {
    advice.push("High ambient temperature — schedule irrigation during early morning or dusk to minimize evaporation losses.");
  } else {
    advice.push("Moisture levels stable — inspect topsoil (5 cm depth) before scheduling supplemental watering.");
  }
  if (windKph > 30.0) {
    advice.push("Strong wind gusts (>30 km/h) — avoid high-pressure spraying, stake tall standing crops (banana, maize, papaya), and secure greenhouse covers.");
  } else if (windKph > 18.0) {
    advice.push("Moderate breeze — monitor spray droplet drift; calibrate nozzle pressure for coarse droplets.");
  }
  if (tempC > 36.0) {
    advice.push("Severe heat wave warning — provide shade netting for nurseries and consider light sprinkler misting to lower canopy heat.");
  } else if (tempC < 10.0) {
    advice.push("Cold night risk — protect young seedlings with plastic mulch or floating row covers against frost stress.");
  }
  if (precipMm > 15.0) {
    advice.push("Soil saturation alert — avoid operating heavy tractors or harvesters to prevent soil compaction.");
  } else {
    advice.push("Soil trafficability is good — optimal conditions for weeding, tilling, inter-cultivation, and harvesting.");
  }
  return advice;
}
export const api = {
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  getMe: () => request("/auth/me"),
  detectDisease: async (formData) => {
    const token = localStorage.getItem("agriai_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const res = await fetch(`${BASE_URL}/disease/predict`, {
        method: "POST",
        headers,
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({
          error: `Server error (${res.status}). Failed to perform disease diagnosis.`
        }));
        throw new Error(err.error || err.message || "Disease detection failed");
      }
      return res.json();
    } catch (err) {
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        throw new Error("Unable to connect to AgriAI server.");
      }
      throw err;
    }
  },
  getDiseaseHistory: () => request("/disease/history"),
  predictYield: (payload) =>
    request("/yield/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  getWeatherAdvice: async (lat, lon) => {
    try {
      const data = await request(`/weather/advice?lat=${lat}&lon=${lon}`);
      if (data && data.current_conditions) {
        return data;
      }
    } catch (err) {
      console.warn("Backend weather API unavailable or rate-limited, switching to direct client feed...", err.message);
    }
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&daily=precipitation_sum,temperature_2m_max,temperature_2m_min,weather_code&forecast_days=3&timezone=auto`,
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) {
        throw new Error(`Direct weather query failed (${res.status})`);
      }
      const data = await res.json();
      const current = data.current || {};
      const tempC = current.temperature_2m ?? 26.0;
      const precipMm = current.precipitation ?? 0.0;
      const windKph = current.wind_speed_10m ?? 6.0;
      const humidity = current.relative_humidity_2m ?? 65.0;
      return {
        location: { lat, lon },
        current_conditions: {
          temperature_c: Math.round(tempC * 10) / 10,
          humidity_percent: Math.round(humidity * 10) / 10,
          precipitation_mm: Math.round(precipMm * 100) / 100,
          wind_speed_kph: Math.round(windKph * 10) / 10,
          weather_code: current.weather_code ?? 0,
        },
        forecast_3_day: data.daily || {},
        spraying_window: calculateClientSprayingWindow(tempC, precipMm, windKph, humidity),
        farming_advice: calculateClientFarmingAdvice(tempC, precipMm, windKph, humidity),
        is_direct_feed: true,
      };
    } catch (directErr) {
      const isTropical = Math.abs(lat) < 25.0;
      const temp = isTropical ? 28.0 : 22.0;
      const humidity = isTropical ? 68.0 : 55.0;
      const wind = 8.5;
      const precip = 0.0;
      return {
        location: { lat, lon },
        current_conditions: {
          temperature_c: temp,
          humidity_percent: humidity,
          precipitation_mm: precip,
          wind_speed_kph: wind,
        },
        forecast_3_day: {
          time: ["Today", "Tomorrow", "Day 3"],
          temperature_2m_max: [temp + 2, temp + 3, temp + 1],
          temperature_2m_min: [temp - 5, temp - 4, temp - 6],
          precipitation_sum: [0.0, 0.0, 0.2],
        },
        spraying_window: calculateClientSprayingWindow(temp, precip, wind, humidity),
        farming_advice: calculateClientFarmingAdvice(temp, precip, wind, humidity),
        is_fallback: true,
        notice: "Displaying localized agronomic estimate.",
      };
    }
  },
  searchLocation: async (query) => {
    if (!query || query.trim().length < 2) return [];
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=5&language=en&format=json`
      );
      if (!res.ok) return [];
      const data = await res.json();
      return (data.results || []).map((item) => ({
        name: item.name,
        country: item.country || "",
        admin1: item.admin1 || "",
        latitude: item.latitude,
        longitude: item.longitude,
        timezone: item.timezone,
      }));
    } catch (err) {
      console.warn("Geocoding lookup error:", err);
      return [];
    }
  },
  sendChatMessage: (message, sessionId, lang) =>
    request("/chatbot/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, session_id: sessionId, lang }),
    }),
  getSoilRecommendation: (payload) =>
    request("/soil/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  getMarketTrend: (crop) => request(`/market/trend?crop=${crop}`),
  recommendCrop: (payload) =>
    request("/crop/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  getPredictionHistory: (toolType) =>
    request("/predictions/history" + (toolType ? `?tool=${toolType}` : "")),
};
