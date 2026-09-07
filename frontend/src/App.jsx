import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import DiseaseDetection from "./pages/DiseaseDetection";
import YieldPrediction from "./pages/YieldPrediction";
import WeatherAdvice from "./pages/WeatherAdvice";
import Chatbot from "./pages/Chatbot";
import SoilAnalysis from "./pages/SoilAnalysis";
import MarketPrices from "./pages/MarketPrices";
import CropRecommendation from "./pages/CropRecommendation";
import LoadingPage from "./pages/LoadingPage";
import { api } from "./api/client";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("agriai_token");
  const user = localStorage.getItem("agriai_user");
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/loading";

  useEffect(() => {
    // Warm up the backend API immediately on initial frontend load
    api.ping();
  }, []);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main className={hideNavbar ? "" : "main-content"}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/disease"
            element={
              <ProtectedRoute>
                <DiseaseDetection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/yield"
            element={
              <ProtectedRoute>
                <YieldPrediction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/weather"
            element={
              <ProtectedRoute>
                <WeatherAdvice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chatbot"
            element={
              <ProtectedRoute>
                <Chatbot />
              </ProtectedRoute>
            }
          />
          <Route
            path="/soil"
            element={
              <ProtectedRoute>
                <SoilAnalysis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/market"
            element={
              <ProtectedRoute>
                <MarketPrices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crop"
            element={
              <ProtectedRoute>
                <CropRecommendation />
              </ProtectedRoute>
            }
          />
          <Route path="/loading" element={<LoadingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </BrowserRouter>
  );
}
