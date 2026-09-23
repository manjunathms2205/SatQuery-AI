import os
import tempfile
import numpy as np
import rasterio
from rasterio.warp import reproject, Resampling
from rasterio.features import shapes
from shapely.geometry import shape, mapping
from scipy.ndimage import binary_opening
import cv2
from .visualization import (
    render_rgb_composite,
    render_colormap_index,
    render_transparent_change_overlay,
    normalize_band_percentile,
    array_to_base64_png
)

class ChangeDetectionEngine:
    """Real bi-temporal raster change detection engine using rasterio and Easy-EO."""

    def __init__(self, raster_engine):
        self.raster_engine = raster_engine

    def align_rasters(self, src_t1, src_t2):
        """
        Aligns and resamples T2 raster array to precisely match T1's CRS, bounds, and pixel grid.
        Returns (t1_data, t2_aligned_data, transform, crs, res_m).
        """
        t1_data = src_t1.read().astype(np.float32)
        count_t2 = src_t2.count
        t2_aligned = np.zeros((count_t2, src_t1.height, src_t1.width), dtype=np.float32)

        for b in range(count_t2):
            reproject(
                source=rasterio.band(src_t2, b + 1),
                destination=t2_aligned[b],
                src_transform=src_t2.transform,
                src_crs=src_t2.crs,
                dst_transform=src_t1.transform,
                dst_crs=src_t1.crs,
                resampling=Resampling.bilinear
            )

        res_x = abs(src_t1.res[0])
        res_y = abs(src_t1.res[1])
        return t1_data, t2_aligned, src_t1.transform, src_t1.crs, (res_x, res_y)

    def compute_bitemporal_change(self, source_t1, source_t2, filename_t1="t1.tif", filename_t2="t2.tif"):
        """
        Performs genuine bi-temporal remote sensing change detection:
        - Reprojection & spatial co-registration
        - Pixel differencing (spectral magnitude, delta_NDVI, delta_NDWI)
        - Noise removal via morphological opening
        - Connected-component analysis
        - GeoJSON polygonization
        - Quantitative area calculation
        - Transparent change overlay generation
        """
        src_t1, _ = self.raster_engine.open_raster_from_bytes_or_path(source_t1)
        src_t2, _ = self.raster_engine.open_raster_from_bytes_or_path(source_t2)

        try:
            t1_data, t2_data, transform, crs, (res_x, res_y) = self.align_rasters(src_t1, src_t2)
            h, w = t1_data.shape[1], t1_data.shape[2]
            pixel_area_m2 = res_x * res_y
            total_pixels = h * w
            total_area_km2 = (total_pixels * pixel_area_m2) / 1_000_000.0

            # Render T1 and T2 natural RGB
            if t1_data.shape[0] >= 3:
                t1_rgb_url = render_rgb_composite(t1_data[2], t1_data[1], t1_data[0]) if t1_data.shape[0] >= 4 else render_rgb_composite(t1_data[0], t1_data[1], t1_data[2])
            else:
                t1_rgb_url = array_to_base64_png(normalize_band_percentile(t1_data[0]))

            if t2_data.shape[0] >= 3:
                t2_rgb_url = render_rgb_composite(t2_data[2], t2_data[1], t2_data[0]) if t2_data.shape[0] >= 4 else render_rgb_composite(t2_data[0], t2_data[1], t2_data[2])
            else:
                t2_rgb_url = array_to_base64_png(normalize_band_percentile(t2_data[0]))

            # Normalized difference spectral distance across all overlapping bands
            min_bands = min(t1_data.shape[0], t2_data.shape[0])
            diff_sq = np.zeros((h, w), dtype=np.float32)
            for b in range(min_bands):
                b_diff = t2_data[b] - t1_data[b]
                diff_sq += b_diff ** 2
            spectral_distance = np.sqrt(diff_sq)

            # Spectral Indices for T1 & T2
            has_nir_red = t1_data.shape[0] >= 4 and t2_data.shape[0] >= 4
            delta_ndvi = None
            delta_ndwi = None
            delta_ndvi_stats = None
            delta_ndwi_stats = None

            change_types = np.zeros((h, w), dtype=np.uint8)

            if has_nir_red:
                # Bands: 0=Blue, 1=Green, 2=Red, 3=NIR
                ndvi_t1 = (t1_data[3] - t1_data[2]) / np.maximum(t1_data[3] + t1_data[2], 1e-5)
                ndvi_t2 = (t2_data[3] - t2_data[2]) / np.maximum(t2_data[3] + t2_data[2], 1e-5)
                delta_ndvi = ndvi_t2 - ndvi_t1

                ndwi_t1 = (t1_data[1] - t1_data[3]) / np.maximum(t1_data[1] + t1_data[3], 1e-5)
                ndwi_t2 = (t2_data[1] - t2_data[3]) / np.maximum(t2_data[1] + t2_data[3], 1e-5)
                delta_ndwi = ndwi_t2 - ndwi_t1

                delta_ndvi_stats = {
                    "mean": round(float(np.nanmean(delta_ndvi)), 4),
                    "min": round(float(np.nanmin(delta_ndvi)), 4),
                    "max": round(float(np.nanmax(delta_ndvi)), 4)
                }
                delta_ndwi_stats = {
                    "mean": round(float(np.nanmean(delta_ndwi)), 4),
                    "min": round(float(np.nanmin(delta_ndwi)), 4),
                    "max": round(float(np.nanmax(delta_ndwi)), 4)
                }

                # Categorize changes:
                # 2 = Vegetation growth (delta_ndvi > +0.15)
                # 3 = Vegetation loss / clearing (delta_ndvi < -0.15)
                # 4 = Water expansion / inundation (delta_ndwi > +0.12)
                # 5 = Built-up / bare surface delta
                change_types[delta_ndvi > 0.15] = 2
                change_types[delta_ndvi < -0.15] = 3
                change_types[delta_ndwi > 0.12] = 4

            # Significant change mask thresholding
            p90 = np.percentile(spectral_distance, 88.0)
            raw_change_mask = (spectral_distance > p90)
            if delta_ndvi is not None:
                raw_change_mask = raw_change_mask | (np.abs(delta_ndvi) > 0.14) | (delta_ndwi > 0.10)

            # Step 10: Morphological opening to eliminate isolated pixel noise
            clean_mask = binary_opening(raw_change_mask, structure=np.ones((3, 3))).astype(np.uint8)

            # Step 11: Connected-component analysis
            num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(clean_mask, connectivity=8)

            # Filter small speckles (minimum 5 pixels)
            min_component_pixels = 5
            filtered_mask = np.zeros_like(clean_mask)
            valid_regions_count = 0
            largest_region_pixels = 0

            for i in range(1, num_labels):
                area_p = stats[i, cv2.CC_STAT_AREA]
                if area_p >= min_component_pixels:
                    filtered_mask[labels == i] = 1
                    valid_regions_count += 1
                    if area_p > largest_region_pixels:
                        largest_region_pixels = area_p

            changed_pixels = int(np.sum(filtered_mask))
            changed_area_km2 = (changed_pixels * pixel_area_m2) / 1_000_000.0
            changed_percentage = (changed_pixels / total_pixels) * 100.0
            largest_region_ha = (largest_region_pixels * pixel_area_m2) / 10_000.0

            # Step 12: Calculate change polygons as GeoJSON
            geojson_features = []
            if changed_pixels > 0:
                shape_generator = shapes(filtered_mask, mask=filtered_mask > 0, transform=transform)
                for geom, val in shape_generator:
                    poly = shape(geom)
                    if poly.area >= (min_component_pixels * pixel_area_m2):
                        geojson_features.append({
                            "type": "Feature",
                            "properties": {
                                "area_m2": round(poly.area, 2),
                                "area_ha": round(poly.area / 10_000.0, 3)
                            },
                            "geometry": mapping(poly)
                        })

            geojson_data = {
                "type": "FeatureCollection",
                "crs": {"type": "name", "properties": {"name": str(crs)}},
                "features": geojson_features[:100]  # Cap at top 100 polygons for responsive JSON payload
            }

            # Step 14: Visual Overlays
            change_overlay_url = render_transparent_change_overlay(filtered_mask, change_types, alpha=190)
            change_map_url = render_colormap_index(spectral_distance, cmap_name="magma", vmin=0, vmax=float(np.percentile(spectral_distance, 98)))

            return {
                "metadata": {
                    "crs": str(crs),
                    "dimensions": f"{w} × {h} px",
                    "resolution_m": round(res_x, 2),
                    "total_footprint_km2": round(total_area_km2, 3)
                },
                "metrics": {
                    "changed_area_km2": round(changed_area_km2, 3),
                    "changed_percentage": round(changed_percentage, 2),
                    "number_of_change_regions": valid_regions_count,
                    "largest_change_region_ha": round(largest_region_ha, 2),
                    "mean_change_magnitude": round(float(np.mean(spectral_distance[filtered_mask > 0])) if changed_pixels > 0 else 0.0, 3),
                    "delta_ndvi": delta_ndvi_stats if delta_ndvi_stats else "Not calculated (NIR/Red unavailable)",
                    "delta_ndwi": delta_ndwi_stats if delta_ndwi_stats else "Not calculated (NIR/Green unavailable)",
                    "delta_ndbi": "Not calculated (SWIR band unavailable)"
                },
                "visualizations": {
                    "t1_rgb": t1_rgb_url,
                    "t2_rgb": t2_rgb_url,
                    "change_map": change_map_url,
                    "overlay": change_overlay_url
                },
                "geojson": geojson_data
            }
        finally:
            src_t1.close()
            src_t2.close()
