export enum BotStatus {
  DISABLED = 'DISABLED',
  ENABLED = 'ENABLED',
  PAUSED = 'PAUSED',
}

export interface Bot {
  readonly id: string;
  readonly created: number;
  name: string;
  status: BotStatus;
  description: string;
}

export interface Log {
  readonly id: string;
  readonly created: number;
  readonly bot: string;
  readonly worker: string;
  message: string;
  botId: string;
}

export interface Worker {
  readonly id: string;
  readonly created: number;
  readonly bot: string;
  name: string;
  description: string;
  botId: string;
}

/**
 * Pagination query parameters
 */
export type PaginationParams = {
  page?: number | undefined;
  limit?: number | undefined;
};

/**
 * Pagination metadata
 */
export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}