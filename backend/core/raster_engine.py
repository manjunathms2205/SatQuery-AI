import os
import io
import tempfile
import numpy as np
import rasterio
from rasterio.io import MemoryFile
from eeo import load_raster
from eeo.datasets import load_sample_dataset
from .visualization import (
    render_rgb_composite,
    render_false_color_composite,
    render_colormap_index,
    array_to_base64_png,
    normalize_band_percentile
)

class RasterEngine:
    """Core raster loading, band identification, spectral index and statistics engine."""

    def __init__(self):
        self._sample_dataset = None

    def get_sample_dataset(self):
        if self._sample_dataset is None:
            self._sample_dataset = load_sample_dataset(prefetch=False)
        return self._sample_dataset

    def open_raster_from_bytes_or_path(self, source):
        """Opens a rasterio DatasetReader and an EEORasterDataset from either a file path or bytes."""
        # Handle eeo.SamplePath or PathLike
        if hasattr(source, "path"):
            source = str(source.path)
        elif hasattr(source, "__fspath__"):
            source = os.fspath(source)

        if isinstance(source, (str, os.PathLike)):
            src = rasterio.open(source)
            eeo_ds = load_raster(source)
            return src, eeo_ds
        elif isinstance(source, bytes):
            # Write to a named temporary file so both rasterio and eeo can access GDAL drivers
            temp_file = tempfile.NamedTemporaryFile(suffix=".tif", delete=False)
            temp_file.write(source)
            temp_file.flush()
            temp_file.close()
            src = rasterio.open(temp_file.name)
            eeo_ds = load_raster(temp_file.name)
            return src, eeo_ds
        else:
            raise ValueError(f"Unsupported raster source type: {type(source)}")

    def analyze_single_raster(self, source, filename: str = "satellite_scene.tif"):
        """
        Inspects raster metadata, identifies bands, calculates spectral indices,
        extracts authentic statistics, and renders visual evidence layers.
        """
        src, eeo_ds = self.open_raster_from_bytes_or_path(source)
        try:
            count = src.count
            height = src.height
            width = src.width
            crs = str(src.crs) if src.crs else "Not defined (Local/Pixel)"
            bounds = {
                "left": float(src.bounds.left),
                "bottom": float(src.bounds.bottom),
                "right": float(src.bounds.right),
                "top": float(src.bounds.top)
            }
            res_x, res_y = abs(src.res[0]), abs(src.res[1])
            pixel_area_m2 = res_x * res_y
            total_footprint_km2 = (width * height * pixel_area_m2) / 1_000_000.0

            # Read all bands as float32
            raw_data = src.read().astype(np.float32)
            nodata = src.nodata

            # Mask nodata
            if nodata is not None:
                mask = raw_data == nodata
                raw_data[mask] = np.nan

            # Identify available bands
            descriptions = [desc.lower() if desc else "" for desc in src.descriptions]
            bands_available = []
            b_red = None
            b_green = None
            b_blue = None
            b_nir = None
            b_swir = None

            if count >= 4:
                # Standard 4-band Sentinel-2 stack: Blue (1), Green (2), Red (3), NIR (4)
                b_blue = raw_data[0]
                b_green = raw_data[1]
                b_red = raw_data[2]
                b_nir = raw_data[3]
                bands_available = ["B02 (Blue)", "B03 (Green)", "B04 (Red)", "B08 (NIR)"]
                if count >= 5:
                    b_swir = raw_data[4]
                    bands_available.append("B11 (SWIR)")
            elif count == 3:
                # RGB
                b_red = raw_data[0]
                b_green = raw_data[1]
                b_blue = raw_data[2]
                bands_available = ["Band 1 (Red)", "Band 2 (Green)", "Band 3 (Blue)"]
            elif count == 1:
                b_red = raw_data[0]
                bands_available = ["Band 1 (Grayscale/SAR)"]

            # Visualizations
            rgb_url = None
            false_color_url = None
            ndvi_url = None
            ndwi_url = None

            if b_red is not None and b_green is not None and b_blue is not None:
                rgb_url = render_rgb_composite(b_red, b_green, b_blue)
            elif count == 1:
                norm = normalize_band_percentile(raw_data[0])
                rgb_url = array_to_base64_png(norm)

            if b_nir is not None and b_red is not None and b_green is not None:
                false_color_url = render_false_color_composite(b_nir, b_red, b_green)

            # Calculate NDVI if Red + NIR available
            ndvi_stats = None
            ndvi_arr = None
            vegetation_area_km2 = None
            vegetation_pct = None

            if b_nir is not None and b_red is not None:
                denom = b_nir + b_red
                denom[denom == 0] = 1e-5
                ndvi_arr = (b_nir - b_red) / denom
                ndvi_valid = ndvi_arr[np.isfinite(ndvi_arr)]
                if len(ndvi_valid) > 0:
                    ndvi_mean = float(np.mean(ndvi_valid))
                    ndvi_min = float(np.min(ndvi_valid))
                    ndvi_max = float(np.max(ndvi_valid))
                    ndvi_std = float(np.std(ndvi_valid))
                    veg_pixels = int(np.sum(ndvi_arr > 0.35))
                    vegetation_pct = float((veg_pixels / (width * height)) * 100.0)
                    vegetation_area_km2 = float((veg_pixels * pixel_area_m2) / 1_000_000.0)
                    ndvi_stats = {
                        "mean": round(ndvi_mean, 4),
                        "min": round(ndvi_min, 4),
                        "max": round(ndvi_max, 4),
                        "std": round(ndvi_std, 4),
                        "vegetation_area_km2": round(vegetation_area_km2, 3),
                        "vegetation_pct": round(vegetation_pct, 2)
                    }
                    ndvi_url = render_colormap_index(ndvi_arr, cmap_name="YlGn", vmin=-0.1, vmax=0.8)

            # Calculate NDWI if Green + NIR available
            ndwi_stats = None
            ndwi_arr = None
            water_area_km2 = None
            water_pct = None

            if b_green is not None and b_nir is not None:
                denom = b_green + b_nir
                denom[denom == 0] = 1e-5
                ndwi_arr = (b_green - b_nir) / denom
                ndwi_valid = ndwi_arr[np.isfinite(ndwi_arr)]
                if len(ndwi_valid) > 0:
                    ndwi_mean = float(np.mean(ndwi_valid))
                    ndwi_min = float(np.min(ndwi_valid))
                    ndwi_max = float(np.max(ndwi_valid))
                    ndwi_std = float(np.std(ndwi_valid))
                    water_pixels = int(np.sum(ndwi_arr > 0.05))
                    water_pct = float((water_pixels / (width * height)) * 100.0)
                    water_area_km2 = float((water_pixels * pixel_area_m2) / 1_000_000.0)
                    ndwi_stats = {
                        "mean": round(ndwi_mean, 4),
                        "min": round(ndwi_min, 4),
                        "max": round(ndwi_max, 4),
                        "std": round(ndwi_std, 4),
                        "water_area_km2": round(water_area_km2, 3),
                        "water_pct": round(water_pct, 2)
                    }
                    ndwi_url = render_colormap_index(ndwi_arr, cmap_name="Blues", vmin=-0.5, vmax=0.3)

            # Calculate NDBI if SWIR + NIR available
            ndbi_stats = None
            if b_swir is not None and b_nir is not None:
                denom = b_swir + b_nir
                denom[denom == 0] = 1e-5
                ndbi_arr = (b_swir - b_nir) / denom
                ndbi_valid = ndbi_arr[np.isfinite(ndbi_arr)]
                if len(ndbi_valid) > 0:
                    ndbi_stats = {
                        "mean": round(float(np.mean(ndbi_valid)), 4),
                        "min": round(float(np.min(ndbi_valid)), 4),
                        "max": round(float(np.max(ndbi_valid)), 4),
                        "status": "Calculated (SWIR-NIR)"
                    }
            else:
                ndbi_stats = {
                    "status": "Not calculated (SWIR band unavailable)"
                }

            return {
                "filename": filename,
                "metadata": {
                    "crs": crs,
                    "width": width,
                    "height": height,
                    "resolution_m": round(res_x, 2),
                    "bounds": bounds,
                    "bands_count": count,
                    "bands_available": bands_available,
                    "total_footprint_km2": round(total_footprint_km2, 3)
                },
                "indices": {
                    "ndvi": ndvi_stats,
                    "ndwi": ndwi_stats,
                    "ndbi": ndbi_stats
                },
                "visualizations": {
                    "rgb": rgb_url,
                    "false_color": false_color_url,
                    "ndvi": ndvi_url,
                    "ndwi": ndwi_url
                }
            }
        finally:
            src.close()
