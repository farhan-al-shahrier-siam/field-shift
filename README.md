# 🌾 FIELD SHIFT
> **“Your farm is changing. Your strategy can too.”**
>
> *Agricultural Decision-Support Platform powered by NASA Earth Science Data*  
> **Built for NASA Space Apps Challenge 2026**

---

## 🚀 Overview

Climate variability is putting unprecedented pressure on global agriculture. Farmers worldwide face shifting growing seasons, irregular rainfall patterns, and rising temperature extremes. Yet, vast streams of satellite and Earth observation data remain complex and inaccessible to agricultural decision-makers.

**Field Shift** transforms complex NASA climate data into simple, actionable agricultural insights. It empowers growers, agronomists, and planners to:
1. **Understand localized environmental shifts** through real NASA POWER satellite data.
2. **Discover climate-resilient crops** tailored to their temperature, rainfall, and soil conditions.
3. **Build sustainable crop rotations** that restore soil health and reduce water vulnerability.
4. **Develop prioritized farm adaptation plans** to proactively manage climate risks.

Field Shift is **not merely a data visualization dashboard** — it is an end-to-end decision-support companion that translates raw NASA climate metrics into direct agricultural recommendations.

---

## 🛰️ NASA Data Integration

Field Shift directly integrates with the **NASA POWER** (*Prediction Of Worldwide Energy Resources*) API, utilizing solar and meteorological datasets derived from NASA satellite observations and assimilation models (including CERES and MERRA-2):

| NASA POWER Parameter | Full Name | Agricultural Use in Field Shift |
|---|---|---|
| `T2M` | Temperature at 2 Meters (°C) | Optimal growing degree & temperature suitability scoring |
| `T2M_MAX` / `T2M_MIN` | Daily Maximum / Minimum Temperature (°C) | Heat stress evaluation & frost threshold detection |
| `PRECTOTCORR` | Precipitation Corrected (mm/day) | Annual & seasonal water availability vs. crop water requirement |
| `RH2M` | Relative Humidity at 2 Meters (%) | Fungal/pest pressure risk factor & transpiration estimation |
| `ALLSKY_SFC_SW_DWN` | All Sky Surface Shortwave Downward Irradiance (MJ/m²/day) | Photosynthetic potential & solar energy analysis |
| `WS2M` | Wind Speed at 2 Meters (m/s) | Evapotranspiration impact & mechanical stress assessment |

### Smart Data Processing & Reliability
- **Multi-Year Averaging**: Calculates 5-year climatological monthly normals for long-term strategic planning.
- **Robust Fallback & Offline Mode**: When network or NASA API limits are encountered, gracefully defaults to calibrated regional demo datasets with transparent visual status indicators.
- **Dual Caching Layer**: Utilizes MongoDB caching with automatic in-memory fallback, ensuring zero latency and high availability.

---

## ✨ Core Features & Pages

### 1. 📊 Farm Climate Dashboard (`/dashboard`)
- **Key Climate Indicators**: Annual average temperature, rainfall distribution, solar radiation, and wind conditions.
- **Plain-Language Climate Insights**: Translates numeric thresholds into actionable farming takeaways (e.g., heat stress warnings, drought indicators).
- **Farm Resilience Score (0–100)**: Evaluates water security, crop diversification, and climate adaptation readiness.

### 2. 🌾 Crop Recommendation Engine (`/crop-recommendation`)
- **Multi-Factor Suitability Algorithm**: Scores crops based on temperature match (25%), rainfall match (25%), water access (20%), season alignment (15%), and soil compatibility (10%).
- **Crop Catalog**: Over 20 curated crops with agronomic profiles (growing cycles, water demand, drought & heat tolerance, root depth, pest resistance).
- **Suitability Breakdown**: Transparent factor-by-factor score display with qualitative grading (Excellent, Good, Moderate, Low).

### 3. 🔄 Crop Rotation Planner (`/rotation-planner`)
- **Multi-Season Rotations**: Compares current crop sequences with climate-optimized 3-season alternatives.
- **Agronomic Benefits**: Integrates legumes (nitrogen fixers), alternate root depths, and break crops to suppress pest and disease cycles while conserving water.

### 4. 🗺️ Farm Adaptation Planner (`/adaptation-planner`)
- **Targeted Climate Challenges**: Addresses drought, intense heat waves, delayed monsoons, soil erosion, and pest shifts.
- **Tiered Action Roadmap**: Organizes strategies into *Immediate*, *Pre-Season*, and *Long-Term* horizons across *Crop Selection*, *Soil Management*, *Water Infrastructure*, and *Field Operations*.

### 5. ⚖️ Crop Comparison Matrix (`/compare`)
- **Side-by-Side Evaluation**: Compare 2 to 4 crops across climate resilience attributes, water demand, temperature limits, and economic yields.

### 6. 🌐 Interactive Climate Explorer (`/climate`)
- **Seasonal Profiles**: Tabbed data views for temperature ranges, monthly rainfall patterns, solar radiation curves, and wind speed trends.

---

## 🛠️ Architecture & Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack, React Server & Client Components)
- **Styling**: Modern Design System with custom dark palette, glassmorphic UI cards, accessible micro-interactions, and responsive layouts.
- **Database**: [MongoDB](https://www.mongodb.com/) with Mongoose ODM (with seamless in-memory fallback for zero-dependency local runs).
- **APIs**:
  - NASA POWER API (NASA Langley Research Center)
  - Next.js Edge & Route Handlers (`/api/climate`, `/api/recommendations`, `/api/rotation`, `/api/adaptation`, `/api/farm`, `/api/crops`)
- **Context API**: React FarmContext for reactive client-side state across pages.

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v18.17.0 or higher recommended)
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/field-shift.git
   cd field-shift
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
   *(MongoDB URI is optional; Field Shift automatically operates with built-in in-memory storage if omitted).*

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. **Open in Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 🧪 Production Verification

To verify that all routes and pages build and compile cleanly:

```bash
npm run build
```

---

## 📜 Scientific Disclaimer

> **Decision-Support Notice**: *Field Shift Suitability Scores and climate recommendations are informational decision-support tools derived from satellite and meteorological models. Local soil tests, microclimate variations, local agricultural extension guidelines, and grower expertise should always be consulted before making financial or planting commitments.*

---

## 🏆 NASA Space Apps Challenge 2026
Built with ❤️ for the global agricultural and Earth science community.
