import sys
import numpy as np

# ── Patch torch.load BEFORE ultralytics imports it ──────────────
import torch
_original_torch_load = torch.load

def _patched_torch_load(f, *args, **kwargs):
    kwargs["weights_only"] = False
    return _original_torch_load(f, *args, **kwargs)

torch.load = _patched_torch_load
# ────────────────────────────────────────────────────────────────

from ultralytics import YOLO

class BoxDetector:
    def __init__(self, model_path, conf=0.5, iou=0.45, device="cpu"):
        try:
            self.model  = YOLO(model_path)
            self.conf   = conf
            self.iou    = iou
            self.device = device
            self.model.to(device)
            print(f"[INFO] Model loaded successfully: {model_path}", file=sys.stderr)
        except Exception as e:
            print(f"[ERROR] Failed to load YOLO model: {e}", file=sys.stderr)
            raise

    def detect(self, frame):
        """
        Run inference on a single frame.
        Returns list of [x1, y1, x2, y2, confidence]
        """
        results = self.model.predict(
            source=frame,
            conf=self.conf,
            iou=self.iou,
            device=self.device,
            verbose=False,
        )[0]

        detections = []
        if results.boxes is not None:
            for box in results.boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                confidence      = float(box.conf[0])
                detections.append([x1, y1, x2, y2, confidence])

        return detections