class BoxCounter:
    def __init__(self):
        self.active_ids   = set()   # currently visible track IDs
        self.counted_ids  = set()   # all IDs ever seen (never decrements)
        self.current_count = 0

    def update(self, tracks):
        """
        tracks: list of [x1, y1, x2, y2, track_id]
        Returns (current_count, prev_count, changed)
        """
        prev_count = self.current_count

        # IDs visible in this frame
        current_ids = {int(t[4]) for t in tracks}

        # Add new IDs to counted set
        new_ids = current_ids - self.counted_ids
        self.counted_ids.update(new_ids)
        self.active_ids = current_ids

        # Current count = total unique IDs ever seen
        # (boxes don't disappear from count once placed)
        self.current_count = len(self.counted_ids)

        changed = self.current_count != prev_count
        return self.current_count, prev_count, changed

    def reset(self):
        self.active_ids    = set()
        self.counted_ids   = set()
        self.current_count = 0