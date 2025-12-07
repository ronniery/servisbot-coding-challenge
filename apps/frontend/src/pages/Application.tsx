import React, { Fragment } from "react";

import type { Bot } from "@packages/shared";

import { BotService } from "../services/bot.service";
import { BotCard } from "../components/BotCard";
import { useAccordion } from "../hooks/useAccordion";
import { usePagination } from "../hooks/usePagination";
import "../styles.css";

export const Application: React.FC = () => {
  const {
    items: bots,
    hasMore,
    isLoading,
    loadMore,
  } = usePagination<Bot>((page) => BotService.getBots({ page, limit: 10 }));

  const { toggle: toggleBotAccordion, isExpanded: isBotExpanded } =
    useAccordion();
  const {
    expandedId: expandedWorkerId,
    toggle: toggleWorkerAccordion,
    reset: resetWorkers,
  } = useAccordion();

  const handleLoadMore = () => {
    loadMore();
  };

  const toggleBot = (botId: string) => {
    resetWorkers();
    toggleBotAccordion(botId);
  };

  const toggleWorker = (workerId: string) => {
    toggleWorkerAccordion(workerId);
  };

  return (
    <div className="viewer-container">
      <header className="viewer-header">
        <h1>⚙️ Bot Management</h1>
        <p>Real-time service hierarchy.</p>
      </header>

      <div className="bot-list">
        {bots.length === 0 && !isLoading ? (
          <p className="loading-message">No Bots found.</p>
        ) : (
          <Fragment>
            {bots.map((bot) => (
              <BotCard
                key={bot.id}
                bot={bot}
                isExpanded={isBotExpanded(bot.id)}
                onToggle={toggleBot}
                expandedWorkerId={expandedWorkerId}
                toggleWorker={toggleWorker}
              />
            ))}

            {isLoading && <p className="loading-message">Loading Bots...</p>}

            {!isLoading && hasMore && (
              <button className="load-more-btn" onClick={handleLoadMore}>
                Load More Bots
              </button>
            )}
          </Fragment>
        )}
      </div>
    </div>
  );
};
