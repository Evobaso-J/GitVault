const UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'] as const

/**
 * Formats a byte count with the largest unit that keeps it ≥ 1, e.g. `1.2 MB`.
 */
export const formatBytes = (bytes: number, locale?: string): string => {
  const exponent = bytes > 0 ? Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1) : 0
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: UNITS[exponent],
    unitDisplay: 'short',
    maximumFractionDigits: exponent ? 1 : 0,
  }).format(bytes / 1024 ** exponent)
}
