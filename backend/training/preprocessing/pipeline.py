"""
Remote Sensing Preprocessing Pipeline using Easy-EO (eeo) and NumPy.
Standardizes reflectance, generates spectral indices, and masks clouds for ML model input.
"""

import numpy as np
import eeo
from eeo.preprocessing import normalize_percentile, standardize

class EOPreprocessingPipeline:
    """Preprocesses multispectral Sentinel-2 arrays for training specialist models."""

    def __init__(self, target_bands: list = None):
        self.target_bands = target_bands or ["blue", "green", "red", "nir"]

    def process_multispectral_patch(self, raw_patch: np.ndarray) -> np.ndarray:
        """
        Normalizes a multi-band patch (C, H, W) to [0, 1] range with percentile clipping
        and appends computed NDVI and NDWI channels as extra feature dimensions.
        """
        c, h, w = raw_patch.shape
        normalized = np.zeros_like(raw_patch, dtype=np.float32)

        for i in range(c):
            band = raw_patch[i]
            valid = np.isfinite(band) & (band > 0)
            if np.any(valid):
                vmin, vmax = np.percentile(band[valid], (2.0, 98.0))
                if vmax <= vmin:
                    vmax = vmin + 1e-5
                normalized[i] = np.clip((band - vmin) / (vmax - vmin), 0.0, 1.0)
            else:
                normalized[i] = 0.0

        # Compute NDVI & NDWI features if at least 4 bands present (Blue, Green, Red, NIR)
        if c >= 4:
            red = normalized[2]
            nir = normalized[3]
            green = normalized[1]

            ndvi = (nir - red) / np.maximum(nir + red, 1e-5)
            ndwi = (green - nir) / np.maximum(green + nir, 1e-5)

            # Stack original normalized channels + NDVI + NDWI -> shape (C + 2, H, W)
            augmented = np.concatenate([normalized, ndvi[np.newaxis, ...], ndwi[np.newaxis, ...]], axis=0)
            return augmented.astype(np.float32)

        return normalized.astype(np.float32)
