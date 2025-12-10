import type {
  Bot,
  Log,
  PaginatedResponse,
  PaginationParams,
  Worker,
} from "@packages/shared";

import { apiClient } from "./api";

export class BotService {
  public static async getBots({
    page = 1,
    limit = 10,
  }: PaginationParams = {}): Promise<PaginatedResponse<Bot>> {
    const response = await apiClient.get<PaginatedResponse<Bot>>("/bots", {
      params: { page, limit },
    });

    return response.data;
  }

  public static async getWorkers(
    botId: string,
    { page = 1, limit = 10 }: PaginationParams = {},
  ): Promise<PaginatedResponse<Worker>> {
    const response = await apiClient.get<PaginatedResponse<Worker>>(
      `/bots/${botId}/workers`,
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
      `/bots/${botId}/workers/${workerId}/logs`,
      { params: { page, limit } },
    );

    return response.data;
  }
}
