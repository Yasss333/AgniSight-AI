import cv2
import sys
import json
import time
import os
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=DeprecationWarning)
# Fix import conflict with yolov5_repo/utils
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config   import get_config
from detector import BoxDetector
from tracker  import SORTTracker
from counter  import BoxCounter
from snapshot import save_snapshot

# Import our utils AFTER fixing path — avoids conflict with yolov5_repo/utils
import importlib.util
_spec = importlib.util.spec_from_file_location(
    "ai_utils",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "utils.py")
)
_ai_utils = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_ai_utils)
draw_detections = _ai_utils.draw_detections
resize_frame    = _ai_utils.resize_frame


def emit(data):
    """Stream JSON line to Node.js via stdout."""
    print(json.dumps(data), flush=True)


def main():
    cfg = get_config()

    # Validate video path
    if not os.path.exists(cfg.video):
        emit({"type": "error", "message": f"Video not found: {cfg.video}"})
        sys.exit(1)

    # Init components
    detector = BoxDetector(cfg.model, conf=cfg.conf, iou=cfg.iou, device=cfg.device)
    tracker = SORTTracker(max_age=90, min_hits=1, iou_threshold=0.2)
    counter  = BoxCounter()

    cap = cv2.VideoCapture(cfg.video)
    if not cap.isOpened():
        emit({"type": "error", "message": f"Cannot open video: {cfg.video}"})
        sys.exit(1)

    # Output video writer setup
    os.makedirs(cfg.output_dir, exist_ok=True)
    output_path = os.path.join(cfg.output_dir, f"{cfg.session_id}_output.mp4")
    fourcc      = cv2.VideoWriter_fourcc(*"mp4v")
    fps_orig    = cap.get(cv2.CAP_PROP_FPS) or 25
    w           = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h           = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # Calculate output dimensions after resize
    out_w = min(w, 960)
    out_h = int(h * out_w / w) if w > 960 else h
    out   = cv2.VideoWriter(output_path, fourcc, fps_orig, (out_w, out_h))

    frame_number = 0
    total_frames = 0
    fps_display  = 0.0
    prev_time    = time.time()

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_number += 1

        # Skip frames if configured
        if frame_number % cfg.frame_skip != 0:
            continue

        total_frames += 1
        frame = resize_frame(frame, width=960)

        # ── Detect ──────────────────────────────────────────
        detections = detector.detect(frame)

        # ── Track ───────────────────────────────────────────
        tracks = tracker.update(detections)

        # ── Count ───────────────────────────────────────────
        count, prev_count, changed = counter.update(tracks)

        # ── FPS ─────────────────────────────────────────────
        now         = time.time()
        fps_display = 1.0 / (now - prev_time) if (now - prev_time) > 0 else 0
        prev_time   = now

        # ── Annotate + Write frame ───────────────────────────
        annotated = draw_detections(frame.copy(), tracks, count, fps_display)
        out.write(annotated)

        # ── Snapshot on count change ─────────────────────────
        if changed:
            snapshot_path = save_snapshot(
                annotated, cfg.session_id, frame_number, cfg.snapshot_dir
            )
            emit({
                "type":       "snapshot",
                "frame":      frame_number,
                "prev_count": prev_count,
                "new_count":  count,
                "image_path": snapshot_path,
            })

        # ── Stream frame data to Node.js ─────────────────────
        emit({
            "type":  "frame",
            "frame": frame_number,
            "count": count,
            "fps":   round(fps_display, 2),
            "detections": [
                {
                    "trackId": int(float(t[4])),
                    "bbox": [float(t[0].item() if hasattr(t[0], 'item') else t[0]),
                            float(t[1].item() if hasattr(t[1], 'item') else t[1]),
                            float(t[2].item() if hasattr(t[2], 'item') else t[2]),
                            float(t[3].item() if hasattr(t[3], 'item') else t[3])]
                }
                for t in tracks
            ],
        })

    # ── Cleanup ──────────────────────────────────────────────
    cap.release()
    out.release()

    emit({
        "type":              "done",
        "total_frames":      total_frames,
        "final_count":       counter.current_count,
        "output_video_path": output_path,
    })

    sys.exit(0)


if __name__ == "__main__":
    main()