enum Period {
  'month' = 30,
  'week' = 7,
  'day' = 1,
}

const getTimeRange = (period: Period, end = new Date()) => {
  const start = new Date(end);
  start.setDate(end.getDate() - period);
  
  return {start, end}
}

export { getTimeRange, Period }