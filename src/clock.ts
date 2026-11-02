export type PlayClock = { elapsed: number; previous: number | null; paused: boolean };

export function createClock(): PlayClock {
  return { elapsed: 0, previous: null, paused: true };
}

export function advanceClock(clock: PlayClock, timestamp: number): PlayClock {
  if (clock.paused || clock.previous === null || !Number.isFinite(timestamp)) return clock;
  const now = Math.max(clock.previous, timestamp);
  return { ...clock, elapsed: clock.elapsed + now - clock.previous, previous: now };
}

export function pauseClock(clock: PlayClock, timestamp: number): PlayClock {
  if (clock.paused) return clock;
  return { ...advanceClock(clock, timestamp), previous: null, paused: true };
}

export function resumeClock(clock: PlayClock, timestamp: number): PlayClock {
  if (!clock.paused || !Number.isFinite(timestamp)) return clock;
  return { ...clock, previous: timestamp, paused: false };
}
