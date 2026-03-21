class BoxCounter:
    def __init__(self):
        self.active_ids    = set()
        self.counted_ids   = set()
        self.current_count = 0
        self.peak_count    = 0
        self._history      = []
        self._window       = 5

    def update(self, tracks):
        prev_count = self.current_count
        current_ids = {int(float(t[4])) for t in tracks}
        self.active_ids = current_ids
        active_count = len(current_ids)

        self._history.append(active_count)
        if len(self._history) > self._window:
            self._history.pop(0)

        smoothed = max(self._history)
        if smoothed > self.peak_count:
            self.peak_count = smoothed

        self.current_count = self.peak_count
        changed = self.current_count != prev_count
        return self.current_count, prev_count, changed

    def reset(self):
        self.active_ids    = set()
        self.counted_ids   = set()
        self.current_count = 0
        self.peak_count    = 0
        self._history      = []
