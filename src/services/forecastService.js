// src/services/forecastService.js
export const calculateLinearRegression = (historicalData, monthsToPredict = 6) => {
  const n = historicalData.length;
  if (n === 0) return [];

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

  historicalData.forEach(point => {
    sumX += point.x;
    sumY += point.y;
    sumXY += (point.x * point.y);
    sumXX += (point.x * point.x);
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const predictions = [];
  const lastX = historicalData[n - 1].x;
  const lastMonthDate = new Date(historicalData[n - 1].rawDate);

  for (let i = 1; i <= monthsToPredict; i++) {
    const nextDate = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth() + i, 1);
    const predictedY = Math.max(0, Math.round(slope * (lastX + i) + intercept));
    
    predictions.push({
      monthLabel: nextDate.toLocaleString('id-ID', { month: 'short', year: 'numeric' }),
      actual: null,
      predicted: predictedY,
      isPrediction: true
    });
  }
  return predictions;
};
