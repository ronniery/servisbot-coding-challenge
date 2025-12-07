import React, { useState, useEffect } from "react";

import { BotStatus, type Bot, type Worker } from "@packages/shared";

import { BotService } from "../services/bot.service";
import { WorkerCard } from "./WorkerCard";
type BadgeProps = {
  status: BotStatus;
};

const Badge: React.FC<BadgeProps> = ({ status }) => {
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

type BotCardProps = {
  bot: Bot;
  isExpanded: boolean;
  onToggle: (botId: string) => void;
  expandedWorkerId: string | null;
  toggleWorker: (workerId: string) => void;
};

export const BotCard: React.FC<BotCardProps> = ({
  bot,
  isExpanded,
  onToggle,
  expandedWorkerId,
  toggleWorker,
}) => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (isExpanded && workers.length === 0) {
      loadWorkers(1, true);
    }
  }, [isExpanded]);

  const loadWorkers = (pageToLoad: number, reset: boolean = false) => {
    setIsLoadingWorkers(true);
    BotService.getWorkers(bot.id, { page: pageToLoad, limit: 10 }).then(
      (response) => {
        setWorkers((prev) =>
          reset ? response.data : [...prev, ...response.data],
        );
        setHasMore(response.pagination.hasNext);
        setPage(pageToLoad);
        setIsLoadingWorkers(false);
      },
    );
  };

  const handleLoadMore = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent toggling accordion
    loadWorkers(page + 1);
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
          {workers.length > 0 ? `${workers.length}+ Workers` : ""}
        </span>
        <span className="toggle-icon">{isExpanded ? "▲" : "▼"}</span>
      </div>

      {isExpanded && (
        <div className="card-content worker-list-container">
          {workers.length === 0 && !isLoadingWorkers ? (
            <p className="no-data">No Workers found for this Bot.</p>
          ) : (
            <>
              {workers.map((worker) => (
                <WorkerCard
                  key={worker.id}
                  botId={bot.id}
                  worker={worker}
                  isExpanded={worker.id === expandedWorkerId}
                  onToggle={toggleWorker}
                />
              ))}

              {isLoadingWorkers && (
                <p className="loading-message">Loading Workers...</p>
              )}

              {!isLoadingWorkers && hasMore && (
                <button className="load-more-btn" onClick={handleLoadMore}>
                  Load More Workers
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
