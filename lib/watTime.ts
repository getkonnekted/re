/**
 * West Africa Time (WAT) utilities
 * Nigeria / Lagos operates on UTC+1 year-round.
 */

export const getWatDate = (date: Date = new Date()): Date => {
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  // WAT is UTC+1 hour (3,600,000 ms)
  return new Date(utcTime + 3600000);
};

export const getWatDateString = (date: Date = new Date()): string => {
  const wat = getWatDate(date);
  const year = wat.getFullYear();
  const month = String(wat.getMonth() + 1).padStart(2, '0');
  const day = String(wat.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getWatYesterdayString = (date: Date = new Date()): string => {
  const wat = getWatDate(date);
  wat.setDate(wat.getDate() - 1);
  const year = wat.getFullYear();
  const month = String(wat.getMonth() + 1).padStart(2, '0');
  const day = String(wat.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getWatMillisecondsUntilMidnight = (date: Date = new Date()): number => {
  const wat = getWatDate(date);
  const midnight = new Date(wat);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(0, midnight.getTime() - wat.getTime());
};

export const formatWatCountdown = (ms: number): { hours: number; minutes: number; seconds: number; formatted: string } => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return { hours, minutes, seconds, formatted };
};
