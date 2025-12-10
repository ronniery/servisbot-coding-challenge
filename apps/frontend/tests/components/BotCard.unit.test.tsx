import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { Bot,BotStatus } from '@packages/shared';
import { BotCard } from '@/components/BotCard';
import { BotService } from '@/services/bot.service';

type GetWorkersResponse = Awaited<ReturnType<typeof BotService.getWorkers>>;

vi.mock('@/components/WorkerCard', () => ({
  WorkerCard: ({ worker }) => <div data-testid="worker-card">{worker.name}</div>,
}));

vi.mock('@/services/bot.service', () => ({
  BotService: {
    getWorkers: vi.fn(),
  },
}));

describe('BotCard', () => {
  const mockBot: Bot = {
    id: 'bot-1',
    name: 'Test Bot',
    description: 'Description',
    status: BotStatus.ENABLED,
    created: 123456789,
  };

  const onToggleMock = vi.fn();
  const toggleWorkerMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(BotService.getWorkers).mockResolvedValue({
      data: [],
      pagination: { hasNext: false, total: 0, page: 1, limit: 10, totalPages: 0 },
    } as GetWorkersResponse);
  });

  it('renders bot information', async () => {
    render(
      <BotCard
        bot={mockBot}
        isExpanded={false}
        onToggle={onToggleMock}
        expandedWorkerId={null}
        toggleWorker={toggleWorkerMock}
      />
    );

    expect(screen.getByText('Test Bot')).toBeInTheDocument();
    expect(screen.getByText('ID: bot-1')).toBeInTheDocument();
    expect(screen.getByText('ENABLED')).toBeInTheDocument();
    expect(screen.getByText('▼')).toBeInTheDocument();

    await waitFor(() => expect(BotService.getWorkers).toHaveBeenCalled());
  });

  it('calls onToggle when header is clicked', async () => {
    render(
      <BotCard
        bot={mockBot}
        isExpanded={false}
        onToggle={onToggleMock}
        expandedWorkerId={null}
        toggleWorker={toggleWorkerMock}
      />
    );

    fireEvent.click(screen.getByText('Test Bot'));
    expect(onToggleMock).toHaveBeenCalledWith('bot-1');

    await waitFor(() => expect(BotService.getWorkers).toHaveBeenCalled());
  });

  it('renders workers when expanded', async () => {
    const mockWorkers = [
      { id: 'w1', name: 'Worker 1', bot: 'bot-1', description: 'd1', created: 1 },
      { id: 'w2', name: 'Worker 2', bot: 'bot-1', description: 'd2', created: 2 },
    ];

    vi.mocked(BotService.getWorkers).mockResolvedValue({
      data: mockWorkers,
      pagination: { hasNext: false, total: 2, page: 1, limit: 10, totalPages: 1 },
    } as GetWorkersResponse);

    render(
      <BotCard
        bot={mockBot}
        isExpanded={true}
        onToggle={onToggleMock}
        expandedWorkerId={null}
        toggleWorker={toggleWorkerMock}
      />
    );

    expect(screen.getByText('▲')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByTestId('worker-card')).toHaveLength(2);
    });

    expect(screen.getByText('Worker 1')).toBeInTheDocument();
    expect(screen.getByText('Worker 2')).toBeInTheDocument();
  });

  it('shows no data message if no workers', async () => {
    vi.mocked(BotService.getWorkers).mockResolvedValue({
      data: [],
      pagination: { hasNext: false, total: 0, page: 1, limit: 10, totalPages: 0 },
    } as GetWorkersResponse);

    render(
      <BotCard
        bot={mockBot}
        isExpanded={true}
        onToggle={onToggleMock}
        expandedWorkerId={null}
        toggleWorker={toggleWorkerMock}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No Workers found for this Bot.')).toBeInTheDocument();
    });
  });

  it('shows load more button if hasMore is true', async () => {
    vi.mocked(BotService.getWorkers).mockImplementation(async (_bid, params) => {
      if (params?.page === 1) {
        return {
          data: [{ id: 'w1', name: 'Worker 1', bot: 'bot-1', description: 'd1', created: 1 }],
          pagination: { hasNext: true, total: 2, page: 1, limit: 1, totalPages: 2 },
        } as GetWorkersResponse
      }

      return {
        data: [{ id: 'w2', name: 'Worker 2', bot: 'bot-1', description: 'd2', created: 2 }],
        pagination: { hasNext: false, total: 2, page: 2, limit: 1, totalPages: 2 },
      } as GetWorkersResponse;
    });

    render(
      <BotCard
        bot={mockBot}
        isExpanded={true}
        onToggle={onToggleMock}
        expandedWorkerId={null}
        toggleWorker={toggleWorkerMock}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Load More Workers')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Load More Workers'));

    await waitFor(() => {
      // Should be called twice (mount + load more)
      expect(BotService.getWorkers).toHaveBeenCalledTimes(2);
    });
  });

  it('renders DISABLED status correctly', () => {
    const disabledBot = { ...mockBot, status: BotStatus.DISABLED };

    render(
      <BotCard
        bot={disabledBot}
        isExpanded={false}
        onToggle={onToggleMock}
        expandedWorkerId={null}
        toggleWorker={toggleWorkerMock}
      />
    );

    const badge = screen.getByText('DISABLED');

    expect(badge).toHaveClass('status-error');
  });

  it('renders default (warning) status correctly', () => {
    const pausedBot = { ...mockBot, status: 'PAUSED' as BotStatus };

    render(
      <BotCard
        bot={pausedBot}
        isExpanded={false}
        onToggle={onToggleMock}
        expandedWorkerId={null}
        toggleWorker={toggleWorkerMock}
      />
    );

    const badge = screen.getByText('PAUSED');

    expect(badge).toHaveClass('status-warning');
  });
});
