import cv2
import os
import sys

def save_snapshot(frame, session_id, frame_number, snapshot_dir):
    """
    Save annotated frame as JPEG when count changes.
    Returns the saved file path.
    """
    try:
        os.makedirs(snapshot_dir, exist_ok=True)
        filename  = f"{session_id}_frame{frame_number}.jpg"
        filepath  = os.path.join(snapshot_dir, filename)
        cv2.imwrite(filepath, frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
        return filepath
    except Exception as e:
        print(f"[ERROR] Failed to save snapshot: {e}", file=sys.stderr)
        return None