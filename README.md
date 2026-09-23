# 🌾 AgriAI — AI-Powered Smart Agriculture Platform

<p align="center">
  <img src="./frontend/src/assets/ss1.png" alt="AgriAI" width="100%" style="border-radius: 12px;" />
</p>

**AgriAI** is an advanced, full-stack smart farming web application designed to empower farmers and agricultural experts with real-time machine learning predictions, computer vision disease diagnosis, crop recommendations, meteorological advisories, soil balancing, mandi market price tracking, and multilingual AI consultation.

---

<p align="center">
  <a href="https://agri-ai-5.vercel.app/" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/LIVE_DEMO-VISIT_AGRIAI-22C55E?style=for-the-badge&logo=vercel&logoColor=white&labelColor=000000" alt="Live Demo" height="38" />
  </a>
</p>

---

## 🌟 Core Features

### 1. 🍃 AI Leaf Disease Detection (TensorFlow Lite / LiteRT CNN)
The **AI Leaf Disease Scanner** enables farmers to identify plant pathologies in seconds using just a smartphone or webcam photograph, minimizing crop loss through early intervention.

- **Dual Capture Modes**:
  - **Live WebCam / Camera Scanner**: Real-time camera streaming with environment-facing camera support on mobile devices. Capture a snapshot directly in the field with a single click.
  - **Drag-and-Drop Image Upload**: Supports high-resolution images (`PNG`, `JPG`, `JPEG`, `WEBP`) with automatic client-side validation and file preview.
- **Deep Learning Model (LiteRT)**:
  - Powered by a custom **Convolutional Neural Network (CNN)** trained on the **PlantVillage dataset** (~20,000 annotated leaf images).
  - Exported to **TensorFlow Lite (`.tflite`) format** executed via Google’s **LiteRT runtime (`ai-edge-litert`)**, providing low-latency inference (~1.2 seconds) with a compact memory footprint (~17 MB).
- **Supported Crops & 15 Pathology Classes**:
  - **Pepper (Bell)**: Bacterial Spot, Healthy
  - **Potato**: Early Blight (*Alternaria solani*), Late Blight (*Phytophthora infestans*), Healthy
  - **Tomato**: Bacterial Spot, Early Blight, Late Blight, Leaf Mold, Septoria Leaf Spot, Two-Spotted Spider Mites, Target Spot, Yellow Leaf Curl Virus, Mosaic Virus, Healthy
- **Diagnostic Output & Remediation**:
  - **Primary Diagnosis & Confidence Score**: Displayed as a percentage score (e.g., 98.4%).
  - **Top-3 Alternate Diagnoses**: Visual probability distribution across the top 3 candidate classes for diagnostic transparency.
  - **Actionable Treatment Plans**: Formulates both **organic remedies** (neem oil sprays, copper fungicides, pruning, crop rotation) and **chemical controls** with safe application guidelines.
  - **Historical Audit Trail**: Every diagnosis is automatically logged in the PostgreSQL database with expandable remediation cards for future review.

---

### 2. 🌾 Crop Harvest Yield Prediction (FAO Random Forest Regressor)
The **Harvest Yield Predictor** helps farm managers, agricultural banks, and policymakers forecast expected seasonal harvest yields per hectare before harvesting begins.

- **Agronomic Factors Analyzed**:
  - **Target Country & Crop**: Tailored to regional microclimates and major staple crops (Maize, Potatoes, Rice, Sorghum, Soybeans, Wheat, Cassava, Sweet Potatoes, Yams).
  - **Average Annual Precipitation**: Rainfall volume in millimeters per year (`mm/year`).
  - **Average Growing Season Temperature**: Temperature in degrees Celsius (`°C`).
  - **Pesticide Applications**: Chemical plant protection inputs in metric tonnes.
- **Machine Learning Architecture**:
  - Trained on multi-decade historical agricultural datasets compiled by the **United Nations Food and Agriculture Organization (FAO)**.
  - Implements a **Scikit-Learn Random Forest Regressor** ensemble capable of modeling non-linear climate interactions, weather anomalies, and chemical input responses.
- **Output & Actionable Insights**:
  - **Predicted Yield**: Projected harvest output expressed in **metric tonnes per hectare (t/ha)** and total calculated field yield.
  - **Benchmarking**: Compares predicted yield against historical national averages, indicating whether current practices are on track for high, standard, or deficit production.

---

### 3. 🌱 AI Crop Recommendation (Random Forest Classifier)
The **Crop Recommendation Engine** helps growers select the most profitable and high-yielding crops suited to their farm's specific soil chemistry and ambient environmental conditions.

- **Multi-Variate Input Features**:
  - **Soil Macro-Nutrients**: Nitrogen (**N**), Phosphorus (**P**), and Potassium (**K**) levels in milligrams per kilogram (`mg/kg` or `ppm`).
  - **Soil Acidity/Alkalinity**: Soil pH measured on a standard logarithmic scale (0–14).
  - **Climate Variables**: Ambient temperature (`°C`), relative humidity (`%`), and average rainfall (`mm`).
- **Machine Learning Architecture**:
  - Powered by a **Scikit-Learn Random Forest Classifier** trained on extensive multi-regional agricultural soil-crop adaptation datasets.
- **Output & Ranked Suitability**:
  - **Top Recommendation**: Identifies the primary optimal crop variety with maximum probability.
  - **Top-3 Ranked Alternatives**: Classifies crops into **Best Match**, **Strong Alternative**, and **Viable Alternative** with percentage compatibility scores.
  - Supports diversification planning and multi-season crop rotation strategies.

---

### 4. 🧪 Soil Chemistry & N-P-K Nutrient Balancer (Rule-Based Soil Science)
The **Soil Nutrient Balancer** bridges the gap between raw laboratory soil test reports and practical field fertilization schedules, preventing both soil depletion and expensive over-fertilization.

- **Crop-Specific Target Profiling**:
  - Compares the farmer's current soil test results against the scientifically recommended baseline requirements for the intended crop (cereals, legumes, cash crops, vegetables).
- **Fertilizer Dosage Calculations**:
  - **Macro-Nutrient Deficit Assessment**: Evaluates exact deficits or surpluses of Nitrogen (N), Phosphorus (P), and Potassium (K).
  - **Commercial Fertilizer Dosages**: Converts raw chemical deficits into precise quantities of widely available commercial fertilizers:
    - **Urea** (46% N) in kg/acre
    - **DAP (Diammonium Phosphate)** / **SSP (Single Superphosphate)** for Phosphorus in kg/acre
    - **MOP (Muriate of Potash)** for Potassium in kg/acre
  - **Organic Recommendations**: Organic manure, vermicompost, and green manuring alternatives for organic farmers.
- **Soil pH Remediation**:
  - **Acidic Soils (pH < 6.0)**: Recommends agricultural lime (calcium carbonate) or dolomite application to raise pH and reduce aluminum toxicity.
  - **Alkaline Soils (pH > 7.5)**: Recommends elemental sulfur or agricultural gypsum to neutralize sodic soils and unlock micronutrient availability.

---

### 5. ☀️ Real-Time Agro-Meteorology Radar & Spraying Advisory
The **Weather Advisory Module** provides micro-climate field radar and localized agronomic weather advisories to safeguard crops against rain wash-off, frost, and high-wind spray drift.

- **Precision Location Detection**:
  - **One-Click Live GPS**: Automatically queries browser geolocation coordinates and resolves nearest agricultural districts via reverse geocoding.
  - **Universal Search**: Real-time autocomplete search for cities, districts, and villages across the globe.
- **Real-Time Telemetry Metrics**:
  - Current temperature, apparent feels-like temperature, relative humidity, wind speed, wind direction, atmospheric pressure, and weather status icons.
- **3-Day Agronomic Forecast**:
  - Day-by-day maximum & minimum temperatures, anticipated precipitation volume in millimeters (`mm`), and rain probability.
- **Smart Spraying Window Indicator**:
  - Automatically assesses real-time wind speed, humidity, and 24-hour precipitation forecasts to categorize pesticide/fertilizer spraying windows:
    - 🟢 **Optimal**: Wind speed < 12 km/h, humidity 50%–70%, zero imminent rain.
    - 🟡 **Marginal**: Cautionary conditions with moderate wind or high humidity.
    - 🔴 **Unfavorable**: Risk of pesticide wash-off due to expected rain, or excessive wind causing spray drift onto neighboring crops.

---

### 6. 📈 Mandi Market Prices & 7-Day Trend Analytics
The **Mandi Market Prices** tool empowers farmers to negotiate better rates, avoid distress selling, and track spot prices across agricultural produce market committees (APMC mandis) throughout India.

- **Tracked Commodities**:
  - Rice (Paddy), Wheat, Maize, Cotton, Sugarcane, Soybean, Mustard Seed, Gram (Chana), Groundnut, Potato, Onion, and Tomato.
- **Live Rates & Baseline Tracking**:
  - Integrates **TGK Agro live mandi open feeds** for commodities with active digital exchanges, backed by official daily APMC reference rates.
- **7-Day Price Trend Graph**:
  - Visual, mobile-optimized bar chart tracking price movements over the last 7 calendar days.
  - Highlights today's price with an emerald glow indicator.
  - Displays **7-Day High**, **7-Day Low**, and **7-Day Average** price summary cards.
- **Govt. Minimum Support Price (MSP) Comparison**:
  - Benchmarks live market rates against official **Govt. of India 2024-25 MSP rates**.
  - Automatically calculates whether the prevailing price is at a profit premium (`+₹ above MSP`) or deficit (`-₹ below MSP`), advising farmers when to leverage government procurement centers.
- **Regional APMC Mandi Breakdown**:
  - Compares spot prices across primary producing states and mandis (e.g., Lasalgaon for Onions, Rajkot for Cotton, Karnal for Rice, Indore for Soybeans).
  - Displays daily arrival volumes in metric tonnes (`T`) and price differences relative to national benchmarks.
- **AI Farmer Advisory**:
  - Plain-language advisory synthesized in **English**, **Hindi**, or **Bengali** analyzing whether current conditions favor selling now or holding stock.
  - Interactive **Ask AI About This Price** tool allows farmers to ask custom questions (e.g., *"Which mandi is offering the best price?"*, *"Will prices increase next week?"*).

---

### 7. 💬 Multilingual AI Agronomist Consultation (Groq LLM)
The **AI Agronomist Chatbot** provides round-the-clock conversational assistance for complex agronomic queries that go beyond structured forms.

- **High-Throughput Inference**:
  - Powered by **Groq AI cloud inference** running open-weights large language models (`openai/gpt-oss-120b` and `openai/gpt-oss-20b`), delivering near-instant responses (< 1.5 seconds).
- **Trilingual Native Support**:
  - Fully capable of comprehending and responding in **English**, **Hindi (हिंदी)**, and **Bengali (বাংলা)**.
- **Rich Agronomic Formatting**:
  - Formats advice with clear headings, organized dosage tables, bulleted action items, and safety precautions for agrochemical handling.
- **Suggested Topic Prompts**:
  - Quick-start chips for pest identification, drip irrigation timing, organic compost preparation, companion planting, and government subsidy schemes.

---

### 8. 🛡️ User Authentication, History & Adaptive Interface
- **Secure Authentication**:
  - Cryptographically secure **PBKDF2 password hashing with salt** and token-based session management (`/api/auth/register`, `/api/auth/login`).
  - Protected client-side routes ensure sensitive farm data and prediction logs remain private.
- **Personalized Farmer Command Center**:
  - Dynamic dashboard displaying live system status, model accuracy metrics, active modules, and personalized quick-launch buttons.
- **Comprehensive History Logs**:
  - Stores past leaf disease diagnoses and prediction logs in the PostgreSQL database with expandable detail modals and timestamp tracking.
- **Mobile-First Glassmorphic Design**:
  - Built with pure modern Vanilla CSS3, backdrop blur filters, smooth micro-animations, and full responsiveness across smartphones, tablets, and desktops.
  - Seamless **Light & Dark mode** switching with zero-flicker theme persistence via `localStorage`.

---

## 🛠️ Technology Stack

| Domain                      | Technology              | Version              | Purpose                                                                                         |
| :-------------------------- | :---------------------- | :------------------- | :---------------------------------------------------------------------------------------------- |
| **Frontend Core**           | React 19                | `v19.2.8`            | Declarative component UI library                                                                |
| **Build System**            | Vite                    | `v8.2.0`             | Ultra-fast development server & bundler                                                         |
| **Icons & UI**              | Lucide React            | `v1.31.0`            | Modern, lightweight icon library                                                                |
| **Internationalization**    | i18next / react-i18next | `v23.14.0 / v15.0.1` | Multilingual support (EN, HI, BN)                                                               |
| **Routing**                 | React Router DOM        | `v6.26.0`            | Client-side SPA routing                                                                         |
| **Backend Core**            | Flask                   | `v3.0.3`             | Python micro-framework for RESTful API                                                          |
| **ML Inference**            | LiteRT (ai-edge-litert) | `>=2.0.0`            | Lightweight TensorFlow Lite inference engine for Custom Deep CNN disease model (~17 MB runtime) |
| **Model Training & Export** | TensorFlow              | `v2.16+`             | Custom Deep CNN architecture on PlantVillage dataset & TFLite export                            |
| **Machine Learning**        | Scikit-Learn            | `v1.6.1`             | Random Forest Crop Yield & Crop Recommender                                                     |
| **Data Processing**         | NumPy & Pandas          | `v1.26.4 / v2.2.2`   | Dataset transformations & array calculations                                                    |
| **AI Assistant**            | Groq AI API             | `>=0.18.0`           | Multilingual agricultural LLM chatbot (`openai/gpt-oss-120b` / `openai/gpt-oss-20b`)            |
| **Database ORM**            | Flask-SQLAlchemy        | `v3.1.1`             | Unified PostgreSQL ORM (Neon / Cloud / Docker)                                                  |
| **DB Driver**               | psycopg2-binary         | `v2.9.9`             | PostgreSQL Python connector                                                                     |
| **Production Server**       | Gunicorn                | `v22.0.0`            | Python WSGI HTTP server                                                                         |
| **Containerization**        | Docker                  | —                    | Python 3.11.9-slim locked runtime for cloud services                                            |
| **Deployment (Backend)**    | Render                  | —                    | Free Docker web service (Flask API)                                                             |
| **Deployment (Database)**   | Neon                    | —                    | Free Serverless PostgreSQL (500 MB)                                                             |
| **Deployment (Frontend)**   | Vercel                  | —                    | Free static React SPA hosting                                                                   |

---

## 🔄 System Architecture

AgriAI is built following an enterprise-grade **3-Tier Architecture**, establishing clear separation between user presentation, business logic & AI inference, and database persistence.

```mermaid
graph TB
    subgraph Tier1["Tier 1: Presentation Tier (Client Layer - Vercel)"]
        direction TB
        UI["React 19 SPA (Vite Engine)"]
        Cam["WebCam Scanner & Image Capture"]
        I18N["i18next Engine (EN / HI / BN)"]
        APIClient["REST API Client (client.js)"]

        UI --- Cam
        UI --- I18N
        UI --> APIClient
    end

    subgraph Tier2["Tier 2: Application Tier (Business & AI Logic Layer - Render Docker)"]
        direction TB
        Flask["Flask REST API Gateway (Gunicorn WSGI)"]
        Auth["PBKDF2 Auth & Security Guard"]

        subgraph ML_AI["AI / ML Inference & Analytical Engines"]
            LiteRT["LiteRT Inference Engine (Custom Deep CNN)"]
            CropRF["Crop Recommender (Random Forest Classifier)"]
            YieldRF["Yield Predictor (Random Forest Regressor)"]
            SoilEng["Soil Chemistry N-P-K Balancer"]
            LLM["Groq AI Multilingual LLM Client (GPT-OSS)"]
        end

        subgraph ExternalAPIs["External Data Integrations"]
            Weather["Live Meteorology Weather API"]
            Market["Mandi Commodity Price Tracker"]
        end

        Flask --> Auth
        Flask --> ML_AI
        Flask --> ExternalAPIs
    end

    subgraph Tier3["Tier 3: Data Tier (Persistence & Model Storage - Neon)"]
        direction TB
        DB[("PostgreSQL Database (Neon Cloud)")]
        Models[("Serialized Model Artifacts (.tflite & .joblib)")]
    end

    %% Tier Data Flow
    APIClient ==>|HTTPS / REST Requests| Flask
    Auth -->|ORM User Operations| DB
    ML_AI -->|Audit & Prediction Logs| DB
    ML_AI -->|Load Weights & Class Labels| Models
```

### 🏢 3-Tier Layer Breakdown

|    Tier    | Layer                                               | Deployment Environment                | Key Technologies                                           | Core Responsibilities                                                                                                                                                                                                                                                                                                            |
| :--------: | :-------------------------------------------------- | :------------------------------------ | :--------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tier 1** | **Presentation Tier** _(Client Layer)_              | Vercel Static Cloud                   | React 19, Vite, Vanilla CSS3 Glassmorphism, i18next        | • Renders responsive single-page user interfaces.<br>• Handles live camera access and crop leaf image pre-processing.<br>• Manages client-side routing, state, and multi-language switching (EN/HI/BN).<br>• Formats and dispatches HTTPS REST requests to backend API.                                                          |
| **Tier 2** | **Application Tier** _(Business & AI Logic Layer)_  | Render Web Service (Docker Container) | Flask 3, Gunicorn, LiteRT, Scikit-Learn, Groq              | • Hosts REST API endpoints, routing, CORS, and request verification.<br>• Manages PBKDF2 password hashing and secure token sessions.<br>• Executes fast, local ML model inference (TFLite CNN leaf scanning, Random Forest crop/yield ML).<br>• Connects to Groq LLM for AI consultation, fetches live weather & mandi market price feeds, and generates plain-language farmer advisories. |
| **Tier 3** | **Data Tier** _(Persistence & Model Storage Layer)_ | Neon Serverless PostgreSQL Cloud      | PostgreSQL RDBMS, Flask-SQLAlchemy ORM, Local Disk Storage | • Stores relational database tables (`users`, `disease_history`, `prediction_history`).<br>• Maintains database connection pooling (Session mode) for reliable transactions.<br>• Stores version-locked pre-trained ML weights (`.tflite`, `.joblib`) and label mappings.                                                        |

---

## 📂 Project Structure

```text
Agri-ai/
├── backend/
│   ├── Dockerfile            # Docker image — locks Python 3.11.9-slim runtime
│   ├── app.py                # Flask Application Factory, Routes & Error Handlers
│   ├── models_db.py          # SQLAlchemy Models (User, PredictionHistory)
│   ├── requirements.txt      # Python Dependencies (LiteRT, Flask, Gunicorn, psycopg2)
│   ├── models/
│   │   ├── disease_model.tflite  # Custom Deep CNN disease detection model (TFLite format)
│   │   ├── crop_model.joblib     # Scikit-Learn Random Forest crop recommender
│   │   ├── yield_model.joblib    # Scikit-Learn Random Forest yield predictor
│   │   └── class_indices.json   # Disease class label mapping (15 plant/disease classes: Pepper, Potato, Tomato)
│   ├── routes/
│   │   ├── auth.py           # User Authentication Routes & Profile Context
│   │   ├── disease.py        # TFLite Image Scanner & Leaf Disease API
│   │   ├── crop_recommend.py # Soil & Climate Crop Recommender API
│   │   ├── yield_predict.py  # FAO Harvest Yield Predictor API
│   │   ├── soil.py           # Soil N-P-K & Acidic/Alkaline Fertilizer Balancer API
│   │   ├── weather.py        # Live Meteorology & 3-Day Farming Advisory API
│   │   ├── market.py         # Mandi Commodity Market Price Trends API
│   │   └── chatbot.py        # Multilingual Farmer Assistant (GPT-OSS LLM) API
│   └── ml_training/          # ML Model Training Notebooks
│       ├── disease_detection.ipynb  # Clean 6-step Custom CNN trainer & TFLite exporter (15 classes, 10 epochs)
│       ├── crop_recommendation.ipynb # Scikit-Learn Crop Recommender trainer
│       └── yield_prediction.ipynb   # Scikit-Learn FAO Yield Predictor trainer
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
echo "GROQ_API_KEY=your_groq_api_key" > .env
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

| Service      | Platform                     | Notes                                                         |
| ------------ | ---------------------------- | ------------------------------------------------------------- |
| **Frontend** | [Vercel](https://vercel.com) | Auto-deploys static SPA from `main` branch                    |
| **Backend**  | [Render](https://render.com) | Docker web service (spins down after inactivity on free tier) |
| **Database** | [Neon](https://neon.tech)    | Free Serverless PostgreSQL (500 MB limit)                     |

### Backend — Render (Docker)

1. Create a **Web Service** on Render.
2. Connect your GitHub repo → set **Root Directory**: `backend`, **Runtime**: `Docker`.
3. Add environment variables:
   - `DATABASE_URL` → Neon connection pooler URI.
   - `GROQ_API_KEY` → Your Groq API key (from console.groq.com).

### Database — Neon

1. Create a free project at [neon.tech](https://neon.tech).
2. Enable connection pooling in the project dashboard.
3. Copy the pooled URI and set it as `DATABASE_URL` in `backend/.env` (and Render for deployment).

### Frontend — Vercel

1. Import your GitHub repo to [vercel.com](https://vercel.com).
2. Set **Root Directory**: `frontend`, **Framework**: `Vite`.
3. Add environment variable:
   - `VITE_API_URL` → Your Render backend URL (e.g. `https://agriai-backend-xxxx.onrender.com`).

---

## 🔑 Environment Variables

| Variable       | Location                       | Description                                      |
| -------------- | ------------------------------ | ------------------------------------------------ |
| `GROQ_API_KEY` | `backend/.env` + Render        | Groq API key for AI chatbot                      |
| `DATABASE_URL` | `backend/.env` + Render        | Neon PostgreSQL connection pooler URI            |
| `VITE_API_URL` | `frontend/.env.local` + Vercel | Full URL of the backend API (no trailing `/api`) |

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
| `GET`  | `/api/market/commodities`  | List supported agricultural commodities with MSP data            |
| `GET`  | `/api/market/trend`        | Live mandi spot prices, 7-day trend, MSP comparison & Groq LLM farmer advisory |
| `POST` | `/api/market/ask`          | Ask a contextual market question via Groq LLM (crop, question, lang) |
| `POST` | `/api/chatbot/message`     | Multilingual AI farming assistant (Groq LLM)             |
| `GET`  | `/api/predictions/history` | Query user prediction logs filtered by tool type         |
