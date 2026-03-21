import argparse
import os

def get_config():
    parser = argparse.ArgumentParser(description="AgniSight-AI Box Counter")

    parser.add_argument("--video",        type=str, required=True,  help="Path to input video file")
    parser.add_argument("--session_id",   type=str, required=True,  help="Session ID from MongoDB")
    # ═══════════════════════════════════════════════════════════════════════════════
    # YOLO Threshold Optimization for Box Detection Accuracy (80%+ target)
    # - Lower confidence catches more boxes (reduces false negatives)
    # - Lower IOU allows better NMS filtering (removes duplicates more aggressively)
    # ═══════════════════════════════════════════════════════════════════════════════
    parser.add_argument("--conf",         type=float, default=0.25,  help="YOLO confidence threshold (0.25 optimized for box detection)")
    parser.add_argument("--iou",          type=float, default=0.30,  help="YOLO IOU threshold (0.30 for better NMS filtering)")
    parser.add_argument("--model", type=str, default=os.path.join(os.path.dirname(__file__), "models", "box_detection.pt"))
    parser.add_argument("--snapshot_dir", type=str, default="../data/snapshots", help="Directory to save snapshots")
    parser.add_argument("--output_dir",   type=str, default="../data/outputs",   help="Directory to save output video")
    parser.add_argument("--frame_skip",   type=int, default=2,      help="Process every Nth frame (1 = all frames)")
    parser.add_argument("--device",       type=str, default="cpu",  help="Device to run on: cpu or cuda")

    return parser.parse_args()