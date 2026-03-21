import numpy as np
from filterpy.kalman import KalmanFilter

def iou(bb_test, bb_gt):
    """Compute IOU between two boxes [x1,y1,x2,y2]."""
    xx1 = max(bb_test[0], bb_gt[0])
    yy1 = max(bb_test[1], bb_gt[1])
    xx2 = min(bb_test[2], bb_gt[2])
    yy2 = min(bb_test[3], bb_gt[3])

    w = max(0.0, xx2 - xx1)
    h = max(0.0, yy2 - yy1)
    intersection = w * h

    area_test = (bb_test[2] - bb_test[0]) * (bb_test[3] - bb_test[1])
    area_gt   = (bb_gt[2]   - bb_gt[0])   * (bb_gt[3]   - bb_gt[1])
    union = area_test + area_gt - intersection

    return intersection / union if union > 0 else 0.0


class KalmanBox:
    """Kalman filter tracker for a single bounding box."""
    count = 0

    def __init__(self, bbox):
        self.kf = KalmanFilter(dim_x=7, dim_z=4)
        self.kf.F = np.array([
            [1,0,0,0,1,0,0],
            [0,1,0,0,0,1,0],
            [0,0,1,0,0,0,1],
            [0,0,0,1,0,0,0],
            [0,0,0,0,1,0,0],
            [0,0,0,0,0,1,0],
            [0,0,0,0,0,0,1],
        ], dtype=float)
        self.kf.H = np.array([
            [1,0,0,0,0,0,0],
            [0,1,0,0,0,0,0],
            [0,0,1,0,0,0,0],
            [0,0,0,1,0,0,0],
        ], dtype=float)

        self.kf.R[2:, 2:] *= 10.0
        self.kf.P[4:, 4:] *= 1000.0
        self.kf.P         *= 10.0
        self.kf.Q[-1, -1] *= 0.01
        self.kf.Q[4:, 4:] *= 0.01

        self.kf.x[:4] = self._to_z(bbox)

        self.time_since_update = 0
        self.id                = KalmanBox.count
        KalmanBox.count       += 1
        self.history           = []
        self.hits              = 0
        self.hit_streak        = 0
        self.age               = 0

    def _to_z(self, bbox):
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        x = bbox[0] + w / 2
        y = bbox[1] + h / 2
        s = w * h
        r = w / float(h) if h != 0 else 1
        return np.array([x, y, s, r]).reshape((4, 1))

    def _to_bbox(self):
        x = self.kf.x
        w = np.sqrt(abs(x[2] * x[3]))
        h = x[2] / w if w != 0 else 0
        return [
            x[0] - w / 2,
            x[1] - h / 2,
            x[0] + w / 2,
            x[1] + h / 2,
        ]

    def predict(self):
        if self.time_since_update > 0:
            self.hit_streak = 0
        self.time_since_update += 1
        self.kf.predict()
        self.age += 1
        self.history.append(self._to_bbox())
        return self.history[-1]

    def update(self, bbox):
        self.time_since_update = 0
        self.history           = []
        self.hits             += 1
        self.hit_streak       += 1
        self.kf.update(self._to_z(bbox))

    def get_state(self):
        return self._to_bbox()


class SORTTracker:
    def __init__(self, max_age=60, min_hits=2, iou_threshold=0.25):
        self.max_age       = max_age
        self.min_hits      = min_hits
        self.iou_threshold = iou_threshold
        self.trackers      = []
        KalmanBox.count    = 0           # reset IDs each session

    def update(self, detections):
        """
        detections: list of [x1, y1, x2, y2, confidence]
        returns:    list of [x1, y1, x2, y2, track_id]
        """
        # Predict new positions
        predicted = []
        to_remove = []
        for i, t in enumerate(self.trackers):
            p = t.predict()
            if np.any(np.isnan(p)):
                to_remove.append(i)
            else:
                predicted.append(p)
        for i in reversed(to_remove):
            self.trackers.pop(i)

        # Match detections to trackers using IOU
        matched, unmatched_dets, unmatched_trks = self._associate(
            detections, predicted
        )

        # Update matched trackers
        for d, t in matched:
            self.trackers[t].update(detections[d][:4])

        # Create new trackers for unmatched detections
        for d in unmatched_dets:
            self.trackers.append(KalmanBox(detections[d][:4]))

        # Remove dead trackers
        self.trackers = [
            t for t in self.trackers
            if t.time_since_update <= self.max_age
        ]

        # Return confirmed tracks
        result = []
        for t in self.trackers:
            if t.time_since_update == 0 and t.hit_streak >= self.min_hits:
                bbox = t.get_state()
                result.append([bbox[0], bbox[1], bbox[2], bbox[3], t.id])

        return result

    def _associate(self, detections, predictions):
        if not predictions:
            return [], list(range(len(detections))), []
        if not detections:
            return [], [], list(range(len(predictions)))

        iou_matrix = np.zeros((len(detections), len(predictions)))
        for d, det in enumerate(detections):
            for t, trk in enumerate(predictions):
                iou_matrix[d, t] = iou(det[:4], trk)

        # Hungarian-style greedy match
        matched_indices = []
        used_dets = set()
        used_trks = set()

        iou_flat = np.argsort(-iou_matrix.flatten())
        for idx in iou_flat:
            d = idx // len(predictions)
            t = idx  % len(predictions)
            if d in used_dets or t in used_trks:
                continue
            if iou_matrix[d, t] >= self.iou_threshold:
                matched_indices.append((d, t))
                used_dets.add(d)
                used_trks.add(t)

        unmatched_dets = [d for d in range(len(detections)) if d not in used_dets]
        unmatched_trks = [t for t in range(len(predictions)) if t not in used_trks]

        return matched_indices, unmatched_dets, unmatched_trks