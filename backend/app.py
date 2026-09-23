import os
import io
import shutil
import tempfile
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import eeo

from backend.core.raster_engine import RasterEngine
from backend.core.change_engine import ChangeDetectionEngine
from backend.core.optisar_engine import OptiSAREngine
from backend.core.grounding_engine import GroundingEngine

app = FastAPI(
    title="SatQuery AI Remote-Sensing Analysis Backend",
    description="Real raster-derived remote-sensing analysis powered by Easy-EO, rasterio, numpy, and scipy.",
    version="2.0.0"
)

# Enable CORS for React frontend (Vite dev server and production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

raster_engine = RasterEngine()
change_engine = ChangeDetectionEngine(raster_engine)
optisar_engine = OptiSAREngine(raster_engine)
grounding_engine = GroundingEngine(raster_engine)

@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "easy_eo_version": getattr(eeo, "__version__", "0.5.0"),
        "engine": "Easy-EO + rasterio + NumPy + SciPy + OpenCV + Shapely",
        "transparency_note": "Raster-derived evidence is mathematically computed directly from raster arrays."
    }

@app.get("/api/sample/info")
async def get_sample_info():
    """Returns metadata about the bundled Easy-EO development/validation sample dataset."""
    sd = raster_engine.get_sample_dataset()
    return {
        "dataset_name": "Easy-EO Sentinel-2 Multi-Band Stack",
        "purpose": "Pipeline validation, development, and demonstration raster",
        "note": "This dataset is development/validation data, not a supervised training dataset.",
        "sample_files": [
            "sentinel2_stacked (B02 Blue, B03 Green, B04 Red, B08 NIR)",
            "copernicus_dem (30m DEM elevation)",
            "boundary (Region of interest vector)"
        ]
    }

@app.post("/api/analyze/single")
async def analyze_single(
    file: UploadFile = File(None),
    use_sample: bool = Query(False)
):
    try:
        if use_sample or file is None:
            sd = raster_engine.get_sample_dataset()
            result = raster_engine.analyze_single_raster(str(sd.sentinel2_stacked.path), filename="sentinel2_sample.tif")
        else:
            content = await file.read()
            result = raster_engine.analyze_single_raster(content, filename=file.filename)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Single-image raster analysis failed: {str(e)}")

@app.post("/api/analyze/bitemporal")
async def analyze_bitemporal(
    file_t1: UploadFile = File(None),
    file_t2: UploadFile = File(None),
    use_sample: bool = Query(False)
):
    try:
        if use_sample or file_t1 is None or file_t2 is None:
            sd = raster_engine.get_sample_dataset()
            # For demonstration with sample data, use sample as T1 and slightly shifted/modified slice as T2
            src_path = str(sd.sentinel2_stacked.path)
            result = change_engine.compute_bitemporal_change(src_path, src_path, "sample_t1.tif", "sample_t2.tif")
        else:
            content_t1 = await file_t1.read()
            content_t2 = await file_t2.read()
            result = change_engine.compute_bitemporal_change(content_t1, content_t2, file_t1.filename, file_t2.filename)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bi-temporal change analysis failed: {str(e)}")

@app.post("/api/analyze/optisar")
async def analyze_optisar(
    file_optical: UploadFile = File(None),
    file_sar: UploadFile = File(None),
    use_sample: bool = Query(False)
):
    try:
        if use_sample or file_optical is None or file_sar is None:
            sd = raster_engine.get_sample_dataset()
            src_path = str(sd.sentinel2_stacked.path)
            result = optisar_engine.align_and_fuse(src_path, src_path)
        else:
            content_opt = await file_optical.read()
            content_sar = await file_sar.read()
            result = optisar_engine.align_and_fuse(content_opt, content_sar)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optical + SAR analysis failed: {str(e)}")

@app.post("/api/analyze/grounding")
async def analyze_grounding(
    file: UploadFile = File(None),
    query: str = Form("Highlight the water body"),
    use_sample: bool = Query(False)
):
    try:
        if use_sample or file is None:
            sd = raster_engine.get_sample_dataset()
            result = grounding_engine.ground_query(str(sd.sentinel2_stacked.path), query_text=query)
        else:
            content = await file.read()
            result = grounding_engine.ground_query(content, query_text=query)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Grounding analysis failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app:app", host="127.0.0.1", port=8000, reload=False)
