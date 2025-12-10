import React, { Fragment, useCallback } from "react";

import { type Bot, BotStatus, type Worker } from "@packages/shared";

import { usePagination } from "../hooks/usePagination";
import { BotService } from "../services/bot.service";
import { WorkerCard } from "./WorkerCard";

type BadgeProps = {
  status: BotStatus;
};

const Badge = ({ status }: BadgeProps): React.ReactElement => {
  let className = "status-badge";

  if (status === BotStatus.ENABLED) {
    className += " status-success";
  } else if (status === BotStatus.DISABLED) {
    className += " status-error";
  } else {
    className += " status-warning"; // Paused
  }

  return <span className={className}>{status}</span>;
};

export type BotCardProps = {
  bot: Bot;
  isExpanded: boolean;
  onToggle: (botId: string) => void;
  expandedWorkerId: string | null;
  toggleWorker: (workerId: string) => void;
};

export const BotCard = ({
  bot,
  isExpanded,
  onToggle,
  expandedWorkerId,
  toggleWorker,
}: BotCardProps): React.ReactElement => {
  const resolveWorkers = useCallback(
    (page: number) => BotService.getWorkers(bot.id, { page, limit: 10 }),
    [bot.id],
  );

  const {
    items: workers,
    isPageEmpty,
    hasMore,
    isLoading,
    loadNext,
  } = usePagination<Worker>(resolveWorkers);

  const handleLoadMore = (e: React.MouseEvent): void => {
    e.stopPropagation(); // Prevent toggling accordion

    loadNext();
  };

  return (
    <div className={`card bot-card ${isExpanded ? "expanded" : ""}`}>
      <div className="card-header" onClick={() => onToggle(bot.id)}>
        <Badge status={bot.status} />
        <div className="header-info" style={{ marginLeft: "10px" }}>
          <h3 className="truncate-text">{bot.name}</h3>
          <p className="subtitle">ID: {bot.id}</p>
        </div>
        <span className="worker-count">
          {isPageEmpty ? "" : `${workers.length}+ Workers`}
        </span>
        <span className="toggle-icon">{isExpanded ? "▲" : "▼"}</span>
      </div>

      {isExpanded && (
        <div className="card-content worker-list-container">
          {isPageEmpty && !isLoading ? (
            <p className="no-data">No Workers found for this Bot.</p>
          ) : (
            <Fragment>
              {workers.map((worker) => (
                <WorkerCard
                  key={worker.id}
                  botId={bot.id}
                  worker={worker}
                  isExpanded={worker.id === expandedWorkerId}
                  onToggle={toggleWorker}
                />
              ))}

              {isLoading && (
                <p className="loading-message">Loading Workers...</p>
              )}

              {!isLoading && hasMore && (
                <button className="load-more-btn" onClick={handleLoadMore}>
                  Load More Workers
                </button>
              )}
            </Fragment>
          )}
        </div>
      )}
    </div>
  );
};
