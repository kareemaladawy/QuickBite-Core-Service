import { FilterParams, PaginationParams } from "./cursor-pagination";

const DEFAULT_SORT_BY = 'createdAt';

export function parsePaginationFromQuery(query: Record<string, any>, allowedFields: string[]): PaginationParams {
    const sortBy = allowedFields.includes(query.sortBy) ? query.sortBy : DEFAULT_SORT_BY;
    const cursor = query.cursor ? String(query.cursor) : null;
    const limit = Math.min(100, Number(query.limit ?? 10));
    const sortOrder = query.sortOrder ?? 'asc';

    return {
        cursor,
        limit,
        sortBy,
        sortOrder
    };
}

export function parseFiltersFromQuery(query: Record<string, any>, allowedFields: string[]): FilterParams[] {
    const filters: FilterParams[] = []
    const allowedOps = new Set(['eq', 'neq', 'gt', 'lt', 'gte', 'lte', 'like', 'in', 'notIn', 'isNull', 'isNotNull']);

    for (const [key, value] of Object.entries(query)) {
        if (!allowedFields.includes(key)) continue;

        if (value !== null && typeof value === 'object') {
            for (const [op, opValue] of Object.entries(value)) {
                if (!allowedOps.has(op)) continue;

                filters.push({ field: key, operator: op as FilterParams['operator'], value: opValue as string });
            }
        } else {
            filters.push({ field: key, operator: 'eq', value: value as string });
        }
    }

    return filters
}