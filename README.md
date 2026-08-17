# 🌾 AgriAI — AI-Powered Smart Agriculture Platform

<p align="center">
  <img src="./frontend/src/assets/ss1.png" alt="AgriAI" width="100%" style="border-radius: 12px;" />
</p>

**AgriAI** is an advanced, full-stack smart farming web application designed to empower farmers and agricultural experts with real-time machine learning predictions, computer vision disease diagnosis, crop recommendations, meteorological advisories, soil balancing, mandi market price tracking, and multilingual AI consultation.

---

## 🌟 Key Features

| Icon | Feature                        | Description                                                                                                                                  | Engine / Model                                     |
| :--: | :----------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------- |
|  🍃  | **AI Leaf Disease Detection**  | Upload or scan crop leaf photos using the **Live WebCam Camera Scanner** to detect plant diseases instantly with actionable treatment plans. | ONNX Runtime MobileNetV2 Deep CNN                  |
|  🌾  | **Crop Yield Prediction**      | Predict harvest output in tonnes per hectare based on harvest area, rainfall, temperature, and crop type.                                    | Scikit-Learn Random Forest Regressor (FAO Dataset) |
|  🌱  | **AI Crop Recommendation**     | Recommend optimal crops based on soil N-P-K levels, pH, ambient temperature, humidity, and rainfall.                                         | Scikit-Learn Random Forest Classifier              |
|  🧪  | **Soil Nutrient Balancer**     | Calculate optimal N-P-K & pH fertilizer ratios and soil acidity amendments for selected crops.                                               | Rule-based Soil Chemistry Balancer                 |
|  ☀️  | **Real-Time Weather Advisory** | Live meteorological forecasts with 3-day customized farming recommendations tailored to your location.                                       | Live Weather API Integration                       |
|  📈  | **Mandi Market Prices**        | Track real-time crop commodity price trends across various Indian states and markets.                                                        | Real-Time Mandi Market Tracker                     |
|  💬  | **Multilingual AI Assistant**  | Instant 24/7 agricultural consultation in **English**, **Hindi (हिंदी)**, and **Bengali (বাংলা)**.                                           | Google Gemini Multilingual LLM                     |
|  🌗  | **Adaptive Theme System**      | Glassmorphic UI with automatic Light & Dark mode support and responsive mobile drawer navigation.                                            | Vanilla CSS3 Variables & Glassmorphism             |

---

## 🛠️ Technology Stack

| Domain                      | Technology              | Version              | Purpose                                                                                        |
| :-------------------------- | :---------------------- | :------------------- | :--------------------------------------------------------------------------------------------- |
| **Frontend Core**           | React 19                | `v19.2.8`            | Declarative component UI library                                                               |
| **Build System**            | Vite                    | `v8.2.0`             | Ultra-fast development server & bundler                                                        |
| **Icons & UI**              | Lucide React            | `v1.31.0`            | Modern, lightweight icon library                                                               |
| **Internationalization**    | i18next / react-i18next | `v23.14.0 / v15.0.1` | Multilingual support (EN, HI, BN)                                                              |
| **Routing**                 | React Router DOM        | `v6.26.0`            | Client-side SPA routing                                                                        |
| **Backend Core**            | Flask                   | `v3.0.3`             | Python micro-framework for RESTful API                                                         |
| **ML Inference**            | ONNX Runtime            | `v1.19.2`            | Lightweight MobileNetV2 disease model inference (replaces PyTorch runtime — ~15 MB vs ~800 MB) |
| **Model Training & Export** | PyTorch / torchvision   | `v2.4.0`             | MobileNetV2 CNN training with GPU CUDA acceleration & ONNX export                              |
| **Machine Learning**        | Scikit-Learn            | `v1.5.1`             | Random Forest Crop Yield & Crop Recommender                                                    |
| **Data Processing**         | NumPy & Pandas          | `v1.26.4 / v2.2.2`   | Dataset transformations & array calculations                                                   |
| **AI Assistant**            | Google Gemini API       | `>=2.17.0`           | Multilingual agricultural LLM chatbot (`google-genai`)                                         |
| **Database ORM**            | Flask-SQLAlchemy        | `v3.1.1`             | Unified PostgreSQL ORM (Supabase / Cloud / Docker)                                             |
| **DB Driver**               | psycopg2-binary         | `v2.9.9`             | PostgreSQL Python connector                                                                    |
| **Production Server**       | Gunicorn                | `v22.0.0`            | Python WSGI HTTP server                                                                        |
| **Containerization**        | Docker                  | —                    | Python 3.11.9-slim locked runtime for cloud services                                           |
| **Deployment (Backend)**    | Render                  | —                    | Free Docker web service (Flask API)                                                            |
| **Deployment (Database)**   | Supabase                | —                    | Free managed PostgreSQL (500 MB)                                                               |
| **Deployment (Frontend)**   | Vercel                  | —                    | Free static React SPA hosting                                                                  |

---

## 🔄 System Architecture

```mermaid
graph TB
    subgraph Frontend["Frontend Presentation Layer (Vercel)"]
        UI["React 19 SPA + Vite"]
        Cam["WebCam & Photo Scanner"]
        I18N["i18next Engine (EN / HI / BN)"]
        UI --- Cam
        UI --- I18N
    end

    subgraph Gateway["API & Gateway Layer (Render Docker)"]
        Flask["Flask REST API (Gunicorn WSGI)"]
        Auth["PBKDF2 Auth & Security Guard"]
        Flask --> Auth
    end

    subgraph Intelligence["AI, ML & Analytical Engines"]
        ONNX["ONNX Runtime (MobileNetV2 CNN)"]
        CropRF["Scikit-Learn Crop Recommender"]
        YieldRF["Scikit-Learn FAO Yield Predictor"]
        SoilEng["Soil Chemistry N-P-K Balancer"]
        LLM["Google Gemini Multilingual LLM"]
    end

    subgraph External["External Services & APIs"]
        Weather["Live Meteorology Weather API"]
        Market["Mandi Commodity Market Price Tracker"]
    end

    subgraph Persistence["Persistence Layer (Supabase)"]
        DB[("PostgreSQL Database")]
    end

    %% Inter-layer Data Flow
    UI -->|HTTPS REST Requests| Flask
    Cam -->|Leaf Photo Payload| ONNX

    Flask -->|Image Inference| ONNX
    Flask -->|Soil & Climate Inputs| CropRF
    Flask -->|Harvest & Area Parameters| YieldRF
    Flask -->|Nutrient Ratios| SoilEng
    Flask -->|Consultation Prompts| LLM

    Flask -->|Fetch Forecasts| Weather
    Flask -->|Fetch Price Trends| Market

    Auth -->|User Profiles| DB
    ONNX -->|Scan Logs| DB
    CropRF -->|Prediction Logs| DB
    YieldRF -->|Yield Logs| DB
```

---

## 📂 Project Structure

```text
Agri-ai/
├── backend/
│   ├── Dockerfile            # Docker image — locks Python 3.11.9-slim runtime
│   ├── app.py                # Flask Application Factory, Routes & Error Handlers
│   ├── convert_to_onnx.py    # PyTorch MobileNetV2 to ONNX export utility
│   ├── models_db.py          # SQLAlchemy Models (User, PredictionHistory)
│   ├── requirements.txt      # Python Dependencies (ONNX Runtime, Flask, Gunicorn, psycopg2)
│   ├── models/
│   │   ├── disease_model.onnx    # MobileNetV2 disease model (ONNX format, ~9.1 MB)
│   │   ├── crop_model.joblib     # Scikit-Learn Random Forest crop recommender
│   │   ├── yield_model.joblib    # Scikit-Learn Random Forest yield predictor
│   │   └── class_indices.json   # Disease class label mapping (38 plant/disease classes)
│   ├── routes/
│   │   ├── auth.py           # User Authentication Routes & Profile Context
│   │   ├── disease.py        # ONNX Image Scanner & Leaf Disease API
│   │   ├── crop_recommend.py # Soil & Climate Crop Recommender API
│   │   ├── yield_predict.py  # FAO Harvest Yield Predictor API
│   │   ├── soil.py           # Soil N-P-K & Acidic/Alkaline Fertilizer Balancer API
│   │   ├── weather.py        # Live Meteorology & 3-Day Farming Advisory API
│   │   ├── market.py         # Mandi Commodity Market Price Trends API
│   │   └── chatbot.py        # Multilingual Farmer Assistant (Gemini LLM) API
│   └── ml_training/          # ML Model Training Scripts
│       ├── train_disease_model.py  # PyTorch MobileNetV2 CNN trainer
│       ├── train_crop_model.py     # Scikit-Learn Crop Recommender trainer
│       └── train_yield_model.py    # Scikit-Learn FAO Yield Predictor trainer
├── frontend/
│   ├── src/
│   │   ├── api/client.js     # Fetch-based API client with Bearer token authorization
│   │   ├── components/       # Reusable UI Components (Navbar, ThemeToggle, LanguageSwitcher)
│   │   ├── pages/            # View Pages
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DiseaseDetection.jsx
│   │   │   ├── CropRecommendation.jsx
│   │   │   ├── YieldPrediction.jsx
│   │   │   ├── SoilAnalysis.jsx
│   │   │   ├── WeatherAdvice.jsx
│   │   │   ├── MarketPrices.jsx
│   │   │   ├── Chatbot.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── SignupPage.jsx
│   │   ├── i18n/             # Locale Translations (en, hi, bn)
│   │   └── index.css         # Global Glassmorphic Design System & CSS Variables
│   ├── vercel.json           # Vercel SPA Client-Side Routing Configuration
│   └── package.json          # Frontend Dependencies & Scripts
├── .gitignore                # Environment & Build Ignore Rules
└── README.md                 # Project Documentation
```

---

## 🚀 Local Development Setup

### 1. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create a .env file with your credentials
echo "GEMINI_API_KEY=your_gemini_api_key" > .env
echo "DATABASE_URL=postgresql://user:password@host:5432/dbname" >> .env

# Run the Flask development server
python app.py
```

Backend starts at `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Create .env.local with backend URL
echo "VITE_API_URL=http://localhost:5000/api" > .env.local

# Start the Vite development server
npm run dev
```

Frontend starts at `http://localhost:5173`

### Demo Account

| Email             | Password   |
| ----------------- | ---------- |
| `demo@agriai.org` | `demo1234` |

---

## 🌐 Production Deployment

The application can be deployed using a **free-forever cloud stack**:

| Service      | Platform                         | Notes                                                         |
| ------------ | -------------------------------- | ------------------------------------------------------------- |
| **Frontend** | [Vercel](https://vercel.com)     | Auto-deploys static SPA from `main` branch                    |
| **Backend**  | [Render](https://render.com)     | Docker web service (spins down after inactivity on free tier) |
| **Database** | [Supabase](https://supabase.com) | Free managed PostgreSQL (500 MB limit)                        |

### Backend — Render (Docker)

1. Create a **Web Service** on Render.
2. Connect your GitHub repo → set **Root Directory**: `backend`, **Runtime**: `Docker`.
3. Add environment variables:
   - `DATABASE_URL` → Supabase connection pooler URI (Session mode, port 6543).
   - `GEMINI_API_KEY` → Your Google Gemini API key.

### Database — Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **Settings → Database → Connection pooling → Session mode**.
3. Copy the URI and set it as `DATABASE_URL` in Render.

### Frontend — Vercel

1. Import your GitHub repo to [vercel.com](https://vercel.com).
2. Set **Root Directory**: `frontend`, **Framework**: `Vite`.
3. Add environment variable:
   - `VITE_API_URL` → Your Render backend URL (e.g. `https://agriai-backend-xxxx.onrender.com`).

---

## 🔑 Environment Variables

| Variable         | Location                       | Description                                      |
| ---------------- | ------------------------------ | ------------------------------------------------ |
| `GEMINI_API_KEY` | `backend/.env` + Render        | Google Gemini API key for AI chatbot             |
| `DATABASE_URL`   | `backend/.env` + Render        | Supabase PostgreSQL connection pooler URI        |
| `VITE_API_URL`   | `frontend/.env.local` + Vercel | Full URL of the backend API (no trailing `/api`) |

---

## 📡 API Endpoints

| Method | Endpoint                   | Description                                              |
| ------ | -------------------------- | -------------------------------------------------------- |
| `GET`  | `/api/health`              | Service health check                                     |
| `POST` | `/api/auth/register`       | User registration                                        |
| `POST` | `/api/auth/login`          | User authentication & token issuance                     |
| `GET`  | `/api/auth/me`             | Fetch authenticated user profile                         |
| `POST` | `/api/disease/predict`     | Leaf disease diagnosis from photo scan                   |
| `GET`  | `/api/disease/history`     | Retrieve past disease diagnosis history                  |
| `POST` | `/api/crop/recommend`      | Crop recommendation based on soil N-P-K & weather inputs |
| `POST` | `/api/yield/predict`       | Crop harvest yield prediction (tonnes/hectare)           |
| `POST` | `/api/soil/recommend`      | Calculate optimal N-P-K fertilizer balancing ratios      |
| `GET`  | `/api/weather/advice`      | Live weather forecast & 3-day farming advisory           |
| `GET`  | `/api/market/trend`        | Mandi commodity market price trends                      |
| `POST` | `/api/chatbot/message`     | Multilingual AI farming assistant (Gemini LLM)           |
| `GET`  | `/api/predictions/history` | Query user prediction logs filtered by tool type         |
