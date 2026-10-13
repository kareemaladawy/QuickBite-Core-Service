type timeUnit = 'h' | 'm' | 's' | 'd';

const multipliers: Record<timeUnit, number> = {
    h: 60 * 60 * 1000,
    m: 60 * 1000,
    s: 1000,
    d: 24 * 60 * 60 * 1000,
};

export const toMs = (n: number, unit: timeUnit) => {
    return n * multipliers[unit];
}

export const toSeconds = (n: number, unit: timeUnit) => {
    return toMs(n, unit) / 1000;
}
