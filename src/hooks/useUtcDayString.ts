import { DateTime } from "luxon";
import { useEffect, useState } from "react";

function getUtcDayString(): string {
  return DateTime.utc().toFormat("yyyy-MM-dd");
}

function getMillisUntilNextUtcDay(): number {
  const now = DateTime.utc();
  const nextUtcDay = now.plus({ days: 1 }).startOf("day");
  return Math.max(1, nextUtcDay.diff(now).as("milliseconds"));
}

export function useUtcDayString(): string {
  const [dayString, setDayString] = useState(getUtcDayString);

  useEffect(() => {
    let timeoutId = window.setTimeout(function tick() {
      setDayString(getUtcDayString());
      timeoutId = window.setTimeout(tick, getMillisUntilNextUtcDay());
    }, getMillisUntilNextUtcDay());

    return () => window.clearTimeout(timeoutId);
  }, []);

  return dayString;
}
