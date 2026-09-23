import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function LoadingPage({
  title,
  message,
  redirectTo,
  duration = 0,
  showServerWakeupNotes = true,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [elapsed, setElapsed] = useState(0);

  const finalTitle = title || location?.state?.title || "AgriAI";
  const initialMessage =
    message ||
    location?.state?.message ||
    "Please wait while we prepare your session...";
  const targetRedirect = redirectTo || location?.state?.redirectTo;
  const finalDuration = location?.state?.duration ?? duration;

  useEffect(() => {
    if (!showServerWakeupNotes || targetRedirect) return;
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [showServerWakeupNotes, targetRedirect]);

  useEffect(() => {
    if (targetRedirect) {
      if (finalDuration <= 0) {
        navigate(targetRedirect, { replace: true });
        return;
      }
      const timer = setTimeout(() => {
        navigate(targetRedirect, { replace: true });
      }, finalDuration);
      return () => clearTimeout(timer);
    }
  }, [targetRedirect, finalDuration, navigate]);

  let dynamicMessage = initialMessage;
  if (showServerWakeupNotes && !targetRedirect) {
    if (elapsed >= 10) {
      dynamicMessage = "Almost ready, finalizing your workspace...";
    } else if (elapsed >= 4) {
      dynamicMessage = "Connecting to server...";
    }
  }

  return (
    <div className="pro-fullscreen-loader">
      <style>{`
        .pro-fullscreen-loader {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          z-index: 99999;
          user-select: none;
          padding: 24px;
        }

        [data-theme="dark"] .pro-fullscreen-loader {
          background: #091712;
        }

        .pro-loader-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 340px;
          width: 100%;
        }

        .agri-leaf-logo-wrap {
          position: relative;
          width: 78px;
          height: 78px;
          margin-bottom: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
        }

        .agri-leaf-logo {
          width: 100%;
          height: 100%;
          animation: agriLogoFloat 3.4s ease-in-out infinite alternate;
          filter: drop-shadow(0 6px 16px rgba(16, 185, 129, 0.28));
          overflow: visible;
        }

        [data-theme="dark"] .agri-leaf-logo {
          filter: drop-shadow(0 6px 20px rgba(52, 211, 153, 0.4));
        }

        @keyframes agriLogoFloat {
          0% { transform: translateY(0px) scale(1); }
          100% { transform: translateY(-6px) scale(1.03); }
        }

        .agri-energy-pulse {
          stroke-dasharray: 25 80;
          stroke-dashoffset: 105;
          animation: agriFlowEnergy 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .pulse-right {
          animation-delay: 0.25s;
        }

        @keyframes agriFlowEnergy {
          0% { stroke-dashoffset: 105; opacity: 0.15; }
          35% { opacity: 1; }
          75%, 100% { stroke-dashoffset: 0; opacity: 0; }
        }

        .agri-leaf-left-group,
        .agri-leaf-right-group {
          transform-box: fill-box;
          transform-origin: 48px 58px;
        }

        .agri-leaf-left-group {
          animation: agriLeftLeafFlex 3.4s ease-in-out infinite alternate;
        }

        @keyframes agriLeftLeafFlex {
          0% { transform: rotate(0deg) scale(1); }
          100% { transform: rotate(-3.5deg) scale(1.02); }
        }

        .agri-leaf-right-group {
          animation: agriRightLeafFlex 3.4s ease-in-out infinite alternate;
        }

        @keyframes agriRightLeafFlex {
          0% { transform: rotate(0deg) scale(1); }
          100% { transform: rotate(3deg) scale(1.02); }
        }

        .agri-leaf-surface {
          animation: agriSurfaceRadiance 2.6s ease-in-out infinite alternate;
        }

        @keyframes agriSurfaceRadiance {
          0% { filter: brightness(1) drop-shadow(0 2px 4px rgba(16, 185, 129, 0.2)); }
          100% { filter: brightness(1.15) drop-shadow(0 4px 10px rgba(52, 211, 153, 0.5)); }
        }

        .pro-brand-title {
          font-family: 'Outfit', system-ui, -apple-system, sans-serif;
          font-size: 1.45rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #0f172a;
          margin: 0 0 8px 0;
        }

        [data-theme="dark"] .pro-brand-title {
          color: #f8fafc;
        }

        .pro-brand-title span {
          color: #10b981;
        }

        .pro-status-text {
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          font-size: 0.875rem;
          font-weight: 400;
          color: #64748b;
          margin: 0 0 28px 0;
          line-height: 1.5;
        }

        [data-theme="dark"] .pro-status-text {
          color: #94a3b8;
        }

        .pro-bar-track {
          width: 200px;
          height: 3px;
          background: #e2e8f0;
          border-radius: 99px;
          overflow: hidden;
          position: relative;
        }

        [data-theme="dark"] .pro-bar-track {
          background: rgba(255, 255, 255, 0.1);
        }

        .pro-bar-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 35%;
          background: #10b981;
          border-radius: 99px;
          animation: proSlide 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        @keyframes proSlide {
          0% { left: -35%; width: 25%; }
          50% { width: 45%; }
          100% { left: 100%; width: 25%; }
        }
      `}</style>

      <div className="pro-loader-content">
        <div className="agri-leaf-logo-wrap">
          <svg
            className="agri-leaf-logo"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="mainStemGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#047857" />
                <stop offset="50%" stopColor="#059669" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>

              <linearGradient id="leftLeafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#065f46" />
                <stop offset="45%" stopColor="#059669" />
                <stop offset="85%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>

              <linearGradient id="rightLeafGrad" x1="20%" y1="100%" x2="80%" y2="0%">
                <stop offset="0%" stopColor="#047857" />
                <stop offset="40%" stopColor="#10b981" />
                <stop offset="85%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#6ee7b7" />
              </linearGradient>

              <linearGradient id="pulseGlowGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0" />
              </linearGradient>
            </defs>

            <path
              d="M 50 86 C 50 76 49 66 48 58"
              stroke="url(#mainStemGrad)"
              strokeWidth="4.2"
              strokeLinecap="round"
            />

            <g className="agri-leaf-left-group">
              <path
                d="M 48 60 C 30 60 16 48 18 32 C 26 26 42 36 48 54 Z"
                fill="url(#leftLeafGrad)"
                stroke="#34d399"
                strokeWidth="1.2"
                strokeLinejoin="round"
                className="agri-leaf-surface"
              />
              <path
                d="M 48 60 C 38 52 28 43 20 33"
                stroke="url(#mainStemGrad)"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
              <path
                d="M 50 86 C 50 76 49 66 48 60 C 38 52 28 43 20 33"
                stroke="url(#pulseGlowGrad)"
                strokeWidth="2"
                strokeLinecap="round"
                className="agri-energy-pulse"
              />
            </g>

            <g className="agri-leaf-right-group">
              <path
                d="M 48 58 C 54 44 70 34 78 16 C 72 14 52 24 46 48 Z"
                fill="url(#rightLeafGrad)"
                stroke="#6ee7b7"
                strokeWidth="1.2"
                strokeLinejoin="round"
                className="agri-leaf-surface"
              />
              <path
                d="M 48 58 C 54 44 64 30 77 17"
                stroke="url(#mainStemGrad)"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              <path
                d="M 50 86 C 50 76 49 66 48 58 C 54 44 64 30 77 17"
                stroke="url(#pulseGlowGrad)"
                strokeWidth="2.2"
                strokeLinecap="round"
                className="agri-energy-pulse pulse-right"
              />
            </g>

            <circle cx="48" cy="58" r="2.2" fill="#34d399" />
          </svg>
        </div>

        <h2 className="pro-brand-title">
          {finalTitle === "AgriAI" ? (
            <>
              Agri<span>AI</span>
            </>
          ) : (
            finalTitle
          )}
        </h2>

        <p className="pro-status-text">{dynamicMessage}</p>

        <div className="pro-bar-track">
          <div className="pro-bar-fill" />
        </div>
      </div>
    </div>
  );
}
