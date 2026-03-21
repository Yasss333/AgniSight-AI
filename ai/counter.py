class BoxCounter:
    def __init__(self):
        self.active_ids    = set()
        self.counted_ids   = set()
        self.current_count = 0
        self.peak_count    = 0

    def update(self, tracks):
        prev_count = self.current_count

        current_ids = {int(float(t[4])) for t in tracks}
        self.counted_ids.update(current_ids)
        self.active_ids = current_ids

        # Use cumulative unique IDs — most accurate for packing scenario
        # (boxes added to container, not removed)
        self.current_count = len(self.counted_ids)

        # Track peak
        if self.current_count > self.peak_count:
            self.peak_count = self.current_count

        changed = self.current_count != prev_count
        return self.current_count, prev_count, changed

    def reset(self):
        self.active_ids    = set()
        self.counted_ids   = set()
        self.current_count = 0
        self.peak_count    = 0