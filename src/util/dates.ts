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
    limit?: number;
  } = { base: 'second' }
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
  const blocks = [
    { name: 'year', timeUnits: y },
    { name: 'month', timeUnits: mm },
    { name: 'week', timeUnits: w },
    { name: 'day', timeUnits: d },
    { name: 'hour', timeUnits: h },
    { name: 'minute', timeUnits: m },
    { name: 'second', timeUnits: s },
  ];
  if (opts.base === 'millisecond') {
    blocks.push({ name: 'millisecond', timeUnits: ms });
  }

  const durArr: string[] = [];
  blocks.forEach((b) => {
    const v = b.timeUnits;
    if (t >= v) {
      const f = Math.floor(t / v);
      durArr.push(`${f} ${b.name}${f === 1 ? '' : 's'}`);
      t = t % v;
    }
  });
  return durArr
    .slice(0, opts.limit)
    .join(', ')
    .replace(/^(.+),/, '$1 and');
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
