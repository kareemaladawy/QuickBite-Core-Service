export const seconds = (n: number) => n * 1000;
export const minutes = (n: number) => n * seconds(60);
export const hours = (n: number) => n * minutes(60);
export const days = (n: number) => n * hours(24);

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
