import sys
import os
import numpy as np
import torch
import pathlib

# Patch torch.load
_original_torch_load = torch.load
def _patched_torch_load(f, *args, **kwargs):
    kwargs["weights_only"] = False
    return _original_torch_load(f, *args, **kwargs)
torch.load = _patched_torch_load

# Fix PosixPath — model was saved on Linux, running on Windows
pathlib.PosixPath = pathlib.WindowsPath

# Add YOLOv5 repo to path
YOLOV5_REPO = os.path.join(os.path.dirname(__file__), "yolov5_repo")
if YOLOV5_REPO not in sys.path:
    sys.path.insert(0, YOLOV5_REPO)

class BoxDetector:
    def __init__(self, model_path, conf=0.5, iou=0.45, device="cpu"):
        self.conf       = conf
        self.iou        = iou
        self.device     = device
        self.model_type = None

        try:
            self._load_model(model_path)
            print(f"[INFO] Model loaded: {model_path} ({self.model_type})", file=sys.stderr)
        except Exception as e:
            print(f"[ERROR] Failed to load model: {e}", file=sys.stderr)
            raise

    def _load_model(self, model_path):
        try:
            self.model = torch.hub.load(
                YOLOV5_REPO,
                "custom",
                path=model_path,
                source="local",
                force_reload=False,
                device=self.device,
                verbose=False,
            )
            self.model.conf = self.conf
            self.model.iou  = self.iou
            self.model_type = "yolov5"
            return
        except Exception as e:
            print(f"[INFO] YOLOv5 failed, trying YOLOv8: {e}", file=sys.stderr)

        try:
            from ultralytics import YOLO
            self.model      = YOLO(model_path)
            self.model.to(self.device)
            self.model_type = "yolov8"
            return
        except Exception as e:
            raise RuntimeError(f"Could not load model: {e}")

    def detect(self, frame):
        try:
            if self.model_type == "yolov5":
                return self._detect_v5(frame)
            else:
                return self._detect_v8(frame)
        except Exception as e:
            print(f"[ERROR] Detection failed: {e}", file=sys.stderr)
            return []

    def _detect_v5(self, frame):
        results     = self.model(frame, size=640)
        predictions = results.pred[0]
        detections  = []
        for pred in predictions:
            x1, y1, x2, y2, confidence, cls = pred.tolist()
            detections.append([x1, y1, x2, y2, float(confidence)])
        return detections

    def _detect_v8(self, frame):
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