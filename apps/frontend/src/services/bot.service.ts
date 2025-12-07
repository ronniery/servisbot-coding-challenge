import type {
  Bot,
  Worker,
  Log,
  PaginatedResponse,
  PaginationParams,
} from "@packages/shared";

import { apiClient } from "./api";

export class BotService {
  public static async getBots({
    page = 1,
    limit = 10,
  }: PaginationParams = {}): Promise<PaginatedResponse<Bot>> {
    const response = await apiClient.get<PaginatedResponse<Bot>>("/", {
      params: { page, limit },
    });

    return response.data;
  }

  public static async getWorkers(
    botId: string,
    { page = 1, limit = 10 }: PaginationParams = {},
  ): Promise<PaginatedResponse<Worker>> {
    const response = await apiClient.get<PaginatedResponse<Worker>>(
      `/${botId}/workers`,
      { params: { page, limit } },
    );

    return response.data;
  }

  public static async getLogs(
    botId: string,
    workerId: string,
    { page = 1, limit = 10 }: PaginationParams = {},
  ): Promise<PaginatedResponse<Log>> {
    const response = await apiClient.get<PaginatedResponse<Log>>(
      `/${botId}/workers/${workerId}/logs`,
      { params: { page, limit } },
    );

    return response.data;
  }
}
