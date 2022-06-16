export const zeroPad = function (d: number): string {
  return d >= 0 && d < 10 ? `0${d}` : d.toString();
};

export function readableDuration(
  t: number,
  opts: {
    base: // | 'year'
    // | 'month'
    // | 'week'
    // | 'day'
    // | 'hour'
    // | 'minute'
    'second' | 'millisecond';
    relative?: boolean;
    limit?: number;
  } = { base: 'second', relative: false }
) {
  if (opts.base == null) opts.base = 'millisecond'; // vs milliseconds
  if (opts.limit == null) opts.limit = undefined; // just 2 significant units
  const ms = 1;
  const s = opts.base === 'second' ? 1 : 1000 * ms;
  const m = 60 * s;
  const h = 60 * m;
  const d = 24 * h;
  const w = 7 * d;
  const mm = 30 * d;
  const y = 365 * d;

  type DurationUnit = {
    name: string;
    timeUnits: number;
    singlePast?: string;
    singleFuture?: string;
    present?: string;
  };

  const blocks: DurationUnit[] = [
    {
      name: 'year',
      timeUnits: y,
      singlePast: 'last year',
      singleFuture: 'next year',
    },
    {
      name: 'month',
      timeUnits: mm,
      singlePast: 'last month',
      singleFuture: 'next month',
    },
    {
      name: 'week',
      timeUnits: w,
      singlePast: 'last week',
      singleFuture: 'next week',
    },
    {
      name: 'day',
      timeUnits: d,
      singlePast: 'yesterday',
      singleFuture: 'tomorrow',
      present: 'today',
    },
    { name: 'hour', timeUnits: h },
    { name: 'minute', timeUnits: m },
    { name: 'second', timeUnits: s },
  ];
  if (opts.base === 'millisecond') {
    blocks.push({ name: 'millisecond', timeUnits: ms });
  }

  const rawDurations = new Array<{
    units: number;
    meta: DurationUnit;
  }>();
  blocks.forEach((b) => {
    const v = b.timeUnits;
    if (t >= v) {
      const f = Math.floor(t / v);
      rawDurations.push({ units: f, meta: b });
      t = t % v;
    }
  });

  // Format the raw durations
  const durArr: string[] = rawDurations
    .slice(0, opts.limit)
    .map((d, i, arr) => {
      let out = '';
      if (d.units === 1 && d.meta.singlePast) {
        out += d.meta.singlePast;
      } else {
        out += `${d.units} ${d.meta.name}${d.units === 1 ? '' : 's'}`;
      }
      if (i === arr.length - 1 && (d.units !== 1 || !d.meta.singlePast)) {
        // Last entry
        out += ' ago';
      }
      return out;
    });

  return durArr.join(', ').replace(/^(.+),/, '$1 and');
}

export function durationToMs(duration: string): number {
  const durParts = duration.split(/\s+/);
  const s = 1000;
  const m = 60 * s;
  const h = 60 * m;
  const d = 24 * h;
  const w = 7 * d;
  const mm = 30 * d;
  const y = 365 * d;
  const units = { s, m, h, d, w, mm, y };

  let ms = 0;
  durParts.forEach((dur) => {
    const re = /(\d+)(\w+)/;
    const [, num, unit]: RegExpExecArray | [string, string, string] = re.exec(
      dur
    ) || ['0s', '0', 's'];
    // eslint-disable-next-line no-prototype-builtins
    if (num && unit && units.hasOwnProperty(unit)) {
      const u = unit as keyof typeof units;
      ms += Number(num) * units[u];
    }
  });
  return ms;
}

export function getEpochTime(dateStr: string | Date = new Date()) {
  return Math.floor(new Date(dateStr).getTime() / 1000);
}

export function fromNow(duration: string): Date {
  return new Date(Date.now() - durationToMs(duration));
}
