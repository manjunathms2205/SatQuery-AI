# SatQuery AI — Remote Sensing Geospatial Intelligence Orchestrator (SIH 2026)

SatQuery AI is an aerospace-grade geospatial AI orchestrator built for the **Smart India Hackathon (SIH 2026)**. It enables natural-language visual question answering, text-guided grounding, bi-temporal change analysis, and optical + SAR cross-modal fusion over multispectral Earth Observation satellite imagery.

The application combines a modern **React 19 + TypeScript** frontend with a high-performance **Python FastAPI** backend powered by **[Easy-EO (`eeo`)](https://github.com/Tommy-Burns/easy-eo)**, `rasterio`, `numpy`, `scipy`, `opencv-python`, and `shapely`.

---

## 🛰️ Key Capabilities

1. **Single-Image Multispectral VQA (`RS-VQA`)**: Ingests Sentinel-2 GeoTIFFs, extracts CRS, footprint, resolution, and band configuration (B02 Blue, B03 Green, B04 Red, B08 NIR), and calculates authentic NDVI and NDWI rasters.
2. **Text-Guided Grounding (`SceneGrounder`)**: Isolates geographic features (water bodies, vegetation canopy, built-up surfaces) from natural-language queries using spectral index masks and connected-component spatial clustering.
3. **Bi-Temporal Change Analysis (`ChangeSense`)**: Resamples and aligns two temporal observations, computes differential spectral indices ($\Delta\text{NDVI}$, $\Delta\text{NDWI}$, spectral distance), quantifies altered surface area in $\text{km}^2$, and generates vector GeoJSON polygons for QGIS/ArcGIS.
4. **Optical + SAR Cross-Modal Fusion (`OptiSAR-Fuse`)**: Spatially co-registers Sentinel-1 C-band synthetic aperture radar with optical VNIR observations, converts raw radar amplitude to decibels ($\sigma^0\text{ dB}$), and synthesizes surface structure beneath cloud occlusion.
5. **Agentic Orchestration & Transparent Execution**: Classifies user queries through a multi-step execution trace (`Input Preflight → Intent Classification → Specialist Routing → Tool Execution → Evidence Synthesis → Calibrated Assessment`).

---

## 🏛️ System Architecture

```
React Frontend (Vite + TypeScript + Tailwind)
        │
        │ HTTP / REST (JSON + Base64 PNGs + GeoJSON)
        ▼
FastAPI Python Backend (Uvicorn @ 127.0.0.1:8000)
        │
        ├─► Easy-EO Engine (`backend/core/raster_engine.py`)
        │     • GeoTIFF ingestion & band mapping
        │     • True NDVI & NDWI computation
        │     • Footprint & spatial resolution derivation
        │
        ├─► Bi-Temporal Change Engine (`backend/core/change_engine.py`)
        │     • Bilinear spatial grid resampling
        │     • Delta spectral indices & morphological filtering
        │     • Connected components & polygonized GeoJSON vectors
        │
        ├─► Cross-Modal OptiSAR Engine (`backend/core/optisar_engine.py`)
        │     • Optical & microwave SAR grid alignment
        │     • Decibel backscatter calibration & 50/50 fusion
        │
        ├─► Grounding Engine (`backend/core/grounding_engine.py`)
        │     • Spectral thresholding & bounding box extraction
        │
        └─► Training Scaffolding (`backend/training/`)
              • BigEarthNet & EuroSAT dataset loaders
              • Normalization & augmentation pipelines
              • PyTorch training loop & RS evaluation metrics
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** v18+ & **npm**
- **Python** 3.10+ with `virtualenv` or direct installation

### 1. Python Backend Setup
```bash
# Install backend dependencies
pip install fastapi uvicorn pydantic rasterio numpy scipy opencv-python shapely matplotlib easy-eo

# Start the FastAPI backend
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000
```
Backend will be online at `http://127.0.0.1:8000` (`GET /api/health`).

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or build for production & preview
npm run build
npm run preview -- --port 5173 --host 127.0.0.1
```
Access the application at `http://127.0.0.1:5173`.

---

## 🧪 Verification & Test Suites

Run both automated verification suites to validate all components:

### 1. Frontend & Agentic Routing Suite (SIH 2026 Requirements)
```bash
npx tsx src/test-verify.ts
```
*Validates Single-Image VQA, Grounding, Bi-temporal change, Optical+SAR fusion, execution trace, and transparency reporting.*

### 2. Python Backend Unit Test Suite
```bash
python backend/tests/test_backend.py
```
*Validates GeoTIFF loading, CRS extraction, true NDVI/NDWI calculation, bi-temporal alignment, GeoJSON vector generation, and cross-modal fusion.*

### 3. Real Raster 10-Step Trace Suite
```bash
npx tsx src/test-real-raster.ts
```
*Validates end-to-end integration of real raster evidence through the 10-step agent pipeline.*

---

## 📋 Scientific Integrity & Honesty

- **Authentic Metrics**: All quantitative metrics (altered area in $\text{km}^2$, percentage change, vegetation coverage, resolution) originate directly from raster array operations.
- **Strict Transparency**: When sensor bands are unavailable (e.g. SWIR band required for NDBI), metrics explicitly report `"Not calculated (SWIR band unavailable)"` with zero fabrication.
- **Evidence Separation**: The interface clearly distinguishes `"Raster-derived evidence"` from `"AI model interpretation"`.
- **Demo Mode Isolation**: Curated presentation demonstration scenarios are preserved for rapid judge evaluation, alongside live raster processing.
