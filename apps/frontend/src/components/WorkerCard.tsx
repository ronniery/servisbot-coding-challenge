import React, { Fragment, useCallback, useEffect, useRef } from "react";

import type { Log, Worker } from "@packages/shared";

import { usePagination } from "../hooks/usePagination";
import { BotService } from "../services/bot.service";
import { LogList } from "./LogList";

type WorkerCardProps = {
  botId: string;
  worker: Worker;
  isExpanded: boolean;
  onToggle: (workerId: string) => void;
};

export const WorkerCard = ({
  botId,
  worker,
  isExpanded,
  onToggle,
}: WorkerCardProps): React.ReactElement => {
  const workerLogsRef = useRef<HTMLDivElement>(null);

  const fetchLogs = useCallback(
    (page: number) => BotService.getLogs(botId, worker.id, { page, limit: 10 }),
    [botId, worker.id],
  );

  const {
    items: logs,
    isPageEmpty,
    hasMore,
    isLoading,
    loadNext,
  } = usePagination<Log>(fetchLogs);

  useEffect(() => {
    if (workerLogsRef.current) {
      workerLogsRef.current.scrollTo({
        top: workerLogsRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [logs.length]);

  const handleLoadMore = (e: React.MouseEvent): void => {
    e.stopPropagation();

    loadNext();
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
          {isPageEmpty ? "" : `${logs.length}+ Logs`}
        </span>
        <span className="toggle-icon">{isExpanded ? "▲" : "▼"}</span>
      </div>

      {isExpanded && (
        <div className="card-content">
          {isPageEmpty && !isLoading ? (
            <p className="no-data">No Logs found.</p>
          ) : (
            <Fragment>
              <LogList logs={logs} ref={workerLogsRef} />

              {isLoading && <p className="loading-message">Loading Logs...</p>}

              {!isLoading && hasMore && (
                <button className="load-more-btn" onClick={handleLoadMore}>
                  Load More Logs
                </button>
              )}
            </Fragment>
          )}
        </div>
      )}
    </div>
  );
};
