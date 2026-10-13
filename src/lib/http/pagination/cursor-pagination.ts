import { Knex } from "knex";

export interface PaginationParams {
    cursor?: string | null;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}

export interface FilterParams {
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'like' | 'notLike' | 'in' | 'notIn' | 'isNull' | 'isNotNull';
    value: string | string[];
}

export interface PaginationMeta {
    nextCursor: string | null;
    hasMore: boolean;
    count: number;
}

function camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function applyCursorPagination(query: Knex.QueryBuilder, params: PaginationParams): Knex.QueryBuilder {
    if (!params.sortBy) {
        return query.limit(params.limit);
    }

    const dbColumn = camelToSnake(params.sortBy);

    if (params.cursor) {
        const op = params.sortOrder === 'asc' ? '>=' : '<=';
        query = query.where(dbColumn, op, params.cursor);
    }

    return query.orderBy(dbColumn, params.sortOrder).limit(params.limit + 1);
}

export function buildPaginationResult(rows: any[], limit: number, sortBy: string): { data: any[], meta: PaginationMeta } {
    if (!sortBy) {
        return {
            data: rows,
            meta: {
                nextCursor: null,
                hasMore: false,
                count: rows.length
            }
        };
    }

    const hasMore = rows.length > limit;
    const lastItem = rows[rows.length - 1];
    const data = hasMore ? rows.slice(0, limit) : rows;
    let nextCursor = null;

    const camelize = (s: string): string => s.replace(/_./g, x => x[1].toUpperCase())

    if (data.length > 0) {
        nextCursor = hasMore && lastItem ? lastItem[camelize(sortBy)] : null;
    }

    return {
        data,
        meta: {
            nextCursor,
            hasMore,
            count: data.length
        }
    }
}

export function applyFilters(query: Knex.QueryBuilder, filters: FilterParams[]): Knex.QueryBuilder {
    filters.map((filter) => filter.field = camelToSnake(filter.field));

    console.log(filters);
    for (const filter of filters) {
        switch (filter.operator) {
            case 'eq':
                query = query.where(filter.field, '=', filter.value);
                break;
            case 'neq':
                query = query.where(filter.field, '!=', filter.value);
                break;
            case 'gt':
                query = query.where(filter.field, '>', filter.value);
                break;
            case 'lt':
                query = query.where(filter.field, '<', filter.value);
                break;
            case 'gte':
                query = query.where(filter.field, '>=', filter.value);
                break;
            case 'lte':
                query = query.where(filter.field, '<=', filter.value);
                break;
            case 'like':
                query = query.whereLike(filter.field, `%${filter.value}%`);
                break;
            case 'notLike':
                query = query.whereNot(filter.field, 'like', `%${filter.value}%`);
                break;
            case 'in':
                query = query.whereIn(filter.field, Array.isArray(filter.value) ? filter.value : [filter.value]);
                break;
            case 'notIn':
                query = query.whereNotIn(filter.field, [...filter.value]);
                break;
            case 'isNull':
                query = query.whereNull(filter.field);
                break;
            case 'isNotNull':
                query = query.whereNotNull(filter.field);
                break;
        }
    }

    return query;
}