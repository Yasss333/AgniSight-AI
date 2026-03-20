import cv2
import numpy as np

# Color palette for different track IDs
COLORS = [
    (0,   255, 100),
    (0,   200, 255),
    (255, 100, 0  ),
    (255, 0,   150),
    (150, 0,   255),
    (0,   150, 255),
    (255, 200, 0  ),
    (0,   255, 200),
]

def get_color(track_id):
    return COLORS[int(track_id) % len(COLORS)]

def draw_detections(frame, tracks, box_count, fps):
    """
    Draw bounding boxes, track IDs, count overlay and FPS on frame.
    tracks: list of [x1, y1, x2, y2, track_id]
    """
    for track in tracks:
        x1, y1, x2, y2, track_id = int(track[0]), int(track[1]), int(track[2]), int(track[3]), int(track[4])
        color = get_color(track_id)

        # Bounding box
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

        # Track ID label background
        label = f"ID:{track_id}"
        (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
        cv2.rectangle(frame, (x1, y1 - th - 8), (x1 + tw + 6, y1), color, -1)

        # Track ID text
        cv2.putText(frame, label, (x1 + 3, y1 - 4),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)

    # ── Count overlay (top left) ─────────────────────────────
    overlay = frame.copy()
    cv2.rectangle(overlay, (10, 10), (220, 90), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.5, frame, 0.5, 0, frame)

    cv2.putText(frame, f"Boxes: {box_count}", (20, 45),
                cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 100), 3)
    cv2.putText(frame, f"FPS:   {fps:.1f}", (20, 78),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    return frame

def resize_frame(frame, width=960):
    """Resize frame maintaining aspect ratio."""
    h, w = frame.shape[:2]
    if w <= width:
        return frame
    ratio = width / w
    return cv2.resize(frame, (width, int(h * ratio)))