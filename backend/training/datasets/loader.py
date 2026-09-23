"""
Dataset loader and manifest interface for open remote sensing datasets.
Supports BigEarthNet (Sentinel-2 multispectral), EuroSAT, and OSCD (Open Sentinel Change Detection).

Note: The Easy-EO sample dataset is intended solely for pipeline validation,
development, and demonstration. Real supervised training requires labeled benchmark datasets.
"""

import os
from typing import List, Dict, Any, Optional

class RemoteSensingDatasetManifest:
    """Manages paths, band mappings, and class annotations for EO benchmark datasets."""

    DATASET_CONFIGS = {
        "BigEarthNet-S2": {
            "bands": ["B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B8A", "B09", "B11", "B12"],
            "resolution_m": [10, 20, 60],
            "num_classes": 19,
            "description": "Large-scale Sentinel-2 multi-label benchmark with 590,326 image patches.",
            "source_url": "https://bigearth.net/"
        },
        "EuroSAT": {
            "bands": ["B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B8A", "B09", "B10", "B11", "B12"],
            "resolution_m": 10,
            "num_classes": 10,
            "description": "Land use and land cover classification with 27,000 georeferenced Sentinel-2 patches.",
            "source_url": "https://github.com/phelber/eurosat"
        },
        "OSCD": {
            "bands": ["B02", "B03", "B04", "B08", "B11", "B12"],
            "resolution_m": 10,
            "num_classes": 2,
            "description": "Onera Satellite Change Detection dataset tracking bi-temporal urban & environmental change.",
            "source_url": "https://ieee-dataport.org/open-access/oscd-onera-satellite-change-detection"
        }
    }

    def __init__(self, dataset_name: str = "BigEarthNet-S2", root_dir: Optional[str] = None):
        if dataset_name not in self.DATASET_CONFIGS:
            raise ValueError(f"Unknown dataset '{dataset_name}'. Available: {list(self.DATASET_CONFIGS.keys())}")
        self.dataset_name = dataset_name
        self.config = self.DATASET_CONFIGS[dataset_name]
        self.root_dir = root_dir or os.path.join(os.path.dirname(__file__), "raw", dataset_name)

    def get_info(self) -> Dict[str, Any]:
        return {
            "name": self.dataset_name,
            "root_dir": self.root_dir,
            **self.config
        }
