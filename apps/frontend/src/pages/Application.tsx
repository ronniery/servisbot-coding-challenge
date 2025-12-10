import { Fragment, useCallback } from "react";

import type { Bot } from "@packages/shared";

import { BotCard } from "../components/BotCard";
import { useAccordion } from "../hooks/useAccordion";
import { usePagination } from "../hooks/usePagination";
import { BotService } from "../services/bot.service";

import "../styles.css";

export const Application = (): React.ReactElement => {
  const fetchBots = useCallback(
    (page: number) => BotService.getBots({ page, limit: 10 }),
    [],
  );

  const {
    items: bots,
    hasMore,
    isLoading,
    loadNext,
  } = usePagination<Bot>(fetchBots);

  const { toggle: toggleBotAccordion, isExpanded: isBotExpanded } =
    useAccordion();

  const {
    expandedId: expandedWorkerId,
    toggle: toggleWorkerAccordion,
    reset: resetWorkers,
  } = useAccordion();

  const handleLoadMore = (): void => {
    loadNext();
  };

  const toggleBot = (botId: string): void => {
    resetWorkers();
    toggleBotAccordion(botId);
  };

  const toggleWorker = (workerId: string): void => {
    toggleWorkerAccordion(workerId);
  };

  return (
    <div className="viewer-container">
      <header className="viewer-header">
        <h2>Bot Management</h2>
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
