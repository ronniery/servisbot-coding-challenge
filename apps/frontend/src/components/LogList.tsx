import { forwardRef } from "react";

import type { Log } from "@packages/shared";

type LogListProps = {
  logs: Log[];
};

export const LogList = forwardRef<HTMLDivElement, LogListProps>(
  ({ logs }, ref): React.ReactElement | null => {
    const formatTime = (createdAt: string | number): string => {
      return new Date(createdAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    if (logs.length === 0) {
      return <p className="no-data">No recent Logs.</p>;
    }

    return (
      <div className="log-list-container" ref={ref}>
        {logs.map((log) => (
          <div key={log.id} className={`log-entry`}>
            <span className="log-time">{formatTime(log.created)}</span>
            <p className="log-message truncate-text">{log.message}</p>
          </div>
        ))}
      </div>
    );
  },
);

LogList.displayName = "LogList";
