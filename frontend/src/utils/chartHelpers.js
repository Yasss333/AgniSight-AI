export const transformLogsToChartData = (logs) => {
  if (!logs || logs.length === 0) {
    return { labels: [], dataset: [] };
  }
  const sampled = logs.filter((_, i) => i % 10 === 0);
  return {
    labels:  sampled.map((l) => {
      const t = new Date(l.timestamp);
      return `${t.getMinutes()}:${String(t.getSeconds()).padStart(2, "0")}`;
    }),
    dataset: sampled.map((l) => l.boxCount),
  };
};

export const computeSummaryStats = (logs) => {
  if (!logs || logs.length === 0) {
    return { peak: 0, avg: 0, additions: 0, removals: 0 };
  }
  const counts = logs.map((l) => l.boxCount);
  const peak   = Math.max(...counts);
  const avg    = parseFloat(
    (counts.reduce((a, b) => a + b, 0) / counts.length).toFixed(1)
  );
  let additions = 0;
  let removals  = 0;
  for (let i = 1; i < counts.length; i++) {
    const diff = counts[i] - counts[i - 1];
    if (diff > 0) additions += diff;
    if (diff < 0) removals  += Math.abs(diff);
  }
  return { peak, avg, additions, removals };
};