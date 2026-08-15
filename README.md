# 🌾 AgriAI — AI-Powered Smart Agriculture Platform

**AgriAI** is an advanced, full-stack smart farming web application designed to empower farmers and agricultural experts with real-time machine learning predictions, computer vision disease diagnosis, meteorological advisories, and multilingual AI consultation.

---

<p align="center">
  <img src="./frontend/src/assets/ss1.png" alt="AgriAI" width="100%" style="border-radius: 12px;" />
</p>

---

## 🌟 Key Features

| Icon | Feature                        | Description                                                                                                                                  | Engine / Model                                     |
| :--: | :----------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------- |
|  🍃  | **AI Leaf Disease Detection**  | Upload or scan crop leaf photos using the **Live WebCam Camera Scanner** to detect plant diseases instantly with actionable treatment plans. | ONNX Runtime MobileNetV2 Deep CNN                  |
|  🌾  | **Crop Yield Prediction**      | Predict harvest output in tonnes per hectare based on harvest area, rainfall, temperature, and crop type.                                    | Scikit-Learn Random Forest Regressor (FAO Dataset) |
|  🧪  | **Soil Nutrient Balancer**     | Calculate optimal N-P-K & pH fertilizer ratios and soil acidity amendments for selected crops.                                               | Rule-based Soil Chemistry Balancer                 |
|  ☀️  | **Real-Time Weather Advisory** | Live meteorological forecasts with 3-day customized farming recommendations tailored to your location.                                       | Live Weather API Integration                       |
|  📈  | **Mandi Market Prices**        | Track real-time crop commodity price trends across various Indian states and markets.                                                        | Real-Time Mandi Market Tracker                     |
|  💬  | **Multilingual AI Assistant**  | Instant 24/7 agricultural consultation in **English**, **Hindi (हिंदी)**, and **Bengali (বাংলা)**.                                           | Google Gemini Multilingual LLM                     |
|  🌗  | **Adaptive Theme System**      | Glassmorphic UI with automatic Light & Dark mode support and responsive mobile drawer navigation.                                            | Vanilla CSS3 Variables & Glassmorphism             |

---

## 🛠️ Technology Stack

| Domain                      | Technology              | Version            | Purpose                                                                                        |
| :-------------------------- | :---------------------- | :----------------- | :--------------------------------------------------------------------------------------------- |
| **Frontend Core**           | React 19                | `v19.2.8`          | Declarative component UI library                                                               |
| **Build System**            | Vite                    | `v8.2.1`           | Ultra-fast development server & bundler                                                        |
| **Icons & UI**              | Lucide React            | `v0.453.0`         | Modern, lightweight icon library                                                               |
| **Internationalization**    | i18next / react-i18next | `v23.16.2`         | Multilingual support (EN, HI, BN)                                                              |
| **Routing**                 | React Router DOM        | `v6.27.0`          | Client-side SPA routing                                                                        |
| **Backend Core**            | Flask                   | `v3.0.3`           | Python micro-framework for RESTful API                                                         |
| **ML Inference**            | ONNX Runtime            | `v1.19.2`          | Lightweight MobileNetV2 disease model inference (replaces PyTorch runtime — ~15 MB vs ~800 MB) |
| **Model Training & Export** | PyTorch / torchvision   | `v2.4.0`           | MobileNetV2 CNN training with GPU CUDA acceleration & ONNX export                              |
| **Machine Learning**        | Scikit-Learn            | `v1.5.1`           | Random Forest Crop Yield & Crop Recommender                                                    |
| **Data Processing**         | NumPy & Pandas          | `v1.26.4 / v2.2.2` | Dataset transformations & array calculations                                                   |
| **AI Assistant**            | Google Gemini API       | `>=2.17.0`         | Multilingual agricultural LLM chatbot                                                          |
| **Database ORM**            | Flask-SQLAlchemy        | `v3.1.1`           | Unified PostgreSQL ORM (Supabase / Cloud / Docker)                                             |
| **DB Driver**               | psycopg2-binary         | `v2.9.9`           | PostgreSQL Python connector                                                                    |
| **Production Server**       | Gunicorn                | `v22.0.0`          | Python WSGI HTTP server                                                                        |
| **Containerization**        | Docker                  | —                  | Python 3.11.9 locked runtime for Render                                                        |
| **Deployment (Backend)**    | Render                  | —                  | Free Docker web service (Flask API)                                                            |
| **Deployment (Database)**   | Supabase                | —                  | Free managed PostgreSQL (500 MB)                                                               |
| **Deployment (Frontend)**   | Vercel                  | —                  | Free static React SPA hosting                                                                  |

---

## 🔄 System Architecture

```mermaid
graph TD
    A[Client UI — React 19 + Vite on Vercel] -->|HTTPS Requests| B[Flask API — Gunicorn on Render]
    A -->|Live WebCam / Photo Upload| C[ONNX Runtime MobileNetV2 Disease Engine]

    B --> D[Authentication Handler — PBKDF2]
    B --> C
    B --> E[Random Forest FAO Yield Predictor]
    B --> F[Soil N-P-K & pH Balancer Engine]
    B --> G[Live Weather API & Advisory Generator]
    B --> H[Mandi Market Prices Tracker]
    B --> I[Google Gemini Multilingual Assistant]

    D --> J[(PostgreSQL Database)]
    C --> J
    E --> J
```

---

## 📂 Project Structure

```text
Agri-ai/
├── backend/
│   ├── Dockerfile            # Docker image — locks Python 3.11.9 for Render deployment
│   ├── app.py                # Flask Application Factory & Route Registration
│   ├── models_db.py          # SQLAlchemy Models (User, DiseaseHistory, PredictionHistory)
│   ├── requirements.txt      # Python Dependencies (ONNX Runtime, Flask, Gunicorn, psycopg2)
│   ├── models/
│   │   ├── disease_model.onnx    # MobileNetV2 disease model (ONNX format, 9.1 MB)
│   │   ├── crop_model.joblib     # Random Forest crop recommender
│   │   ├── yield_model.joblib    # Random Forest yield predictor
│   │   └── class_indices.json   # Disease class label mapping
│   ├── routes/
│   │   ├── auth.py           # User Authentication Routes
│   │   ├── disease.py        # ONNX Image Scanner API
│   │   ├── yield_predict.py  # FAO Yield Predictor API
│   │   ├── soil.py           # Soil N-P-K Nutrient Balancer
│   │   ├── weather.py        # Live Meteorology API
│   │   ├── market.py         # Mandi Commodity Prices API
│   │   └── chatbot.py        # Multilingual Farmer Assistant API
│   └── ml_training/          # ML Model Training Scripts & Datasets
│       ├── train_disease_model.py  # PyTorch MobileNetV2 CNN training script (CUDA)
│       ├── train_crop_model.py     # Scikit-Learn Crop Recommender trainer
│       └── train_yield_model.py    # Scikit-Learn FAO Yield Predictor trainer
├── frontend/
│   ├── src/
│   │   ├── api/client.js     # Fetch-based API client with Authorization headers
│   │   ├── components/       # Reusable UI Components (Navbar, ThemeToggle, LanguageSwitcher)
│   │   ├── pages/            # Page Views (Landing, Dashboard, Tools, Login, Signup)
│   │   ├── i18n/             # Locale Translations (en, hi, bn)
│   │   └── index.css         # Global Glassmorphic Design System
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

# Create a .env file with your keys
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

The app is deployed on a **free-forever stack**:

| Service      | Platform                         | Notes                                                          |
| ------------ | -------------------------------- | -------------------------------------------------------------- |
| **Frontend** | [Vercel](https://vercel.com)     | Auto-deploys from `main` branch                                |
| **Backend**  | [Render](https://render.com)     | Docker service, free tier (spins down after 15 min inactivity) |
| **Database** | [Supabase](https://supabase.com) | Free PostgreSQL, 500 MB                                        |

### Backend — Render (Docker)

1. Create a **Web Service** on Render
2. Connect your GitHub repo → set **Root Directory**: `backend`, **Runtime**: `Docker`
3. Add environment variables:
   - `DATABASE_URL` → Supabase connection pooler URI (Session mode, port 6543)
   - `GEMINI_API_KEY` → Your Google Gemini API key

### Database — Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database → Connection pooling → Session mode**
3. Copy the URI and set it as `DATABASE_URL` in Render

### Frontend — Vercel

1. Import your GitHub repo to [vercel.com](https://vercel.com)
2. Set **Root Directory**: `frontend`, **Framework**: `Vite`
3. Add environment variable:
   - `VITE_API_URL` → Your Render backend URL (e.g. `https://agriai-backend-xxxx.onrender.com`)

---

## 🔑 Environment Variables

| Variable         | Where                    | Description                                         |
| ---------------- | ------------------------ | --------------------------------------------------- |
| `GEMINI_API_KEY` | `backend/.env` + Render  | Google Gemini API key for AI chatbot                |
| `DATABASE_URL`   | `backend/.env` + Render  | Supabase PostgreSQL connection pooler URI           |
| `VITE_API_URL`   | `frontend/.env.local` + Vercel | Full URL of the Render backend (no trailing `/api`) |

---

## 📡 API Endpoints

| Method | Endpoint               | Description                              |
| ------ | ---------------------- | ---------------------------------------- |
| `GET`  | `/api/health`          | Health check                             |
| `POST` | `/api/auth/register`   | User registration                        |
| `POST` | `/api/auth/login`      | User login                               |
| `GET`  | `/api/auth/me`         | Get current user                         |
| `POST` | `/api/disease/predict` | Leaf disease detection (multipart image) |
| `GET`  | `/api/disease/history` | Disease scan history                     |
| `POST` | `/api/yield/predict`   | Crop yield prediction                    |
| `POST` | `/api/crop/recommend`  | Crop recommendation                      |
| `POST` | `/api/soil/recommend`  | Soil nutrient recommendation             |
| `GET`  | `/api/weather/advice`  | Weather-based farming advisory           |
| `GET`  | `/api/market/trend`    | Market price trends                      |
| `POST` | `/api/chatbot/message` | AI farming assistant                     |
