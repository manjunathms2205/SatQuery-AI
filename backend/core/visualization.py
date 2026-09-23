import io
import base64
import numpy as np
from PIL import Image
import matplotlib.cm as cm

def array_to_base64_png(arr: np.ndarray) -> str:
    """Converts a uint8 numpy image array (H, W), (H, W, 3) or (H, W, 4) to base64 data URL."""
    if arr.dtype != np.uint8:
        arr = np.clip(arr, 0, 255).astype(np.uint8)
    
    img = Image.fromarray(arr)
    buffer = io.BytesIO()
    img.save(buffer, format="PNG", optimize=True)
    b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64}"

def normalize_band_percentile(band: np.ndarray, p_min: float = 2.0, p_max: float = 98.0) -> np.ndarray:
    """Normalizes a single band using percentile stretching, handling NaNs and nodata."""
    valid = np.isfinite(band) & (band > 0)
    if not np.any(valid):
        return np.zeros_like(band, dtype=np.uint8)
    
    vmin, vmax = np.percentile(band[valid], (p_min, p_max))
    if vmax <= vmin:
        vmax = vmin + 1e-5
    
    scaled = np.clip((band - vmin) / (vmax - vmin), 0.0, 1.0)
    return (scaled * 255.0).astype(np.uint8)

def render_rgb_composite(r: np.ndarray, g: np.ndarray, b: np.ndarray) -> str:
    """Renders natural RGB composite from 3 bands as base64 PNG."""
    r_norm = normalize_band_percentile(r)
    g_norm = normalize_band_percentile(g)
    b_norm = normalize_band_percentile(b)
    rgb = np.stack([r_norm, g_norm, b_norm], axis=-1)
    return array_to_base64_png(rgb)

def render_false_color_composite(nir: np.ndarray, red: np.ndarray, green: np.ndarray) -> str:
    """Renders NIR-Red-Green False Colour composite for vegetation visualization."""
    nir_norm = normalize_band_percentile(nir)
    r_norm = normalize_band_percentile(red)
    g_norm = normalize_band_percentile(green)
    fc = np.stack([nir_norm, r_norm, g_norm], axis=-1)
    return array_to_base64_png(fc)

def render_colormap_index(index_arr: np.ndarray, cmap_name: str = "viridis", vmin: float = -0.2, vmax: float = 0.8) -> str:
    """Renders a single-band index (like NDVI or NDWI) using a matplotlib colormap."""
    valid_mask = np.isfinite(index_arr)
    denom = vmax - vmin if vmax > vmin else 1e-5
    scaled = np.zeros_like(index_arr, dtype=np.float32)
    scaled[valid_mask] = np.clip((index_arr[valid_mask] - vmin) / denom, 0.0, 1.0)
    import matplotlib.pyplot as plt
    try:
        import matplotlib
        cmap = matplotlib.colormaps[cmap_name]
    except Exception:
        cmap = cm.get_cmap(cmap_name)
    rgba = cmap(scaled)
    # Apply transparency to invalid/nodata pixels
    rgba[~valid_mask, 3] = 0.0
    uint8_rgba = (rgba * 255.0).astype(np.uint8)
    return array_to_base64_png(uint8_rgba)

def render_transparent_change_overlay(
    change_mask: np.ndarray,
    change_types: np.ndarray = None,
    alpha: int = 180
) -> str:
    """
    Renders an RGBA transparent change overlay:
    - 0: Unchanged (alpha=0, fully transparent)
    - 1: Generic changed area (terracotta / red)
    - 2: Vegetation increase (forest green)
    - 3: Vegetation loss / deforestation (orange / red)
    - 4: Water inundation / flood (azure blue)
    - 5: Built-up change (purple / yellow)
    """
    h, w = change_mask.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    
    if change_types is None:
        change_types = np.where(change_mask > 0, 1, 0)
    
    # Generic change: Terracotta (#C66B4A -> 198, 107, 74)
    c1 = (change_types == 1) & (change_mask > 0)
    rgba[c1] = [198, 107, 74, alpha]
    
    # Vegetation gain: Forest Green (#173F35 -> 23, 63, 53)
    c2 = (change_types == 2) & (change_mask > 0)
    rgba[c2] = [46, 125, 50, alpha]
    
    # Vegetation loss: Bright Ochre / Orange (#D84315 -> 216, 67, 21)
    c3 = (change_types == 3) & (change_mask > 0)
    rgba[c3] = [216, 67, 21, alpha]
    
    # Water inundation / flood: Deep Cyan-Blue (#0288D1 -> 2, 136, 209)
    c4 = (change_types == 4) & (change_mask > 0)
    rgba[c4] = [2, 136, 209, alpha]
    
    # Built-up / infrastructure: Amber (#F57C00 -> 245, 124, 0)
    c5 = (change_types == 5) & (change_mask > 0)
    rgba[c5] = [245, 124, 0, alpha]
    
    return array_to_base64_png(rgba)

def render_binary_grounding_overlay(mask: np.ndarray, color: tuple = (198, 107, 74), alpha: int = 160) -> str:
    """Renders a transparent mask overlay for text-guided grounding (e.g. water or solar arrays)."""
    h, w = mask.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    active = mask > 0
    rgba[active, 0] = color[0]
    rgba[active, 1] = color[1]
    rgba[active, 2] = color[2]
    rgba[active, 3] = alpha
    return array_to_base64_png(rgba)
