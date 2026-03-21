class BoxCounter:
    def __init__(self):
        self.active_ids    = set()
        self.counted_ids   = set()
        self.current_count = 0
        self.peak_count    = 0
        self._history      = []
        self._window       = 5  # smooth over 5 frames

    def update(self, tracks):
        prev_count = self.current_count

        current_ids = {int(float(t[4])) for t in tracks}
        self.active_ids = current_ids

        # Active count this frame
        active_count = len(current_ids)

        # Keep rolling history for smoothing
        self._history.append(active_count)
        if len(self._history) > self._window:
            self._history.pop(0)

        # Smoothed count = max of recent window
        # This prevents dips from occlusion dropping the count
        smoothed = max(self._history)

        # Peak is the highest we've ever seen
        if smoothed > self.peak_count:
            self.peak_count = smoothed

        # Display peak — most accurate for packing scenario
        # Boxes are ADDED not removed, so peak = true count
        self.current_count = self.peak_count

        changed = self.current_count != prev_count
        return self.current_count, prev_count, changed

    def reset(self):
        self.active_ids    = set()
        self.counted_ids   = set()
        self.current_count = 0
        self.peak_count    = 0
        self._history      = []