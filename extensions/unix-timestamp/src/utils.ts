import { getPreferenceValues } from "@raycast/api";

type TimestampFormat = "seconds" | "milliseconds";

interface Preferences {
  format: TimestampFormat;
  isUTC: boolean;
}

interface Difference {
  value: number;
  unit: Intl.RelativeTimeFormatUnit;
}

function getMultiplier(): number {
  const { format } = getPreferenceValues<Preferences>();
  const multiplierMap: Record<TimestampFormat, number> = {
    seconds: 1000,
    milliseconds: 1,
  };
  const multiplier = multiplierMap[format];
  return multiplier;
}

export function getCurrentTimestamp(): number {
  const multiplier = getMultiplier();
  const timestamp = Math.floor(Date.now() / multiplier);
  return timestamp;
}

export function getTimestamp(date: Date): number {
  const multiplier = getMultiplier();
  return Math.floor(date.getTime() / multiplier);
}

export function getDate(timestamp: number): Date {
  const multiplier = getMultiplier();
  const date = new Date(timestamp * multiplier);
  return date;
}

export function toDateString(date: Date): string {
  const { isUTC } = getPreferenceValues<Preferences>();

  const formatConfig: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZoneName: "short",
  };

  const timeZone = isUTC ? "UTC" : undefined;

  const dateString = date.toLocaleDateString("en-US", {
    ...formatConfig,
    timeZone,
  });

  return dateString;
}

export function toDate(year: number, month: number, day: number, hours: number, minutes: number, seconds: number) {
  const { isUTC } = getPreferenceValues<Preferences>();
  const date = new Date(year, month - 1, day, hours, minutes, seconds);

  if (isUTC) {
    const localTime = date.getTime();
    const offset = date.getTimezoneOffset();
    const time = localTime - 60 * 1000 * offset;
    const correctedDate = new Date(time);
    return correctedDate;
  }

  return date;
}

export function getRelativeTime(oldDate: Date, newDate: Date): string {
  const { value, unit } = getDifference(oldDate.getTime(), newDate.getTime());
  const formatter = new Intl.RelativeTimeFormat("en-US", { style: "narrow" });
  const relativeTime = formatter.format(value, unit);
  return relativeTime;
}

function getDifference(oldTimestamp: number, newTimestamp: number): Difference {
  const diff = Math.floor((oldTimestamp - newTimestamp) / 1000);
  const diffAbs = Math.abs(diff);
  if (diffAbs < 60) {
    return {
      value: diff,
      unit: "second",
    };
  } else if (diffAbs < 60 * 60) {
    return {
      value: Math.round(diff / 60),
      unit: "minute",
    };
  } else if (diffAbs < 24 * 60 * 60) {
    return {
      value: Math.round(diff / (60 * 60)),
      unit: "hour",
    };
  } else if (diffAbs < 30 * 24 * 60 * 60) {
    return {
      value: Math.round(diff / (24 * 60 * 60)),
      unit: "day",
    };
  } else if (diffAbs < 365 * 24 * 60 * 60) {
    return {
      value: Math.round(diff / (30 * 24 * 60 * 60)),
      unit: "month",
    };
  } else {
    return {
      value: Math.round(diff / (365 * 24 * 60 * 60)),
      unit: "year",
    };
  }
}
