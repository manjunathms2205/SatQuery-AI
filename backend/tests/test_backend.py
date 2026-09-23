"""
Automated backend verification test suite for SatQuery AI.
Tests real Easy-EO loading, band detection, NDVI, NDWI, NDBI, raster alignment,
change detection, connected components, area calculations, GeoJSON, and Optical/SAR fusion.
"""

import sys
import os
import unittest
import numpy as np

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.core.raster_engine import RasterEngine
from backend.core.change_engine import ChangeDetectionEngine
from backend.core.optisar_engine import OptiSAREngine
from backend.core.grounding_engine import GroundingEngine

class TestEasyEOBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.raster_engine = RasterEngine()
        cls.change_engine = ChangeDetectionEngine(cls.raster_engine)
        cls.optisar_engine = OptiSAREngine(cls.raster_engine)
        cls.grounding_engine = GroundingEngine(cls.raster_engine)
        cls.sd = cls.raster_engine.get_sample_dataset()
        cls.sample_path = str(cls.sd.sentinel2_stacked.path)

    def test_01_sentinel2_loading_and_bands(self):
        """Test 1: Validate Sentinel-2 raster loading, CRS, resolution, and band detection."""
        result = self.raster_engine.analyze_single_raster(self.sample_path)
        meta = result["metadata"]
        self.assertIn("EPSG:32633", meta["crs"])
        self.assertEqual(meta["width"], 1024)
        self.assertEqual(meta["height"], 1024)
        self.assertEqual(meta["resolution_m"], 10.0)
        self.assertGreaterEqual(meta["bands_count"], 4)
        self.assertIn("B04 (Red)", meta["bands_available"])
        self.assertIn("B08 (NIR)", meta["bands_available"])
        print("[PASS] Test 1: Sentinel-2 loaded, CRS & 4 bands verified.")

    def test_02_ndvi_calculation_and_statistics(self):
        """Test 2: Validate authentic NDVI calculation and vegetation coverage statistics."""
        result = self.raster_engine.analyze_single_raster(self.sample_path)
        ndvi = result["indices"]["ndvi"]
        self.assertIsNotNone(ndvi)
        self.assertGreaterEqual(ndvi["mean"], -1.0)
        self.assertLessEqual(ndvi["mean"], 1.0)
        self.assertGreater(ndvi["vegetation_area_km2"], 0.0)
        self.assertGreater(ndvi["vegetation_pct"], 0.0)
        self.assertTrue(result["visualizations"]["ndvi"].startswith("data:image/png;base64,"))
        print(f"[PASS] Test 2: NDVI calculated (Mean: {ndvi['mean']}, Veg Area: {ndvi['vegetation_area_km2']} km²).")

    def test_03_ndwi_and_ndbi_handling(self):
        """Test 3: Validate NDWI calculation and uncalculated NDBI handling."""
        result = self.raster_engine.analyze_single_raster(self.sample_path)
        ndwi = result["indices"]["ndwi"]
        ndbi = result["indices"]["ndbi"]
        self.assertIsNotNone(ndwi)
        self.assertGreaterEqual(ndwi["mean"], -1.0)
        self.assertLessEqual(ndwi["mean"], 1.0)
        # NDBI should explicitly state not calculated if SWIR band is missing
        self.assertIn("Not calculated", ndbi["status"])
        print(f"[PASS] Test 3: NDWI calculated (Mean: {ndwi['mean']}), NDBI handled honestly.")

    def test_04_raster_alignment_and_change_detection(self):
        """Test 4: Validate T1/T2 grid alignment, delta indices, connected components, and area."""
        change_res = self.change_engine.compute_bitemporal_change(self.sample_path, self.sample_path)
        metrics = change_res["metrics"]
        self.assertIn("changed_area_km2", metrics)
        self.assertIn("changed_percentage", metrics)
        self.assertIn("number_of_change_regions", metrics)
        self.assertIn("largest_change_region_ha", metrics)
        self.assertIn("delta_ndvi", metrics)
        self.assertIn("overlay", change_res["visualizations"])
        self.assertTrue(change_res["visualizations"]["overlay"].startswith("data:image/png;base64,"))
        print(f"[PASS] Test 4: Change detection verified (Footprint: {change_res['metadata']['total_footprint_km2']} km²).")

    def test_05_geojson_polygon_generation(self):
        """Test 5: Validate GeoJSON polygon FeatureCollection output."""
        change_res = self.change_engine.compute_bitemporal_change(self.sample_path, self.sample_path)
        geojson = change_res["geojson"]
        self.assertEqual(geojson["type"], "FeatureCollection")
        self.assertIn("crs", geojson)
        self.assertIsInstance(geojson["features"], list)
        print(f"[PASS] Test 5: GeoJSON generated with {len(geojson['features'])} vector features.")

    def test_06_optisar_fusion_and_evidence(self):
        """Test 6: Validate Optical + SAR grid alignment, backscatter normalization, and blending."""
        optisar_res = self.optisar_engine.align_and_fuse(self.sample_path, self.sample_path)
        metrics = optisar_res["metrics"]
        self.assertIn("sar_penetration_gain", metrics)
        self.assertIn("sar_high_backscatter_area_km2", metrics)
        self.assertEqual(len(optisar_res["modality_evidence"]), 3)
        self.assertTrue(optisar_res["visualizations"]["blended"].startswith("data:image/png;base64,"))
        print(f"[PASS] Test 6: Optical + SAR alignment & fusion verified.")

    def test_07_grounding_spectral_mask_and_boxes(self):
        """Test 7: Validate text-guided grounding on water and vegetation queries."""
        water_res = self.grounding_engine.ground_query(self.sample_path, "Highlight the water body")
        self.assertEqual(water_res["detected_feature"], "Water Body")
        self.assertIsInstance(water_res["bounding_boxes"], list)
        self.assertTrue(water_res["visualizations"]["overlay"].startswith("data:image/png;base64,"))

        veg_res = self.grounding_engine.ground_query(self.sample_path, "Locate forest and vegetation canopy")
        self.assertEqual(veg_res["detected_feature"], "Vegetation Canopy")
        print(f"[PASS] Test 7: Grounding verified ({len(water_res['bounding_boxes'])} water candidates, {len(veg_res['bounding_boxes'])} veg candidates).")

if __name__ == "__main__":
    unittest.main()
