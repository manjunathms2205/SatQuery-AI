"""
Evaluation script computing IoU, Precision, Recall, and F1-score for remote sensing models.
"""

import numpy as np
from typing import Dict, Any

def compute_raster_iou(pred_mask: np.ndarray, gt_mask: np.ndarray) -> float:
    """Calculates Intersection over Union between binary predicted and ground truth masks."""
    intersection = np.logical_and(pred_mask > 0, gt_mask > 0).sum()
    union = np.logical_or(pred_mask > 0, gt_mask > 0).sum()
    if union == 0:
        return 1.0 if intersection == 0 else 0.0
    return float(intersection / union)

def evaluate_change_detection_metrics(pred_mask: np.ndarray, gt_mask: np.ndarray) -> Dict[str, float]:
    """Computes precision, recall, F1, and IoU for change detection."""
    tp = np.logical_and(pred_mask > 0, gt_mask > 0).sum()
    fp = np.logical_and(pred_mask > 0, gt_mask == 0).sum()
    fn = np.logical_and(pred_mask == 0, gt_mask > 0).sum()
    tn = np.logical_and(pred_mask == 0, gt_mask == 0).sum()

    precision = float(tp / (tp + fp)) if (tp + fp) > 0 else 0.0
    recall = float(tp / (tp + fn)) if (tp + fn) > 0 else 0.0
    f1 = float(2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0
    iou = compute_raster_iou(pred_mask, gt_mask)

    return {
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1, 4),
        "iou": round(iou, 4),
        "accuracy": round(float((tp + tn) / (tp + tn + fp + fn)), 4)
    }

if __name__ == "__main__":
    # Test with sample matrices
    gt = np.zeros((100, 100), dtype=np.uint8)
    gt[30:70, 30:70] = 1
    pred = np.zeros((100, 100), dtype=np.uint8)
    pred[35:75, 30:70] = 1

    metrics = evaluate_change_detection_metrics(pred, gt)
    print("[*] Sample Evaluation Metrics:")
    for k, v in metrics.items():
        print(f"    {k}: {v}")
