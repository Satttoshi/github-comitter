import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function currentTimeZoneToIsoString(): string {
  const date = new Date();
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  const timezoneDate = new Date(date.getTime() - timezoneOffset);
  const timezoneDateIsoString = timezoneDate.toISOString();
  return timezoneDateIsoString.slice(0, -8);
}
