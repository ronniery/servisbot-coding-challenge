import { beforeEach,describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { type Log,Worker } from '@packages/shared';
import { WorkerCard } from '@/components/WorkerCard';
import { BotService } from '@/services/bot.service';

type GetLogsResponse = Awaited<ReturnType<typeof BotService.getLogs>>;

vi.mock('@/components/LogList', async () => {
  const React = await import('react');
  return {
    LogList: React.forwardRef(({ logs }: { logs: Log[] }, ref: React.RefObject<HTMLDivElement>) => (
      <div data-testid="log-list" ref={ref}>
        {logs.map((log: Log) => <div key={log.id}>{log.message}</div>)}
      </div>
    )),
  };
});

vi.mock('@/services/bot.service', () => ({
  BotService: {
    getLogs: vi.fn(),
  },
}));

describe('WorkerCard', () => {
  const mockWorker: Worker = {
    id: 'worker-1',
    bot: 'bot-1',
    botId: 'bot-1',
    name: 'Test Worker',
    description: 'Description',
    created: 123456789,
  };

  const onToggleMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    Element.prototype.scrollTo = vi.fn();

    vi.mocked(BotService.getLogs).mockResolvedValue({
      data: [],
      pagination: { hasNext: false, total: 0, page: 1, limit: 10, totalPages: 0 },
    } as GetLogsResponse);
  });

  it('renders worker information', async () => {
    render(
      <WorkerCard
        botId="bot-1"
        worker={mockWorker}
        isExpanded={false}
        onToggle={onToggleMock}
      />
    );

    expect(screen.getByText('Test Worker')).toBeInTheDocument();
    expect(screen.getByText(/ID: worker-1.../)).toBeInTheDocument();
  });

  it('renders full worker ID when expanded', async () => {
    render(
      <WorkerCard
        botId="bot-1"
        worker={mockWorker}
        isExpanded={true}
        onToggle={onToggleMock}
      />
    );
    expect(screen.getByText('ID: worker-1')).toBeInTheDocument();
  });

  it('calls onToggle when header is clicked', async () => {
    render(
      <WorkerCard
        botId="bot-1"
        worker={mockWorker}
        isExpanded={false}
        onToggle={onToggleMock}
      />
    );

    fireEvent.click(screen.getByText('Test Worker'));
    expect(onToggleMock).toHaveBeenCalledWith('worker-1');
  });

  it('renders logs when expanded', async () => {
    vi.mocked(BotService.getLogs).mockResolvedValue({
      data: [{ id: 'l1', bot: 'bot-1', worker: 'worker-1', message: 'Log 1', created: 1234567890 }],
      pagination: { hasNext: false, total: 1, page: 1, limit: 10, totalPages: 1 },
    } as GetLogsResponse);

    render(
      <WorkerCard
        botId="bot-1"
        worker={mockWorker}
        isExpanded={true}
        onToggle={onToggleMock}
      />
    );

    await waitFor(() => {
     
      expect(screen.getByText('Log 1')).toBeInTheDocument();
    });
  });

  it('shows no logs message when expanded and empty', async () => {
  
    render(
      <WorkerCard
        botId="bot-1"
        worker={mockWorker}
        isExpanded={true}
        onToggle={onToggleMock}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No Logs found.')).toBeInTheDocument();
    });
  });

  it('shows load more logs button and loads more', async () => {
    // Verify duplicate keys don't happen by returning different data
    vi.mocked(BotService.getLogs).mockImplementation(async (botId, workerId, params) => {
      if (params?.page === 1) {
        return {
          data: [{ id: 'l1', bot: 'bot-1', worker: 'worker-1', message: 'Log 1', created: 1 }],
          pagination: { hasNext: true, total: 2, page: 1, limit: 10, totalPages: 2 },
        } as GetLogsResponse;
      }

      return {
        data: [{ id: 'l2', bot: 'bot-1', worker: 'worker-1', message: 'Log 2', created: 2 }],
        pagination: { hasNext: false, total: 2, page: 2, limit: 10, totalPages: 2 },
      } as GetLogsResponse;
    });

    render(
      <WorkerCard
        botId="bot-1"
        worker={mockWorker}
        isExpanded={true}
        onToggle={onToggleMock}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Load More Logs')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Load More Logs'));

    await waitFor(() => {
      expect(BotService.getLogs).toHaveBeenCalledTimes(2);
    });
  });

  it('renders fallback name if worker name is missing', async () => {
    const workerNoName = { ...mockWorker, name: '' };

    render(
      <WorkerCard
        botId="bot-1"
        worker={workerNoName}
        isExpanded={false}
        onToggle={onToggleMock}
      />
    );
    expect(screen.getByText('Worker work')).toBeInTheDocument();
  });

  it('scrolls to bottom when logs change', async () => {
    vi.mocked(BotService.getLogs).mockResolvedValue({
      data: [{ id: 'l1', bot: 'bot-1', worker: 'worker-1', message: 'Log 1', created: 1234567890 }],
      pagination: { hasNext: false, total: 1, page: 1, limit: 10, totalPages: 1 },
    } as GetLogsResponse);

    render(
      <WorkerCard
        botId="bot-1"
        worker={mockWorker}
        isExpanded={true}
        onToggle={onToggleMock}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Log 1')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(Element.prototype.scrollTo).toHaveBeenCalled();
    });
  });
});
