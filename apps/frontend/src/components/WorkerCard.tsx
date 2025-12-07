import React from "react";

import type { Worker, Log } from "@packages/shared";

import { BotService } from "../services/bot.service";
import { usePagination } from "../hooks/usePagination";
import { LogList } from "./LogList";

type WorkerCardProps = {
  botId: string;
  worker: Worker;
  isExpanded: boolean;
  onToggle: (workerId: string) => void;
};

export const WorkerCard: React.FC<WorkerCardProps> = ({
  botId,
  worker,
  isExpanded,
  onToggle,
}) => {
  const {
    items: logs,
    hasMore,
    isLoading,
    loadMore,
  } = usePagination<Log>(
    (page) => BotService.getLogs(botId, worker.id, { page, limit: 10 }),
    { enabled: isExpanded },
  );

  const handleLoadMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    loadMore();
  };

  return (
    <div className={`card worker-card ${isExpanded ? "expanded" : ""}`}>
      <div className="card-header" onClick={() => onToggle(worker.id)}>
        <div className="header-info">
          <h4 className="truncate-text">
            {worker.name || `Worker ${worker.id.substring(0, 4)}`}
          </h4>
          <p className="subtitle">
            ID: {isExpanded ? worker.id : `${worker.id.substring(0, 8)}...`}
          </p>
        </div>
        <span className="log-count">
          {logs.length > 0 ? `${logs.length}+ Logs` : ""}
        </span>
        <span className="toggle-icon">{isExpanded ? "▲" : "▼"}</span>
      </div>

      {isExpanded && (
        <div className="card-content">
          {logs.length === 0 && !isLoading ? (
            <p className="no-data">No Logs found.</p>
          ) : (
            <>
              <LogList logs={logs} />

              {isLoading && <p className="loading-message">Loading Logs...</p>}

              {!isLoading && hasMore && (
                <button className="load-more-btn" onClick={handleLoadMore}>
                  Load More Logs
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
