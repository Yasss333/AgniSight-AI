export const transformLogsToChartData = (logs = []) => {
  if (!logs || logs.length === 0) return { labels: [], dataset: [] };
  
  const labels = logs.map(log => log.elapsedSeconds || Math.floor(log.timestamp / 1000));
  const dataset = logs.map(log => log.count);
  
  return { labels, dataset };
};

export const computeSummaryStats = (logs = []) => {
  if (!logs || logs.length === 0) {
    return { peak: 0, avg: 0, additions: 0, removals: 0 };
  }

  const counts = logs.map(l => l.count);
  const peak = Math.max(...counts);
  const avg = Math.round(counts.reduce((a, b) => a + b, 0) / counts.length);
  
  let additions = 0;
  let removals = 0;
  
  for (let i = 1; i < logs.length; i++) {
    const delta = logs[i].count - logs[i-1].count;
    if (delta > 0) additions += delta;
    if (delta < 0) removals += Math.abs(delta);
  }

  return { peak, avg, additions, removals };
};
