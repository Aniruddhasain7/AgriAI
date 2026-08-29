import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sprout } from "lucide-react";

export default function LoadingPage({
  title,
  message,
  redirectTo,
  duration = 500,
  showServerWakeupNotes = true,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [elapsed, setElapsed] = useState(0);

  const finalTitle = title || location?.state?.title || "AgriAI";
  const initialMessage =
    message || location?.state?.message || "Loading, please wait...";
  const targetRedirect = redirectTo || location?.state?.redirectTo;
  const finalDuration = location?.state?.duration ?? duration;

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (targetRedirect) {
      const timer = setTimeout(() => {
        navigate(targetRedirect, { replace: true });
      }, finalDuration);
      return () => clearTimeout(timer);
    }
  }, [targetRedirect, finalDuration, navigate]);

  let dynamicMessage = initialMessage;
  if (showServerWakeupNotes && !targetRedirect) {
    if (elapsed >= 15) {
      dynamicMessage =
        "Almost ready! Finalizing server initialization & database handshake...";
    } else if (elapsed >= 3) {
      dynamicMessage = "Connecting to AgriAI server...";
    }
  }

  return (
    <div className="simple-loader-page">
      <style>{`
        .simple-loader-page {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          box-sizing: border-box;
          background-color: #f4fbf7;
          z-index: 99999;
          transition: background-color 0.3s ease;
        }

        .simple-loader-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 42px 36px;
          max-width: 400px;
          width: 100%;
          border-radius: 24px;
          background: #ffffff;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(16, 185, 129, 0.2);
          box-shadow: 0 16px 36px rgba(16, 185, 129, 0.12);
          transition: all 0.3s ease;
          animation: cardFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes cardFadeIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .simple-loader-spinner-wrapper {
          position: relative;
          width: 72px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 22px;
        }

        .simple-loader-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 3px solid rgba(16, 185, 129, 0.15);
          border-top-color: #10b981;
          animation: spin 0.9s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        }

        .simple-loader-icon {
          color: #10b981;
          animation: pulse 1.8s ease-in-out infinite;
        }

        .simple-loader-title {
          font-family: Outfit, system-ui, -apple-system, sans-serif;
          font-size: 1.45rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 8px 0;
          letter-spacing: -0.02em;
        }

        .simple-loader-msg {
          font-family: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;
          font-size: 0.92rem;
          color: #64748b;
          margin: 0 0 24px 0;
          line-height: 1.5;
        }

        .simple-loader-bar {
          width: 100%;
          height: 4px;
          background: rgba(16, 185, 129, 0.15);
          border-radius: 99px;
          overflow: hidden;
          position: relative;
        }

        .simple-loader-bar-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 40%;
          background: #10b981;
          border-radius: 99px;
          animation: slide 1.4s ease-in-out infinite;
        }

        /* Dark Theme Styles */
        [data-theme="dark"] .simple-loader-page {
          background-color: #061510;
        }

        [data-theme="dark"] .simple-loader-card {
          background: #0d211a;
          border: 1px solid rgba(16, 185, 129, 0.25);
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.5), 0 0 25px rgba(16, 185, 129, 0.15);
        }

        [data-theme="dark"] .simple-loader-ring {
          border-color: rgba(16, 185, 129, 0.2);
          border-top-color: #34d399;
        }

        [data-theme="dark"] .simple-loader-icon {
          color: #34d399;
        }

        [data-theme="dark"] .simple-loader-title {
          color: #f8fafc;
        }

        [data-theme="dark"] .simple-loader-msg {
          color: #94a3b8;
        }

        [data-theme="dark"] .simple-loader-bar {
          background: rgba(16, 185, 129, 0.2);
        }

        [data-theme="dark"] .simple-loader-bar-fill {
          background: #34d399;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(0.92); opacity: 0.85; }
          50% { transform: scale(1.08); opacity: 1; }
        }

        @keyframes slide {
          0% { left: -40%; }
          100% { left: 100%; }
        }
      `}</style>

      <div className="simple-loader-card">
        <div className="simple-loader-spinner-wrapper">
          <div className="simple-loader-ring" />
          <Sprout className="simple-loader-icon" size={30} />
        </div>

        <h3 className="simple-loader-title">{finalTitle}</h3>
        <p className="simple-loader-msg">{dynamicMessage}</p>

        <div className="simple-loader-bar">
          <div className="simple-loader-bar-fill" />
        </div>
      </div>
    </div>
  );
}
